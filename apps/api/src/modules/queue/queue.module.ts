import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueResolver } from './queue.resolver';
import { QUEUE_PUB_SUB, pubSub } from './queue.pubsub';

@Module({
  providers: [
    QueueService,
    QueueResolver,
    { provide: QUEUE_PUB_SUB, useValue: pubSub },
  ],
  exports: [QueueService],
})
export class QueueModule {}
