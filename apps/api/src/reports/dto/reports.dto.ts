import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import { QueueStatsModel } from '@trimtime/shared-types';

@ObjectType()
export class ServiceUsage {
  @Field(() => ID)
  serviceId: string;

  @Field()
  serviceName: string;

  @Field(() => Int)
  usageCount: number;
}
