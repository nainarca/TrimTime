// ============================================================
// Ticket Number Generator
// ============================================================

/**
 * Formats a ticket number for display
 * e.g. 14 → "A014"
 */
export function formatTicket(num: number, prefix = 'A'): string {
  return `${prefix}${String(num).padStart(3, '0')}`;
}

/**
 * Returns the next ticket number (wraps at maxTicket)
 */
export function nextTicketNumber(current: number, maxTicket = 999): number {
  return current >= maxTicket ? 1 : current + 1;
}

/**
 * Generates a Redis key for a shop's daily ticket counter
 */
export function ticketCounterKey(shopId: string, date: string): string {
  // prefix includes shop to guarantee per-tenant isolation
  return `ticket_counter:${shopId}:${date}`;
}
