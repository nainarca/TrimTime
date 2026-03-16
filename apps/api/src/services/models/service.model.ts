import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class ServiceModel {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  shopId: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => Int)
  durationMins: number;

  @Field(() => Float)
  price: number;

  @Field()
  currency: string;

  @Field()
  isActive: boolean;
}
