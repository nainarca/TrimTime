import { OnModuleInit } from '@nestjs/common';
import { InAppChannel } from './channels/in-app.channel';
import { QueueGateway } from '../queue/queue.gateway';
/**
 * NotificationModule wires together:
 *   - NotificationService  (event listeners + dispatch orchestration)
 *   - InAppChannel         (socket.io delivery via QueueGateway)
 *   - SmsChannel           (Twilio — reads TWILIO_* env vars)
 *   - PushChannel          (FCM stub — reads FIREBASE_* env vars)
 *
 * Dependency graph:
 *   NotificationModule → QueueModule (for QueueGateway)
 *   QueueModule        → EventEmitter2 only (no import of NotificationModule)
 *
 * There is NO circular dependency at module level.
 * forwardRef is therefore not needed and has been removed.
 *
 * Injection flow:
 *   NestJS instantiates QueueModule (and QueueGateway inside it) first because
 *   NotificationModule declares it as an import.  By the time onModuleInit()
 *   runs on NotificationModule, QueueGateway is fully constructed and safe to
 *   pass into InAppChannel.
 */
export declare class NotificationModule implements OnModuleInit {
    private readonly inAppChannel;
    private readonly queueGateway;
    private readonly logger;
    constructor(inAppChannel: InAppChannel, queueGateway: QueueGateway);
    /**
     * Called after every provider in this module (and its imports) is
     * instantiated.  QueueGateway is guaranteed to exist at this point.
     *
     * We pass the gateway into InAppChannel here rather than in the constructor
     * so that InAppChannel itself has zero knowledge of QueueGateway — it only
     * knows about a slim { broadcastToEntry } interface.  This keeps the channel
     * testable in isolation.
     */
    onModuleInit(): void;
}
