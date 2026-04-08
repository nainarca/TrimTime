import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class BarberModel {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  shopId: string;

  @Field(() => ID)
  userId: string;

  @Field()
  displayName: string;

  @Field(() => String, { nullable: true })
  bio?: string | null;

  @Field(() => String, { nullable: true, description: 'Profile photo URL' })
  avatarUrl?: string | null;

  @Field(() => ID, { nullable: true })
  branchId?: string | null;

  @Field(() => Int)
  avgServiceDurationMins: number;

  @Field()
  queueAccepting: boolean;

  @Field(() => Int)
  maxQueueSize: number;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;
}
