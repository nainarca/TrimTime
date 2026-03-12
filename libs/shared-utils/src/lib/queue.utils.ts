/**
 * Formats a ticket number for display
 * e.g. 14 → "A014"
 */
export function formatTicketNumber(num: number, prefix = 'A'): string {
  return `${prefix}${String(num).padStart(3, '0')}`;
}

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
export function calculateEwt(
  position: number,
  avgDuration: number,
  currentIsServing: boolean,
  elapsedMins = 0,
  bufferPercent = 15,
): number {
  const remainingCurrent = currentIsServing
    ? Math.max(0, avgDuration - elapsedMins)
    : 0;
  const base = remainingCurrent + (position - 1) * avgDuration;
  const withBuffer = base * (1 + bufferPercent / 100);
  return Math.ceil(withBuffer);
}

/**
 * Returns a queue status label for display
 */
export function getQueueStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    WAITING: 'Waiting',
    CALLED:  'Called — Please proceed!',
    SERVING: 'Being Served',
    SERVED:  'Served',
    NO_SHOW: 'Missed Turn',
    LEFT:    'Left Queue',
    REMOVED: 'Removed',
  };
  return labels[status] ?? status;
}
