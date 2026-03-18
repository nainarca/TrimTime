import { Injectable, Logger } from '@nestjs/common';
import type { NotificationPayload } from '../types/notification.types';

/**
 * In-app channel — delivers notifications instantly over the existing
 * socket.io /queue namespace by emitting to the entry's personal room.
 *
 * The actual socket.io emission is done by QueueGateway to avoid a
 * circular dependency.  This service acts as a thin wrapper that lets
 * NotificationService call one method without knowing about socket.io.
 */
@Injectable()
export class InAppChannel {
  private readonly logger = new Logger(InAppChannel.name);

  // Injected lazily to break the circular dep:
  //   NotificationModule → QueueModule → NotificationModule
  private gateway?: { broadcastToEntry(entryId: string, payload: NotificationPayload): void };

  /** Called by NotificationModule once QueueGateway is available. */
  setGateway(gw: {
    broadcastToEntry(entryId: string, payload: NotificationPayload): void;
  }): void {
    this.gateway = gw;
  }

  async send(payload: NotificationPayload): Promise<void> {
    if (!this.gateway) {
      this.logger.warn('InAppChannel: gateway not yet wired — dropping notification');
      return;
    }
    this.gateway.broadcastToEntry(payload.entryId, payload);
    this.logger.debug(
      `[IN-APP] → entry:${payload.entryId} | ${payload.type} | "${payload.title}"`,
    );
  }
}
