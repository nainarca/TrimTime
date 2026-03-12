/**
 * Generates a URL-safe slug from a shop name
 * e.g. "Mike's Barber Shop" → "mikes-barber-shop"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Appends a short random suffix to make a slug unique
 * e.g. "barber-king" → "barber-king-x4f2"
 */
export function uniqueSlug(base: string): string {
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${generateSlug(base)}-${suffix}`;
}
