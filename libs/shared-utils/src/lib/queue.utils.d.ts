/**
 * Formats a ticket number for display
 * e.g. 14 → "A014"
 */
export declare function formatTicketNumber(num: number, prefix?: string): string;
/**
 * Calculates Estimated Wait Time (EWT) in minutes
 *
 * Formula:
 *   EWT = (remaining time for current service) + (position - 1) * avgDuration
 *   Apply 15% buffer for real-world delays
 *
 * @param position       - 1-based position in queue (1 = next)
 * @param avgDuration    - Average service duration in minutes
 * @param currentIsServing - Whether barber is currently serving someone
 * @param elapsedMins    - How many minutes the current service has been running
 * @param bufferPercent  - Buffer percentage (default 15%)
 */
export declare function calculateEwt(position: number, avgDuration: number, currentIsServing: boolean, elapsedMins?: number, bufferPercent?: number): number;
/**
 * Returns a queue status label for display
 */
export declare function getQueueStatusLabel(status: string): string;
