// ============================================================
// EWT Engine — Estimated Wait Time Calculation
// ============================================================

export interface EwtInput {
  /** 1-based position of the customer in queue (1 = next up) */
  position: number;
  /** Barber's average service duration in minutes */
  avgServiceDurationMins: number;
  /** Whether the barber is currently serving someone */
  currentlyServing: boolean;
  /** How many minutes the current service has been running (0 if not serving) */
  currentServiceElapsedMins?: number;
  /** Buffer percentage to account for real-world variability (default: 15) */
  bufferPercent?: number;
}

export interface EwtResult {
  estimatedMins: number;
  breakdown: {
    currentServiceRemaining: number;
    waitForPosition: number;
    bufferMins: number;
  };
}

/**
 * Calculates the Estimated Wait Time for a customer at a given position.
 *
 * Formula:
 *   remaining_current = max(0, avgDuration - elapsed)   [if serving]
 *   base_wait = remaining_current + (position - 1) * avgDuration
 *   ewt = base_wait * (1 + buffer / 100)
 *
 * Examples:
 *   position=1, avg=20, serving=true, elapsed=5 → ~17 min (15 remaining + 0 ahead + 15% buffer)
 *   position=3, avg=20, serving=false           → ~46 min (0 + 40 ahead + 15% buffer)
 */
export function calculateEwt(input: EwtInput): EwtResult {
  const {
    position,
    avgServiceDurationMins,
    currentlyServing,
    currentServiceElapsedMins = 0,
    bufferPercent = 15,
  } = input;

  const currentServiceRemaining = currentlyServing
    ? Math.max(0, avgServiceDurationMins - currentServiceElapsedMins)
    : 0;

  const waitForPosition = (position - 1) * avgServiceDurationMins;
  const baseWait = currentServiceRemaining + waitForPosition;
  const bufferMins = Math.ceil(baseWait * (bufferPercent / 100));
  const estimatedMins = Math.max(1, baseWait + bufferMins);

  return {
    estimatedMins,
    breakdown: {
      currentServiceRemaining,
      waitForPosition,
      bufferMins,
    },
  };
}

/**
 * Recalculates EWT for all entries in a queue snapshot.
 * Returns a map of entryId → estimatedMins
 */
export function recalculateQueueEwt(
  entries: Array<{ id: string; position: number }>,
  avgServiceDurationMins: number,
  currentlyServing: boolean,
  currentServiceElapsedMins = 0,
): Map<string, number> {
  const result = new Map<string, number>();
  for (const entry of entries) {
    const { estimatedMins } = calculateEwt({
      position: entry.position,
      avgServiceDurationMins,
      currentlyServing,
      currentServiceElapsedMins,
    });
    result.set(entry.id, estimatedMins);
  }
  return result;
}
