import { InputType, Field, ID, Int, Float } from '@nestjs/graphql';
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Min, Max } from 'class-validator';

@InputType()
export class ServiceInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  id?: string;

  @Field(() => ID)
  @IsUUID()
  shopId: string;

  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  durationMins: number;

  @Field(() => Float)
  price: number;

  @Field({ defaultValue: 'USD' })
  @IsString()
  currency: string;

  @Field({ defaultValue: true })
  @IsBoolean()
  isActive: boolean;
}
