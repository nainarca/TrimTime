import { Module, forwardRef, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { NotificationService } from './notification.service';
import { InAppChannel } from './channels/in-app.channel';
import { SmsChannel } from './channels/sms.channel';
import { PushChannel } from './channels/push.channel';
import { QueueModule } from '../queue/queue.module';
import { QueueGateway } from '../queue/queue.gateway';

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
@Module({
  imports: [forwardRef(() => QueueModule)],
  providers: [
    NotificationService,
    InAppChannel,
    SmsChannel,
    PushChannel,
  ],
  exports: [NotificationService],
})
export class NotificationModule implements OnModuleInit {
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly inApp: InAppChannel,
  ) {}

  /**
   * After all modules are initialised we can safely resolve QueueGateway
   * and inject it into InAppChannel without a circular dep at module load time.
   */
  onModuleInit(): void {
    const gateway = this.moduleRef.get(QueueGateway, { strict: false });
    this.inApp.setGateway(gateway);
  }
}
