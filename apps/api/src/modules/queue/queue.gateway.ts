import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';
import type { QueueEntry } from '@trimtime/shared-types';
import type { NotificationPayload } from '../notifications/types/notification.types';

// ─── Payload shape emitted by QueueService ───────────────────────────────────
export interface QueueUpdatedPayload {
  shopId: string;
  barberId: string | null;
  type: string;
  entry: QueueEntry | null;
  activeEntries: QueueEntry[];
}

// ─── Socket.io event names ────────────────────────────────────────────────────
export const WS_EVENTS = {
  QUEUE_UPDATED:       'QUEUE_UPDATED',
  NOW_SERVING_CHANGED: 'NOW_SERVING_CHANGED',
  NOTIFICATION:        'NOTIFICATION',
  JOINED_ROOM:         'JOINED_ROOM',
  ERROR:               'ERROR',
} as const;

@WebSocketGateway({
  // Use the /queue namespace to isolate from Apollo's WS endpoint
  namespace: '/queue',
  cors: {
    origin: [
      'http://localhost:4200', // admin-dashboard
      'http://localhost:4300', // customer-mobile
      'http://localhost:4400', // queue-display
    ],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class QueueGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private readonly server!: Server;

  private readonly logger = new Logger(QueueGateway.name);

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  afterInit(): void {
    this.logger.log('QueueGateway initialised on namespace /queue');
  }

  handleConnection(client: Socket): void {
    const shopId = (client.handshake.query['shopId'] as string)?.trim();

    if (!shopId) {
      this.logger.warn(`Client ${client.id} connected without shopId — disconnecting`);
      client.emit(WS_EVENTS.ERROR, { message: 'shopId query param is required' });
      client.disconnect(true);
      return;
    }

    const room = this.roomKey(shopId);
    void client.join(room);
    client.emit(WS_EVENTS.JOINED_ROOM, { room, shopId });
    this.logger.log(`Client ${client.id} joined room ${room}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  // ── Client-initiated room join (explicit, e.g. after auth) ──────────────────

  @SubscribeMessage('JOIN_SHOP')
  handleJoinShop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { shopId: string },
  ): void {
    const shopId = data?.shopId?.trim();
    if (!shopId) {
      client.emit(WS_EVENTS.ERROR, { message: 'shopId is required' });
      return;
    }
    const room = this.roomKey(shopId);
    void client.join(room);
    client.emit(WS_EVENTS.JOINED_ROOM, { room, shopId });
    this.logger.log(`Client ${client.id} explicitly joined room ${room}`);
  }

  @SubscribeMessage('LEAVE_SHOP')
  handleLeaveShop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { shopId: string },
  ): void {
    const shopId = data?.shopId?.trim();
    if (shopId) {
      void client.leave(this.roomKey(shopId));
    }
  }

  // ── Personal entry rooms (for targeted notifications) ───────────────────────

  /**
   * Customer joins their own personal room so they receive targeted
   * notifications (POSITION_UPDATE, NEXT_IN_LINE, NOW_SERVING).
   *
   * Called from the frontend immediately after loading a queue entry.
   */
  @SubscribeMessage('JOIN_ENTRY')
  handleJoinEntry(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { entryId: string },
  ): void {
    const entryId = data?.entryId?.trim();
    if (!entryId) {
      client.emit(WS_EVENTS.ERROR, { message: 'entryId is required' });
      return;
    }
    const room = this.entryRoomKey(entryId);
    void client.join(room);
    client.emit(WS_EVENTS.JOINED_ROOM, { room, entryId });
    this.logger.log(`Client ${client.id} joined personal room ${room}`);
  }

  @SubscribeMessage('LEAVE_ENTRY')
  handleLeaveEntry(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { entryId: string },
  ): void {
    const entryId = data?.entryId?.trim();
    if (entryId) {
      void client.leave(this.entryRoomKey(entryId));
    }
  }

  // ── Internal broadcast (called via EventEmitter) ────────────────────────────

  /**
   * Fired by QueueService after every recalculateQueue / status change.
   * Payload is the full QueueUpdatedPayload so the gateway can derive both
   * QUEUE_UPDATED and NOW_SERVING_CHANGED from a single event.
   */
  @OnEvent('queue.updated', { async: false })
  handleQueueUpdated(payload: QueueUpdatedPayload): void {
    const { shopId, activeEntries, entry } = payload;
    const room = this.roomKey(shopId);

    // ── 1. Broadcast full queue list ──────────────────────────────────────────
    this.server.to(room).emit(WS_EVENTS.QUEUE_UPDATED, {
      type: WS_EVENTS.QUEUE_UPDATED,
      shopId,
      data: activeEntries,
    });

    // ── 2. Broadcast now-serving change when a SERVING entry is present ───────
    const nowServing =
      entry?.status === 'SERVING'
        ? entry
        : activeEntries.find((e) => (e as any).status === 'SERVING') ?? null;

    if (nowServing) {
      this.server.to(room).emit(WS_EVENTS.NOW_SERVING_CHANGED, {
        type:  WS_EVENTS.NOW_SERVING_CHANGED,
        shopId,
        data:  nowServing,
      });
    }

    this.logger.debug(
      `Broadcast to ${room}: ${activeEntries.length} entries, ` +
      `nowServing=${(nowServing as any)?.ticketDisplay ?? 'none'}`,
    );
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private roomKey(shopId: string): string {
    return `shop:${shopId}`;
  }

  private entryRoomKey(entryId: string): string {
    return `entry:${entryId}`;
  }

  /** Broadcast to all clients watching a shop (queue list updates). */
  broadcastToShop(shopId: string, event: string, payload: unknown): void {
    this.server.to(this.roomKey(shopId)).emit(event, payload);
  }

  /**
   * Deliver a targeted notification to a single customer's personal room.
   * Called by InAppChannel after NotificationService builds the payload.
   */
  broadcastToEntry(entryId: string, payload: NotificationPayload): void {
    const room = this.entryRoomKey(entryId);
    this.server.to(room).emit(WS_EVENTS.NOTIFICATION, payload);
    this.logger.debug(
      `[NOTIFICATION] → ${room} | ${payload.type} | "${payload.title}"`,
    );
  }
}
