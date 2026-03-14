/**
 * Generates a URL-safe slug from a shop name
 * e.g. "Mike's Barber Shop" → "mikes-barber-shop"
 */
export declare function generateSlug(name: string): string;
/**
 * Appends a short random suffix to make a slug unique
 * e.g. "barber-king" → "barber-king-x4f2"
 */
export declare function uniqueSlug(base: string): string;
