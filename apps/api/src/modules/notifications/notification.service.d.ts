import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { InAppChannel } from './channels/in-app.channel';
import { SmsChannel } from './channels/sms.channel';
import { PushChannel } from './channels/push.channel';
import { PositionChangedEvent, NextInLineEvent, QueueCalledEvent } from './types/notification.types';
export declare class NotificationService implements OnModuleInit {
    private readonly prisma;
    private readonly inApp;
    private readonly sms;
    private readonly push;
    private readonly logger;
    constructor(prisma: PrismaService, inApp: InAppChannel, sms: SmsChannel, push: PushChannel);
    onModuleInit(): void;
    /**
     * POSITION_CHANGED
     * Fires after every recalculateQueue() call for entries whose position moved.
     * Sends a quiet in-app banner (normal priority).
     *
     * Emitted by: QueueService.recalculateQueue()
     * Guarantee: broadcast has already been sent before this handler runs.
     */
    handlePositionChanged(evt: PositionChangedEvent): Promise<void>;
    /**
     * NEXT_IN_LINE
     * Fires when a customer's position reaches #1 (they're next up).
     * High-priority — plays sound on the frontend.
     *
     * Emitted by: QueueService.recalculateQueue()
     * Dedup: guarded by Redis SETNX in QueueService — fires at most once per entry.
     */
    handleNextInLine(evt: NextInLineEvent): Promise<void>;
    /**
     * QUEUE_CALLED
     * Fires when a barber explicitly calls a customer (status → CALLED).
     * Highest urgency — "Your turn!" with prominent sound.
     *
     * Emitted by: QueueService.updateStatus() — after recalculate + broadcast.
     */
    handleQueueCalled(evt: QueueCalledEvent): Promise<void>;
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
    private dispatch;
    private logToDatabase;
}
