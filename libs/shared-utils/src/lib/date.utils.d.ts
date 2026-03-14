/**
 * Converts minutes to human-readable wait time string
 * e.g. 75 → "1h 15m",  20 → "20 min"
 */
export declare function formatWaitTime(minutes: number): string;
/**
 * Returns the day of week label
 */
export declare function getDayLabel(dayIndex: number): string;
/**
 * Returns true if a given time (HH:MM) is within operating hours
 */
export declare function isWithinHours(currentTime: string, openTime: string, closeTime: string): boolean;
/**
 * Generates time slots between start and end with a given interval
 */
export declare function generateTimeSlots(startTime: string, endTime: string, intervalMins: number): string[];
