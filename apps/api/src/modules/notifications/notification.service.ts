import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationChannel as PrismaChannel } from '@prisma/client';
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
    private readonly inApp:  InAppChannel,
    private readonly sms:    SmsChannel,
    private readonly push:   PushChannel,
  ) {}

  onModuleInit(): void {
    this.logger.log('NotificationService ready — listening for queue domain events');
  }

  // ── Domain event listeners ──────────────────────────────────────────────────

  /**
   * POSITION_CHANGED
   * Fires after every recalculateQueue() call for entries whose position moved.
   * Sends a quiet in-app banner (normal priority).
   *
   * Emitted by: QueueService.recalculateQueue()
   * Guarantee: broadcast has already been sent before this handler runs.
   */
  @OnEvent(NOTIFICATION_EVENTS.POSITION_CHANGED)
  async handlePositionChanged(evt: PositionChangedEvent): Promise<void> {
    this.logger.debug(
      `handlePositionChanged → queueId:${evt.queueId} ` +
      `${evt.oldPosition}→${evt.newPosition} shop:${evt.shopId}`,
    );

    const payload = buildPositionUpdatePayload(evt);
    await this.dispatch(payload, evt.guestPhone ?? null);
  }

  /**
   * NEXT_IN_LINE
   * Fires when a customer's position reaches #1 (they're next up).
   * High-priority — plays sound on the frontend.
   *
   * Emitted by: QueueService.recalculateQueue()
   * Dedup: guarded by Redis SETNX in QueueService — fires at most once per entry.
   */
  @OnEvent(NOTIFICATION_EVENTS.NEXT_IN_LINE)
  async handleNextInLine(evt: NextInLineEvent): Promise<void> {
    this.logger.log(
      `handleNextInLine → queueId:${evt.queueId} ticket:${evt.ticketDisplay} shop:${evt.shopId}`,
    );

    const payload = buildNextInLinePayload(evt);
    await this.dispatch(payload, evt.guestPhone ?? null);
  }

  /**
   * QUEUE_CALLED
   * Fires when a barber explicitly calls a customer (status → CALLED).
   * Highest urgency — "Your turn!" with prominent sound.
   *
   * Emitted by: QueueService.updateStatus() — after recalculate + broadcast.
   */
  @OnEvent(NOTIFICATION_EVENTS.QUEUE_CALLED)
  async handleQueueCalled(evt: QueueCalledEvent): Promise<void> {
    this.logger.log(
      `handleQueueCalled → queueId:${evt.queueId} ticket:${evt.ticketDisplay} shop:${evt.shopId}`,
    );

    const payload = buildNowServingPayload(evt);
    await this.dispatch(payload, evt.guestPhone ?? null);
  }

  // ── Dispatch ────────────────────────────────────────────────────────────────

  /**
   * Routes a notification through all enabled channels.
   *
   * Channel priority:
   *   1. In-app  — always (sub-ms delivery over socket.io to the customer's device)
   *   2. SMS     — when guestPhone is present and TWILIO_* env vars are configured
   *   3. Push    — when the user has an FCM token (future — PushChannel is a stub)
   *
   * A failed channel never blocks the others.
   * DB logging is fire-and-forget so it cannot delay the delivery chain.
   */
  private async dispatch(
    payload:    NotificationPayload,
    guestPhone: string | null,
  ): Promise<void> {
    const channelsUsed: PrismaChannel[] = ['IN_APP' as PrismaChannel];

    const tasks: Promise<void>[] = [
      this.inApp.send(payload).catch((e) =>
        this.logger.error(`[IN-APP] channel error for ${payload.queueId}: ${e?.message}`),
      ),
    ];

    if (guestPhone) {
      channelsUsed.push(PrismaChannel.SMS);
      tasks.push(
        this.sms.send(payload, guestPhone).catch((e) =>
          this.logger.error(`[SMS] channel error for ${payload.queueId}: ${e?.message}`),
        ),
      );
    }

    await Promise.allSettled(tasks);

    // Persist one log row per channel (fire-and-forget — never blocks delivery)
    for (const channel of channelsUsed) {
      this.logToDatabase(payload, channel, guestPhone).catch((e) =>
        this.logger.error(`notification DB log failed for ${payload.queueId}: ${e?.message}`),
      );
    }
  }

  // ── DB logging ──────────────────────────────────────────────────────────────

  private async logToDatabase(
    payload:   NotificationPayload,
    channel:   PrismaChannel,
    recipient: string | null,
  ): Promise<void> {
    await this.prisma.notificationLog.create({
      data: {
        queueEntryId: payload.entryId,
        channel,
        eventType:    payload.type,
        recipient:    recipient ?? 'in-app',
        content:      payload.message,
        status:       'SENT',
        sentAt:       new Date(payload.timestamp),
      },
    });
  }
}
