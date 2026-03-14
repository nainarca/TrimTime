import { QueueStatus } from '@trimtime/shared-types';
/**
 * Returns true if a transition from `current` to `next` is valid.
 */
export declare function isValidTransition(current: QueueStatus, next: QueueStatus): boolean;
/**
 * Returns the list of valid next statuses from a given status.
 */
export declare function validNextStatuses(current: QueueStatus): QueueStatus[];
/**
 * Terminal statuses — no further transitions allowed
 */
export declare const TERMINAL_STATUSES: QueueStatus[];
export declare function isTerminalStatus(status: QueueStatus): boolean;
/**
 * Active statuses — entry is currently in the queue flow
 */
export declare const ACTIVE_STATUSES: QueueStatus[];
export declare function isActiveStatus(status: QueueStatus): boolean;
