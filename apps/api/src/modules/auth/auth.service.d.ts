import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import { AuthResponse, OtpRequestResponse } from './dto/auth-response.type';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly config;
    private readonly logger;
    private readonly OTP_TTL;
    private readonly OTP_MAX_ATTEMPTS;
    private readonly OTP_LENGTH;
    private readonly LOCK_TTL;
    private readonly otpStore;
    private readonly otpAttempts;
    private readonly otpLocks;
    private readonly refreshTokens;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService);
    /** Fixed demo OTP in non-production; production always uses random codes + future SMS provider. */
    private resolveDemoStaticOtp;
    private logDemoOtpMode;
    /** E.164-ish: strip spaces so keys match request + verify. */
    private canonicalPhone;
    private isOtpLockActive;
    private getOtpLockTtlSeconds;
    private getOtpEntry;
    private getOtpAttempts;
    requestOtp(phone: string): Promise<OtpRequestResponse>;
    verifyOtp(phone: string, otp: string): Promise<AuthResponse>;
    login(username: string, password: string, role?: string): Promise<AuthResponse>;
    refreshToken(token: string): Promise<AuthResponse>;
    logout(userId: string): Promise<boolean>;
    private generateTokens;
}
