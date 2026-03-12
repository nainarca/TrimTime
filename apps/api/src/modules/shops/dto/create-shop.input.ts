import { InputType, Field } from '@nestjs/graphql';
import { IsString, MaxLength, MinLength, IsOptional, IsTimeZone } from 'class-validator';

@InputType()
export class CreateShopInput {
  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ defaultValue: 'US' })
  @IsString()
  country: string;

  @Field({ defaultValue: 'America/New_York' })
  @IsTimeZone()
  timezone: string;

  @Field({ defaultValue: 'USD' })
  @IsString()
  currency: string;
}

@InputType()
export class UpdateShopInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  coverUrl?: string;
}
