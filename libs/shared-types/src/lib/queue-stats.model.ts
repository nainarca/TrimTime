import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType('QueueStatsModel')
export class QueueStatsModel {
  @Field(() => Int)
  waitingCount: number;

  @Field(() => Int)
  servingCount: number;

  @Field(() => Float, { nullable: true })
  avgWaitMins: number | null;

  @Field(() => Int)
  servedTodayCount: number;
}
