import { AuthService } from './auth.service';
import { RequestOtpInput } from './dto/request-otp.input';
import { VerifyOtpInput } from './dto/verify-otp.input';
import { LoginInput } from './dto/login.input';
import { AuthResponse, OtpRequestResponse } from './dto/auth-response.type';
import { User } from '@prisma/client';
export declare class AuthResolver {
    private readonly authService;
    constructor(authService: AuthService);
    requestOtp(input: RequestOtpInput): Promise<OtpRequestResponse>;
    verifyOtp(input: VerifyOtpInput): Promise<AuthResponse>;
    login(input: LoginInput): Promise<AuthResponse>;
    refreshToken(refreshToken: string): Promise<AuthResponse>;
    logout(user: User, _ctx: unknown): Promise<boolean>;
}
