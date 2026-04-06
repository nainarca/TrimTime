import type { NotificationPayload } from '../types/notification.types';
/**
 * InAppChannel — delivers notifications instantly over the existing
 * socket.io /queue namespace by emitting to the customer's personal entry room.
 *
 * Architecture:
 *   NotificationService calls InAppChannel.send(payload).
 *   InAppChannel delegates to QueueGateway.broadcastToEntry(), which knows
 *   which socket.io room to target.
 *
 * The gateway is injected lazily (via setGateway) rather than in the
 * constructor so that InAppChannel has no compile-time dependency on
 * QueueGateway.  This keeps the channel independently testable: in unit tests
 * you can pass any object that implements { broadcastToEntry }.
 *
 * Wiring happens in NotificationModule.onModuleInit() — guaranteed to run
 * after all providers in QueueModule are constructed.
 */
export declare class InAppChannel {
    private readonly logger;
    private gateway;
    /**
     * Called once by NotificationModule.onModuleInit().
     * Accepts any object that implements broadcastToEntry so this channel
     * remains decoupled from QueueGateway's concrete type.
     */
    setGateway(gw: {
        broadcastToEntry(entryId: string, payload: NotificationPayload): void;
    }): void;
    send(payload: NotificationPayload): Promise<void>;
}
