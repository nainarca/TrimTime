export declare class AuthResponse {
    accessToken: string;
    refreshToken: string;
    userId: string;
    isNewUser: boolean;
}
export declare class OtpRequestResponse {
    success: boolean;
    message: string;
    /** Seconds until OTP expires */
    expiresIn: number;
    otp?: string;
}
