import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import * as bcrypt from 'bcryptjs';
import { generateOtp, isOtpLocked } from '@trimtime/shared-utils';
import { JwtPayload } from '@trimtime/shared-types';
import { AuthResponse, OtpRequestResponse } from './dto/auth-response.type';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  private readonly OTP_TTL: number;
  private readonly OTP_MAX_ATTEMPTS: number;
  private readonly OTP_LENGTH: number;
  private readonly LOCK_TTL = 900; // 15 min lockout

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    this.OTP_TTL = this.config.get<number>('OTP_TTL_SECONDS', 300);
    this.OTP_MAX_ATTEMPTS = this.config.get<number>('OTP_MAX_ATTEMPTS', 3);
    this.OTP_LENGTH = this.config.get<number>('OTP_LENGTH', 6);
  }

  // ── Request OTP ───────────────────────────────────────────────────────────

  async requestOtp(phone: string): Promise<OtpRequestResponse> {
    // Check if phone is locked
    const lockKey = this.redis.otpLockKey(phone);
    const isLocked = await this.redis.exists(lockKey);
    if (isLocked) {
      const ttl = await this.redis.ttl(lockKey);
      throw new BadRequestException(
        `Too many attempts. Try again in ${Math.ceil(ttl / 60)} minutes.`,
      );
    }

    const otp = generateOtp(this.OTP_LENGTH);
    const otpHash = await bcrypt.hash(otp, 10);

    // Store hashed OTP with TTL
    const otpKey = this.redis.otpKey(phone);
    await this.redis.set(otpKey, otpHash, this.OTP_TTL);

    // Reset attempts
    await this.redis.del(this.redis.otpAttemptsKey(phone));

    // In development, log the OTP (never do this in production)
    if (this.config.get('NODE_ENV') !== 'production') {
      this.logger.debug(`OTP for ${phone}: ${otp}`);
    }

    // TODO: send via Twilio in production
    // await this.twilioService.sendSms(phone, `Your TrimTime code: ${otp}`);

    return {
      success: true,
      message: 'OTP sent successfully',
      expiresIn: this.OTP_TTL,
    };
  }

  // ── Verify OTP ────────────────────────────────────────────────────────────

  async verifyOtp(phone: string, otp: string): Promise<AuthResponse> {
    const lockKey = this.redis.otpLockKey(phone);
    const isLocked = await this.redis.exists(lockKey);
    if (isLocked) {
      throw new BadRequestException('Account temporarily locked. Try again later.');
    }

    const otpKey = this.redis.otpKey(phone);
    const storedHash = await this.redis.get(otpKey);
    if (!storedHash) {
      throw new BadRequestException('OTP expired or not found. Request a new one.');
    }

    // Track attempts
    const attemptsKey = this.redis.otpAttemptsKey(phone);
    const attemptsRaw = await this.redis.get(attemptsKey);
    const attempts = attemptsRaw ? parseInt(attemptsRaw, 10) : 0;

    if (isOtpLocked(attempts, this.OTP_MAX_ATTEMPTS)) {
      await this.redis.set(lockKey, '1', this.LOCK_TTL);
      await this.redis.del(otpKey, attemptsKey);
      throw new BadRequestException(
        'Too many failed attempts. Account locked for 15 minutes.',
      );
    }

    const isValid = await bcrypt.compare(otp, storedHash);
    if (!isValid) {
      const newAttempts = attempts + 1;
      await this.redis.set(attemptsKey, String(newAttempts), this.OTP_TTL);
      const remaining = this.OTP_MAX_ATTEMPTS - newAttempts;
      throw new BadRequestException(
        remaining > 0
          ? `Invalid OTP. ${remaining} attempt(s) remaining.`
          : 'Invalid OTP. Account will be locked.',
      );
    }

    // OTP valid — clean up
    await this.redis.del(otpKey, attemptsKey);

    // Upsert user
    let user = await this.prisma.user.findUnique({ where: { phone } });
    const isNewUser = !user;

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          isVerified: true,
          roles: {
            create: { role: 'CUSTOMER' },
          },
        },
      });
      this.logger.log(`New user created: ${user.id}`);
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
    }

    return this.generateTokens(user.id, isNewUser);
  }

  // ── Refresh token ─────────────────────────────────────────────────────────

  async refreshToken(token: string): Promise<AuthResponse> {
    let payload: JwtPayload;
    try {
      payload = this.jwt.verify<JwtPayload>(token, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Verify stored token matches
    const storedKey = this.redis.refreshTokenKey(payload.sub);
    const storedToken = await this.redis.get(storedKey);
    if (storedToken !== token) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return this.generateTokens(user.id, false);
  }

  // ── Logout ────────────────────────────────────────────────────────────────

  async logout(userId: string): Promise<boolean> {
    await this.redis.del(this.redis.refreshTokenKey(userId));
    return true;
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private async generateTokens(
    userId: string,
    isNewUser: boolean,
  ): Promise<AuthResponse> {
    const roleAssignments = await this.prisma.userRoleAssignment.findMany({
      where: { userId },
    });
    const roles = roleAssignments.map((r) => r.role) as JwtPayload['roles'];
    const shopIds = roleAssignments
      .filter((r) => r.shopId)
      .map((r) => r.shopId as string);

    const payload: JwtPayload = { sub: userId, roles, shopIds };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow('JWT_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRY', '15m'),
    });

    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRY', '30d'),
    });

    // Store refresh token in Redis (30d TTL)
    await this.redis.set(
      this.redis.refreshTokenKey(userId),
      refreshToken,
      60 * 60 * 24 * 30,
    );

    return { accessToken, refreshToken, userId, isNewUser };
  }
}
