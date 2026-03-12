import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class ShopModel {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => String, { nullable: true })
  logoUrl: string | null;

  @Field(() => String, { nullable: true })
  coverUrl: string | null;

  @Field()
  country: string;

  @Field()
  timezone: string;

  @Field()
  currency: string;

  @Field()
  isActive: boolean;

  @Field()
  isVerified: boolean;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class BranchModel {
  @Field(() => ID)
  id: string;

  @Field()
  shopId: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  address: string | null;

  @Field(() => String, { nullable: true })
  city: string | null;

  @Field(() => Float, { nullable: true })
  lat: number | null;

  @Field(() => Float, { nullable: true })
  lng: number | null;

  @Field()
  isMain: boolean;

  @Field()
  isActive: boolean;
}
