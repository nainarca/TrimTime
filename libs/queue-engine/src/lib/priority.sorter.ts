// ============================================================
// Priority Sorter — Determines queue order
// ============================================================

export interface Sortable {
  id: string;
  priority: number;     // higher = served earlier
  joinedAt: Date | string;
  entryType: 'WALK_IN' | 'APPOINTMENT';
  appointmentTime?: Date | string; // only for APPOINTMENT entries
}

/**
 * Sorts queue entries by:
 *  1. Priority score (descending) — appointments get +1 boost
 *  2. Join time (ascending) — earlier join = earlier service
 *
 * Appointments near their scheduled time get a priority boost.
 */
export function sortQueueEntries<T extends Sortable>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    const priorityDiff = effectivePriority(b) - effectivePriority(a);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
  });
}

/**
 * Calculates effective priority score for sorting.
 * Appointments within 15 minutes of their scheduled time get +2 boost.
 */
function effectivePriority(entry: Sortable): number {
  let p = entry.priority;
  if (entry.entryType === 'APPOINTMENT' && entry.appointmentTime) {
    const now = Date.now();
    const apptTime = new Date(entry.appointmentTime).getTime();
    const diffMins = Math.abs(now - apptTime) / 60000;
    if (diffMins <= 15) p += 2; // on-time appointment — boost
    else if (diffMins <= 30) p += 1; // slightly early/late
  }
  return p;
}

/**
 * Assigns sequential 1-based positions to sorted entries.
 * Returns a map of entryId → position
 */
export function assignPositions(sortedEntries: Sortable[]): Map<string, number> {
  const positions = new Map<string, number>();
  sortedEntries.forEach((entry, index) => {
    positions.set(entry.id, index + 1);
  });
  return positions;
}
