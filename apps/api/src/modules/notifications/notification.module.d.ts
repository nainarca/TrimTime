import { OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InAppChannel } from './channels/in-app.channel';
/**
 * NotificationModule wires together:
 *   - NotificationService  (event listeners + dispatch logic)
 *   - InAppChannel         (socket.io delivery via QueueGateway)
 *   - SmsChannel           (Twilio stub)
 *   - PushChannel          (FCM stub)
 *
 * forwardRef is used to break the circular dep:
 *   NotificationModule imports QueueModule for QueueGateway
 *   QueueModule does NOT import NotificationModule (uses EventEmitter instead)
 */
export declare class NotificationModule implements OnModuleInit {
    private readonly moduleRef;
    private readonly inApp;
    constructor(moduleRef: ModuleRef, inApp: InAppChannel);
    /**
     * After all modules are initialised we can safely resolve QueueGateway
     * and inject it into InAppChannel without a circular dep at module load time.
     */
    onModuleInit(): void;
}
