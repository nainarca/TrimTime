import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import type { QueueEntry } from '@trimtime/shared-types';
import type { NotificationPayload } from '../notifications/types/notification.types';
export interface QueueUpdatedPayload {
    shopId: string;
    barberId: string | null;
    type: string;
    entry: QueueEntry | null;
    activeEntries: QueueEntry[];
}
export declare const WS_EVENTS: {
    readonly QUEUE_UPDATED: "QUEUE_UPDATED";
    readonly NOW_SERVING_CHANGED: "NOW_SERVING_CHANGED";
    readonly NOTIFICATION: "NOTIFICATION";
    readonly JOINED_ROOM: "JOINED_ROOM";
    readonly ERROR: "ERROR";
};
export declare class QueueGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly server;
    private readonly logger;
    afterInit(): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinShop(client: Socket, data: {
        shopId: string;
    }): void;
    handleLeaveShop(client: Socket, data: {
        shopId: string;
    }): void;
    /**
     * Customer joins their own personal room so they receive targeted
     * notifications (POSITION_UPDATE, NEXT_IN_LINE, NOW_SERVING).
     *
     * Called from the frontend immediately after loading a queue entry.
     */
    handleJoinEntry(client: Socket, data: {
        entryId: string;
    }): void;
    handleLeaveEntry(client: Socket, data: {
        entryId: string;
    }): void;
    /**
     * Fired by QueueService after every recalculateQueue / status change.
     * Payload is the full QueueUpdatedPayload so the gateway can derive both
     * QUEUE_UPDATED and NOW_SERVING_CHANGED from a single event.
     */
    handleQueueUpdated(payload: QueueUpdatedPayload): void;
    private roomKey;
    private entryRoomKey;
    /** Broadcast to all clients watching a shop (queue list updates). */
    broadcastToShop(shopId: string, event: string, payload: unknown): void;
    /**
     * Deliver a targeted notification to a single customer's personal room.
     * Called by InAppChannel after NotificationService builds the payload.
     */
    broadcastToEntry(entryId: string, payload: NotificationPayload): void;
}
