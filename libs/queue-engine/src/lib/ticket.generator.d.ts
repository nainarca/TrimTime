/**
 * Formats a ticket number for display
 * e.g. 14 → "A014"
 */
export declare function formatTicket(num: number, prefix?: string): string;
/**
 * Returns the next ticket number (wraps at maxTicket)
 */
export declare function nextTicketNumber(current: number, maxTicket?: number): number;
/**
 * Generates a Redis key for a shop's daily ticket counter
 */
export declare function ticketCounterKey(shopId: string, date: string): string;
