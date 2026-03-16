import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsDateString, IsInt, Min, IsUUID, IsString } from 'class-validator';

@InputType()
export class AppointmentInput {
  @Field(() => ID)
  @IsUUID()
  shopId: string;

  @Field(() => ID)
  @IsUUID()
  branchId: string;

  @Field(() => ID)
  @IsUUID()
  barberId: string;

  @Field(() => ID)
  @IsUUID()
  customerId: string;

  @Field(() => ID)
  @IsUUID()
  serviceId: string;

  @Field()
  @IsDateString()
  scheduledAt: string;

  @Field(() => Int)
  @IsInt()
  @Min(5)
  durationMins: number;

  @Field({ nullable: true })
  @IsString()
  notes?: string;
}
