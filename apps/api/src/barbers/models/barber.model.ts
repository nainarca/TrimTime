import { ObjectType, Field, ID } from '@nestjs/graphql';

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

  @Field(() => ID, { nullable: true })
  branchId?: string | null;

  @Field()
  queueAccepting: boolean;

  @Field()
  maxQueueSize: number;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;
}
