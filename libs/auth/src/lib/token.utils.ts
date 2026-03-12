/**
 * Decodes a JWT payload without verification.
 * Verification must be done server-side.
 */
export function decodeJwt<T = Record<string, unknown>>(token: string): T | null {
  try {
    const base64 = token.split('.')[1];
    const decoded = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as T;
  } catch {
    return null;
  }
}

/**
 * Returns true if the JWT access token is expired.
 * Adds a 30-second buffer for clock skew.
 */
export function isTokenExpired(token: string, bufferSeconds = 30): boolean {
  const payload = decodeJwt<{ exp?: number }>(token);
  if (!payload?.exp) return true;
  return Date.now() / 1000 > payload.exp - bufferSeconds;
}

/**
 * Storage keys used across all apps
 */
export const TOKEN_KEYS = {
  ACCESS:  'trimtime_access_token',
  REFRESH: 'trimtime_refresh_token',
  USER:    'trimtime_user',
} as const;
