/**
 * Converts minutes to human-readable wait time string
 * e.g. 75 → "1h 15m",  20 → "20 min"
 */
export function formatWaitTime(minutes: number): string {
  if (minutes < 1) return 'Less than a minute';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/**
 * Returns the day of week label
 */
export function getDayLabel(dayIndex: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex] ?? '';
}

/**
 * Returns true if a given time (HH:MM) is within operating hours
 */
export function isWithinHours(
  currentTime: string,
  openTime: string,
  closeTime: string,
): boolean {
  const toMins = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const current = toMins(currentTime);
  return current >= toMins(openTime) && current <= toMins(closeTime);
}

/**
 * Generates time slots between start and end with a given interval
 */
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  intervalMins: number,
): string[] {
  const slots: string[] = [];
  const toMins = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const fromMins = (m: number) => {
    const h = Math.floor(m / 60);
    const min = m % 60;
    return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  };
  let current = toMins(startTime);
  const end = toMins(endTime);
  while (current + intervalMins <= end) {
    slots.push(fromMins(current));
    current += intervalMins;
  }
  return slots;
}
