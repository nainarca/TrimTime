import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsBoolean, IsInt, IsOptional, IsString, IsUrl, IsUUID, Max, Min } from 'class-validator';

@InputType()
export class BarberInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  id?: string;

  @Field(() => ID)
  @IsUUID()
  shopId: string;

  @Field(() => ID)
  @IsUUID()
  userId: string;

  @Field()
  @IsString()
  displayName: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  bio?: string;

  @Field(() => String, { nullable: true, description: 'Profile photo URL or base64 data-URL' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @Field({ defaultValue: true })
  @IsBoolean()
  queueAccepting: boolean;

  @Field(() => Int, { defaultValue: 20 })
  @IsInt()
  @Min(1)
  @Max(100)
  maxQueueSize: number;

  @Field({ defaultValue: true })
  @IsBoolean()
  isActive: boolean;
}
