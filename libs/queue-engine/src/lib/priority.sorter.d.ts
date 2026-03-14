export interface Sortable {
    id: string;
    priority: number;
    joinedAt: Date | string;
    entryType: 'WALK_IN' | 'APPOINTMENT';
    appointmentTime?: Date | string;
}
/**
 * Sorts queue entries by:
 *  1. Priority score (descending) — appointments get +1 boost
 *  2. Join time (ascending) — earlier join = earlier service
 *
 * Appointments near their scheduled time get a priority boost.
 */
export declare function sortQueueEntries<T extends Sortable>(entries: T[]): T[];
/**
 * Assigns sequential 1-based positions to sorted entries.
 * Returns a map of entryId → position
 */
export declare function assignPositions(sortedEntries: Sortable[]): Map<string, number>;
