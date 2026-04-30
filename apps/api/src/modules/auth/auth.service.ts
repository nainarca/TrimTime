import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcryptjs';
import { generateOtp, isOtpLocked } from '@trimtime/shared-utils';
import { JwtPayload } from '@trimtime/shared-types';
import { AuthResponse, OtpRequestResponse } from './dto/auth-response.type';

interface OtpEntry {
  hash: string;
  expiresAt: number;
}

interface OtpAttemptEntry {
  count: number;
  expiresAt: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  private readonly OTP_TTL: number;
  private readonly OTP_MAX_ATTEMPTS: number;
  private readonly OTP_LENGTH: number;
  private readonly LOCK_TTL = 900; // 15 min lockout

  private readonly otpStore     = new Map<string, OtpEntry>();
  private readonly otpAttempts  = new Map<string, OtpAttemptEntry>();
  private readonly otpLocks     = new Map<string, number>(); // phone -> expiresAt ms
  private readonly refreshTokens = new Map<string, string>(); // userId -> token

  constructor(
    private readonly prisma:  PrismaService,
    private readonly jwt:     JwtService,
    private readonly config:  ConfigService,
  ) {
    this.OTP_TTL          = this.config.get<number>('OTP_TTL_SECONDS', 300);
    this.OTP_MAX_ATTEMPTS = this.config.get<number>('OTP_MAX_ATTEMPTS', 3);
    this.OTP_LENGTH       = this.config.get<number>('OTP_LENGTH', 6);
    this.logDemoOtpMode();
  }

  /** Fixed demo OTP in non-production; production always uses random codes + future SMS provider. */
  private resolveDemoStaticOtp(): string {
    if (this.config.get('NODE_ENV') === 'production') {
      return '';
    }
    const raw = this.config.get<string | undefined>('DEV_STATIC_OTP');
    if (raw === undefined) {
      return '123456';
    }
    return typeof raw === 'string' ? raw.trim() : '';
  }

  private logDemoOtpMode(): void {
    if (this.config.get('NODE_ENV') === 'production') {
      return;
    }
    const raw = this.config.get<string | undefined>('DEV_STATIC_OTP');
    if (raw === undefined) {
      this.logger.warn(
        'Demo OTP: DEV_STATIC_OTP unset — using default 123456. Set DEV_STATIC_OTP= for random codes. For production, use NODE_ENV=production + SMS (e.g. Twilio).',
      );
      return;
    }
    const t = typeof raw === 'string' ? raw.trim() : '';
    if (t.length >= 4 && /^\d+$/.test(t)) {
      this.logger.warn(
        'Demo OTP: DEV_STATIC_OTP is set — not for production. For go-live: NODE_ENV=production and real SMS.',
      );
    } else if (t === '') {
      this.logger.log('OTP: DEV_STATIC_OTP is empty — using random codes (still returned in API when not production).');
    }
  }

  /** E.164-ish: strip spaces so keys match request + verify. */
  private canonicalPhone(phone: string): string {
    return typeof phone === 'string' ? phone.replace(/\s/g, '').trim() : phone;
  }

  private isOtpLockActive(phone: string): boolean {
    const expiresAt = this.otpLocks.get(phone);
    if (!expiresAt) return false;
    if (Date.now() > expiresAt) {
      this.otpLocks.delete(phone);
      return false;
    }
    return true;
  }

  private getOtpLockTtlSeconds(phone: string): number {
    const expiresAt = this.otpLocks.get(phone);
    if (!expiresAt) return 0;
    return Math.ceil((expiresAt - Date.now()) / 1000);
  }

  private getOtpEntry(phone: string): OtpEntry | null {
    const entry = this.otpStore.get(phone);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.otpStore.delete(phone);
      return null;
    }
    return entry;
  }

  private getOtpAttempts(phone: string): number {
    const entry = this.otpAttempts.get(phone);
    if (!entry) return 0;
    if (Date.now() > entry.expiresAt) {
      this.otpAttempts.delete(phone);
      return 0;
    }
    return entry.count;
  }

  // ── Request OTP ───────────────────────────────────────────────────────────

  async requestOtp(phone: string): Promise<OtpRequestResponse> {
    phone = this.canonicalPhone(phone);

    if (this.isOtpLockActive(phone)) {
      const ttl = this.getOtpLockTtlSeconds(phone);
      throw new BadRequestException(
        `Too many attempts. Try again in ${Math.ceil(ttl / 60)} minutes.`,
      );
    }

    const staticOtp = this.resolveDemoStaticOtp();
    const otp =
      staticOtp.length >= 4 && /^\d+$/.test(staticOtp)
        ? staticOtp
        : generateOtp(this.OTP_LENGTH);
    const otpHash = await bcrypt.hash(otp, 10);

    this.otpStore.set(phone, { hash: otpHash, expiresAt: Date.now() + this.OTP_TTL * 1000 });
    this.otpAttempts.delete(phone);

    if (this.config.get('NODE_ENV') !== 'production') {
      this.logger.debug(`OTP for ${phone}: ${otp}`);
    }

    // TODO: send via Twilio in production
    // await this.twilioService.sendSms(phone, `Your TrimTime code: ${otp}`);

    return {
      success: true,
      message: 'OTP sent successfully',
      expiresIn: this.OTP_TTL,
      otp: this.config.get('NODE_ENV') !== 'production' ? otp : undefined,
    };
  }

  // ── Verify OTP ────────────────────────────────────────────────────────────

  async verifyOtp(phone: string, otp: string): Promise<AuthResponse> {
    phone = this.canonicalPhone(phone);
    otp   = typeof otp === 'string' ? otp.trim() : otp;

    if (this.isOtpLockActive(phone)) {
      throw new BadRequestException('Account temporarily locked. Try again later.');
    }

    const otpEntry = this.getOtpEntry(phone);
    if (!otpEntry) {
      throw new BadRequestException('OTP expired or not found. Request a new one.');
    }

    const attempts = this.getOtpAttempts(phone);

    if (isOtpLocked(attempts, this.OTP_MAX_ATTEMPTS)) {
      this.otpLocks.set(phone, Date.now() + this.LOCK_TTL * 1000);
      this.otpStore.delete(phone);
      this.otpAttempts.delete(phone);
      throw new BadRequestException(
        'Too many failed attempts. Account locked for 15 minutes.',
      );
    }

    const isValid = await bcrypt.compare(otp, otpEntry.hash);
    if (!isValid) {
      const newAttempts = attempts + 1;
      this.otpAttempts.set(phone, { count: newAttempts, expiresAt: Date.now() + this.OTP_TTL * 1000 });
      const remaining = this.OTP_MAX_ATTEMPTS - newAttempts;
      throw new BadRequestException(
        remaining > 0
          ? `Invalid OTP. ${remaining} attempt(s) remaining.`
          : 'Invalid OTP. Account will be locked.',
      );
    }

    // OTP valid — clean up
    this.otpStore.delete(phone);
    this.otpAttempts.delete(phone);

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

  // ── Login with username/password (demo) ───────────────────────────────────

  async login(
    username: string,
    password: string,
    role: string = 'ADMIN',
  ): Promise<AuthResponse> {
    const normalized = username.trim().toLowerCase();
    if (!normalized || !password || password.length < 4) {
      throw new BadRequestException('Invalid username or password');
    }

    const roleMap: Record<string, string> = {
      ADMIN: 'ADMIN',
      OWNER: 'SHOP_OWNER',
      STAFF: 'BARBER',
      CUSTOMER: 'CUSTOMER',
    };
    const roleToAssign = roleMap[role?.toUpperCase() ?? 'ADMIN'] ?? 'ADMIN';

    const user =
      (await this.prisma.user.findUnique({ where: { email: normalized } })) ||
      (await this.prisma.user.findUnique({ where: { phone: normalized } }));

    let authUser = user;
    let isNewUser = false;
    if (!authUser) {
      isNewUser = true;
      authUser = await this.prisma.user.create({
        data: {
          email: normalized,
          name: username,
          isVerified: true,
          roles: {
            create: [{ role: roleToAssign as any }],
          },
        },
      });
    } else {
      const existingRoles = await this.prisma.userRoleAssignment.findMany({
        where: { userId: authUser.id, role: roleToAssign as any },
      });
      if (!existingRoles.length) {
        await this.prisma.userRoleAssignment.create({
          data: { userId: authUser.id, role: roleToAssign as any },
        });
      }
    }

    return this.generateTokens(authUser.id, isNewUser);
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

    const storedToken = this.refreshTokens.get(payload.sub);
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
    this.refreshTokens.delete(userId);
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

    this.refreshTokens.set(userId, refreshToken);

    return { accessToken, refreshToken, userId, isNewUser };
  }
}
