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
     * Fires whenever a customer's position changes after a recalculation.
     * Sends a "queue update" in-app toast (quiet, normal priority).
     */
    handlePositionChanged(evt: PositionChangedEvent): Promise<void>;
    /**
     * Fires when a customer reaches position #1.
     * High-priority alert — plays sound on the frontend.
     */
    handleNextInLine(evt: NextInLineEvent): Promise<void>;
    /**
     * Fires when a barber explicitly calls a customer (status → CALLED).
     * Highest urgency — "Your turn!" with sound.
     */
    handleQueueCalled(evt: QueueCalledEvent): Promise<void>;
    /**
     * Routes a notification through all enabled channels and logs it to the DB.
     *
     * Channel priority:
     *   1. In-app  — always, instant (sub-ms over socket.io)
     *   2. SMS     — when guestPhone present and TWILIO_* env vars set
     *   3. Push    — when user has an FCM token (future)
     */
    private dispatch;
    private logToDatabase;
}
