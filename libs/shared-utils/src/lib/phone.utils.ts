/**
 * Normalizes a phone number to E.164 format.
 * e.g. "0501234567" (SA) → "+966501234567"
 */
export function normalizePhone(phone: string, defaultCountryCode = '966'): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.startsWith('00')) return `+${digits.slice(2)}`;
  if (digits.startsWith('0')) return `+${defaultCountryCode}${digits.slice(1)}`;
  return `+${defaultCountryCode}${digits}`;
}

/**
 * Masks a phone number for display: "+966501****67"
 */
export function maskPhone(phone: string): string {
  if (phone.length <= 6) return phone;
  const start = phone.slice(0, phone.length - 6);
  const end = phone.slice(-2);
  return `${start}****${end}`;
}

/**
 * Validates a phone number is in E.164 format
 */
export function isValidE164(phone: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(phone);
}
