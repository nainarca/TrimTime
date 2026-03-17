import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { AuthResponse, OtpRequestResponse } from './dto/auth-response.type';
export declare class AuthService {
    private readonly prisma;
    private readonly redis;
    private readonly jwt;
    private readonly config;
    private readonly logger;
    private readonly OTP_TTL;
    private readonly OTP_MAX_ATTEMPTS;
    private readonly OTP_LENGTH;
    private readonly LOCK_TTL;
    constructor(prisma: PrismaService, redis: RedisService, jwt: JwtService, config: ConfigService);
    requestOtp(phone: string): Promise<OtpRequestResponse>;
    verifyOtp(phone: string, otp: string): Promise<AuthResponse>;
    login(username: string, password: string, role?: string): Promise<AuthResponse>;
    refreshToken(token: string): Promise<AuthResponse>;
    logout(userId: string): Promise<boolean>;
    private generateTokens;
}
