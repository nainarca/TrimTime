/**
 * Generates a numeric OTP of specified length
 */
export declare function generateOtp(length?: number): string;
/**
 * Checks if OTP attempt count exceeds maximum
 */
export declare function isOtpLocked(attempts: number, maxAttempts?: number): boolean;
