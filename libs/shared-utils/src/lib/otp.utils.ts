/**
 * Generates a numeric OTP of specified length
 */
export function generateOtp(length = 6): string {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

/**
 * Checks if OTP attempt count exceeds maximum
 */
export function isOtpLocked(attempts: number, maxAttempts = 3): boolean {
  return attempts >= maxAttempts;
}
