import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationChannel } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { InAppChannel } from './channels/in-app.channel';
import { SmsChannel } from './channels/sms.channel';
import { PushChannel } from './channels/push.channel';
import {
  NOTIFICATION_EVENTS,
  NotificationPayload,
  PositionChangedEvent,
  NextInLineEvent,
  QueueCalledEvent,
  buildPositionUpdatePayload,
  buildNextInLinePayload,
  buildNowServingPayload,
} from './types/notification.types';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly inApp: InAppChannel,
    private readonly sms: SmsChannel,
    private readonly push: PushChannel,
  ) {}

  onModuleInit(): void {
    this.logger.log('NotificationService ready');
  }

  // ── Domain event listeners ──────────────────────────────────────────────────

  /**
   * Fires whenever a customer's position changes after a recalculation.
   * Sends a "queue update" in-app toast (quiet, normal priority).
   */
  @OnEvent(NOTIFICATION_EVENTS.POSITION_CHANGED)
  async handlePositionChanged(evt: PositionChangedEvent): Promise<void> {
    const payload = buildPositionUpdatePayload(evt);
    await this.dispatch(payload, evt.guestPhone);
  }

  /**
   * Fires when a customer reaches position #1.
   * High-priority alert — plays sound on the frontend.
   */
  @OnEvent(NOTIFICATION_EVENTS.NEXT_IN_LINE)
  async handleNextInLine(evt: NextInLineEvent): Promise<void> {
    const payload = buildNextInLinePayload(evt);
    await this.dispatch(payload, evt.guestPhone);
  }

  /**
   * Fires when a barber explicitly calls a customer (status → CALLED).
   * Highest urgency — "Your turn!" with sound.
   */
  @OnEvent(NOTIFICATION_EVENTS.QUEUE_CALLED)
  async handleQueueCalled(evt: QueueCalledEvent): Promise<void> {
    const payload = buildNowServingPayload(evt);
    await this.dispatch(payload, evt.guestPhone);
  }

  // ── Dispatch ────────────────────────────────────────────────────────────────

  /**
   * Routes a notification through all enabled channels and logs it to the DB.
   *
   * Channel priority:
   *   1. In-app  — always, instant (sub-ms over socket.io)
   *   2. SMS     — when guestPhone present and TWILIO_* env vars set
   *   3. Push    — when user has an FCM token (future)
   */
  private async dispatch(
    payload: NotificationPayload,
    guestPhone?: string | null,
  ): Promise<void> {
    // Run channels concurrently — a failed channel must never block the others
    const tasks: Promise<void>[] = [
      this.inApp.send(payload).catch((e) =>
        this.logger.error(`in-app channel error: ${e?.message}`),
      ),
    ];

    if (guestPhone) {
      tasks.push(
        this.sms.send(payload, guestPhone).catch((e) =>
          this.logger.error(`SMS channel error: ${e?.message}`),
        ),
      );
    }

    await Promise.allSettled(tasks);

    // Persist notification log (fire-and-forget, never blocks the chain)
    this.logToDatabase(payload, guestPhone).catch((e) =>
      this.logger.error(`notification DB log failed: ${e?.message}`),
    );
  }

  // ── DB logging ──────────────────────────────────────────────────────────────

  private async logToDatabase(
    payload: NotificationPayload,
    recipient?: string | null,
  ): Promise<void> {
    await this.prisma.notificationLog.create({
      data: {
        queueEntryId: payload.entryId,
        channel:      NotificationChannel.IN_APP,
        eventType:    payload.type,
        recipient:    recipient ?? 'in-app',
        content:      payload.message,
        status:       'SENT',
        sentAt:       new Date(payload.timestamp),
      },
    });
  }
}
