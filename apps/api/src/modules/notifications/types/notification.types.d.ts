export declare const NotificationType: {
    readonly POSITION_UPDATE: "POSITION_UPDATE";
    readonly NEXT_IN_LINE: "NEXT_IN_LINE";
    readonly NOW_SERVING: "NOW_SERVING";
};
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];
export declare const NotificationChannel: {
    readonly IN_APP: "IN_APP";
    readonly SMS: "SMS";
    readonly PUSH: "PUSH";
    readonly EMAIL: "EMAIL";
};
export type NotificationChannel = (typeof NotificationChannel)[keyof typeof NotificationChannel];
export interface NotificationPayload {
    /** Unique id — used on the frontend to deduplicate toasts */
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    /**
     * The queue entry this notification is about.
     * Exposed as both `queueId` (canonical field, matches frontend API contract)
     * and `entryId` (internal alias, used by InAppChannel for room routing).
     */
    queueId: string;
    entryId: string;
    shopId: string;
    /** Opaque extras (position numbers, EWT, etc.) */
    data?: Record<string, unknown>;
    /** 'high' = play sound + prominent UI, 'normal' = quiet banner */
    priority: 'high' | 'normal';
    timestamp: string;
}
export interface PositionChangedEvent {
    queueId: string;
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
    queueId: string;
    entryId: string;
    shopId: string;
    ticketDisplay: string;
    guestPhone?: string | null;
    guestName?: string | null;
    estimatedWaitMins: number | null;
}
export interface QueueCalledEvent {
    queueId: string;
    entryId: string;
    shopId: string;
    ticketDisplay: string;
    guestPhone?: string | null;
    guestName?: string | null;
}
export declare const NOTIFICATION_EVENTS: {
    readonly POSITION_CHANGED: "notification.position.changed";
    readonly NEXT_IN_LINE: "notification.queue.next";
    readonly QUEUE_CALLED: "notification.queue.called";
};
export declare function buildPositionUpdatePayload(evt: PositionChangedEvent): NotificationPayload;
export declare function buildNextInLinePayload(evt: NextInLineEvent): NotificationPayload;
export declare function buildNowServingPayload(evt: QueueCalledEvent): NotificationPayload;
