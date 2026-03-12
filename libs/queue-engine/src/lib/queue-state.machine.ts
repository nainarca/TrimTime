import { QueueStatus } from '@trimtime/shared-types';

// ============================================================
// Queue Entry State Machine
// Defines valid transitions for a queue entry's status
// ============================================================

type Transition = {
  from: QueueStatus;
  to: QueueStatus[];
};

const TRANSITIONS: Transition[] = [
  { from: QueueStatus.WAITING,  to: [QueueStatus.CALLED,  QueueStatus.LEFT,   QueueStatus.REMOVED] },
  { from: QueueStatus.CALLED,   to: [QueueStatus.SERVING, QueueStatus.NO_SHOW, QueueStatus.REMOVED] },
  { from: QueueStatus.SERVING,  to: [QueueStatus.SERVED,  QueueStatus.REMOVED] },
  { from: QueueStatus.SERVED,   to: [] },
  { from: QueueStatus.NO_SHOW,  to: [] },
  { from: QueueStatus.LEFT,     to: [] },
  { from: QueueStatus.REMOVED,  to: [] },
];

const transitionMap = new Map<QueueStatus, QueueStatus[]>(
  TRANSITIONS.map((t) => [t.from, t.to]),
);

/**
 * Returns true if a transition from `current` to `next` is valid.
 */
export function isValidTransition(current: QueueStatus, next: QueueStatus): boolean {
  return transitionMap.get(current)?.includes(next) ?? false;
}

/**
 * Returns the list of valid next statuses from a given status.
 */
export function validNextStatuses(current: QueueStatus): QueueStatus[] {
  return transitionMap.get(current) ?? [];
}

/**
 * Terminal statuses — no further transitions allowed
 */
export const TERMINAL_STATUSES: QueueStatus[] = [
  QueueStatus.SERVED,
  QueueStatus.NO_SHOW,
  QueueStatus.LEFT,
  QueueStatus.REMOVED,
];

export function isTerminalStatus(status: QueueStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

/**
 * Active statuses — entry is currently in the queue flow
 */
export const ACTIVE_STATUSES: QueueStatus[] = [
  QueueStatus.WAITING,
  QueueStatus.CALLED,
  QueueStatus.SERVING,
];

export function isActiveStatus(status: QueueStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}
