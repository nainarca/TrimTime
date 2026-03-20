import type { NotificationPayload } from '../types/notification.types';
/**
 * In-app channel — delivers notifications instantly over the existing
 * socket.io /queue namespace by emitting to the entry's personal room.
 *
 * The actual socket.io emission is done by QueueGateway to avoid a
 * circular dependency.  This service acts as a thin wrapper that lets
 * NotificationService call one method without knowing about socket.io.
 */
export declare class InAppChannel {
    private readonly logger;
    private gateway?;
    /** Called by NotificationModule once QueueGateway is available. */
    setGateway(gw: {
        broadcastToEntry(entryId: string, payload: NotificationPayload): void;
    }): void;
    send(payload: NotificationPayload): Promise<void>;
}
