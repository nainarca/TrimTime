/**
 * Normalizes a phone number to E.164 format.
 * e.g. "0501234567" (SA) → "+966501234567"
 */
export declare function normalizePhone(phone: string, defaultCountryCode?: string): string;
/**
 * Masks a phone number for display: "+966501****67"
 */
export declare function maskPhone(phone: string): string;
/**
 * Validates a phone number is in E.164 format
 */
export declare function isValidE164(phone: string): boolean;
