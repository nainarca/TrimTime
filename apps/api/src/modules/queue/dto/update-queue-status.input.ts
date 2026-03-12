import { InputType, Field, ID } from '@nestjs/graphql';
import { IsUUID, IsEnum } from 'class-validator';
import { QueueStatus } from '@trimtime/shared-types';

@InputType()
export class UpdateQueueStatusInput {
  @Field(() => ID)
  @IsUUID()
  entryId: string;

  @Field(() => QueueStatus)
  @IsEnum(QueueStatus)
  newStatus: QueueStatus;
}
