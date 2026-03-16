import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class AppointmentModel {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  shopId: string;

  @Field(() => ID)
  branchId: string;

  @Field(() => ID)
  barberId: string;

  @Field(() => ID)
  customerId: string;

  @Field(() => ID)
  serviceId: string;

  @Field()
  scheduledAt: Date;

  @Field(() => Int)
  durationMins: number;

  @Field()
  status: string;

  @Field({ nullable: true })
  notes?: string;
}
