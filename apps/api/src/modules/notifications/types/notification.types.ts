// ─────────────────────────────────────────────────────────────────────────────
// Notification Types — shared across NestJS modules
// ─────────────────────────────────────────────────────────────────────────────

import { v4 as uuid } from 'uuid';

// ── Notification type discriminator ──────────────────────────────────────────

export const NotificationType = {
  POSITION_UPDATE: 'POSITION_UPDATE', // queue position shifted
  NEXT_IN_LINE:    'NEXT_IN_LINE',    // customer is #1 (next to be called)
  NOW_SERVING:     'NOW_SERVING',     // barber called this customer
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

// ── Channel discriminator ─────────────────────────────────────────────────────

export const NotificationChannel = {
  IN_APP: 'IN_APP',
  SMS:    'SMS',
  PUSH:   'PUSH',
  EMAIL:  'EMAIL',
} as const;

export type NotificationChannel =
  (typeof NotificationChannel)[keyof typeof NotificationChannel];

// ── Core notification payload (sent over socket.io to the customer) ───────────

export interface NotificationPayload {
  /** Unique id — used on the frontend to deduplicate */
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  /** Relevant queue entry */
  entryId: string;
  shopId: string;
  /** Opaque extras (position numbers, EWT, etc.) */
  data?: Record<string, unknown>;
  /** 'high' = play sound + prominent UI, 'normal' = quiet banner */
  priority: 'high' | 'normal';
  timestamp: string; // ISO-8601
}

// ── Domain events emitted by QueueService via EventEmitter2 ──────────────────

export interface PositionChangedEvent {
  entryId: string;
  shopId: string;
  ticketDisplay: string;
  guestPhone?: string | null;
  guestName?: string | null;
  oldPosition: number;
  newPosition: number;
  estimatedWaitMins: number | null;
}

export interface NextInLineEvent {
  entryId: string;
  shopId: string;
  ticketDisplay: string;
  guestPhone?: string | null;
  guestName?: string | null;
  estimatedWaitMins: number | null;
}

export interface QueueCalledEvent {
  entryId: string;
  shopId: string;
  ticketDisplay: string;
  guestPhone?: string | null;
  guestName?: string | null;
}

// ── Notification domain events map ────────────────────────────────────────────

export const NOTIFICATION_EVENTS = {
  POSITION_CHANGED: 'notification.position.changed',
  NEXT_IN_LINE:     'notification.queue.next',
  QUEUE_CALLED:     'notification.queue.called',
} as const;

// ── Factory helpers ───────────────────────────────────────────────────────────

export function buildPositionUpdatePayload(evt: PositionChangedEvent): NotificationPayload {
  return {
    id:       uuid(),
    type:     NotificationType.POSITION_UPDATE,
    title:    'Queue update',
    message:  `You moved to position #${evt.newPosition} — ` +
              (evt.estimatedWaitMins != null
                ? `about ${evt.estimatedWaitMins} min remaining`
                : 'hang tight!'),
    entryId:  evt.entryId,
    shopId:   evt.shopId,
    priority: 'normal',
    data: {
      ticketDisplay:     evt.ticketDisplay,
      oldPosition:       evt.oldPosition,
      newPosition:       evt.newPosition,
      estimatedWaitMins: evt.estimatedWaitMins,
    },
    timestamp: new Date().toISOString(),
  };
}

export function buildNextInLinePayload(evt: NextInLineEvent): NotificationPayload {
  return {
    id:       uuid(),
    type:     NotificationType.NEXT_IN_LINE,
    title:    "You're next!",
    message:  `Ticket ${evt.ticketDisplay} — get ready, you'll be called soon!`,
    entryId:  evt.entryId,
    shopId:   evt.shopId,
    priority: 'high',
    data: {
      ticketDisplay:     evt.ticketDisplay,
      estimatedWaitMins: evt.estimatedWaitMins,
    },
    timestamp: new Date().toISOString(),
  };
}

export function buildNowServingPayload(evt: QueueCalledEvent): NotificationPayload {
  return {
    id:       uuid(),
    type:     NotificationType.NOW_SERVING,
    title:    'Your turn! ✂',
    message:  `Ticket ${evt.ticketDisplay} — please proceed to your barber now.`,
    entryId:  evt.entryId,
    shopId:   evt.shopId,
    priority: 'high',
    data:     { ticketDisplay: evt.ticketDisplay },
    timestamp: new Date().toISOString(),
  };
}
