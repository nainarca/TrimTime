import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueResolver } from './queue.resolver';
import { QueueGateway } from './queue.gateway';
import { QUEUE_PUB_SUB, pubSub } from './queue.pubsub';

@Module({
  providers: [
    QueueService,
    QueueResolver,
    QueueGateway,
    { provide: QUEUE_PUB_SUB, useValue: pubSub },
  ],
  exports: [QueueService, QueueGateway],
})
export class QueueModule {}
