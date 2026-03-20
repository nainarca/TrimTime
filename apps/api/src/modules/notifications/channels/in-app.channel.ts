import { Injectable, Logger } from '@nestjs/common';
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
@Injectable()
export class InAppChannel {
  private readonly logger = new Logger(InAppChannel.name);

  private gateway: { broadcastToEntry(entryId: string, payload: NotificationPayload): void } | null = null;

  // ── Gateway injection ─────────────────────────────────────────────────────

  /**
   * Called once by NotificationModule.onModuleInit().
   * Accepts any object that implements broadcastToEntry so this channel
   * remains decoupled from QueueGateway's concrete type.
   */
  setGateway(gw: { broadcastToEntry(entryId: string, payload: NotificationPayload): void }): void {
    this.gateway = gw;
    this.logger.log('Gateway registered — InAppChannel is live');
  }

  // ── Delivery ──────────────────────────────────────────────────────────────

  async send(payload: NotificationPayload): Promise<void> {
    if (!this.gateway) {
      // This should never happen in production: setGateway() is called during
      // module init, before any queue event can fire.  If it does happen it
      // means onModuleInit() didn't run — likely a test or misconfiguration.
      this.logger.error(
        `[IN-APP] Gateway not wired — notification dropped. ` +
        `type:${payload.type} queueId:${payload.queueId}`,
      );
      return;
    }

    this.gateway.broadcastToEntry(payload.entryId, payload);

    this.logger.debug(
      `[IN-APP] ✓ entry:${payload.entryId} | ${payload.type} | "${payload.title}"`,
    );
  }
}
