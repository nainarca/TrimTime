import { InputType, Field, ID, Int } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsInt,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { EntryType } from '@trimtime/shared-types';

@InputType()
export class JoinQueueInput {
  @Field(() => ID)
  @IsUUID()
  shopId: string;

  @Field(() => ID)
  @IsUUID()
  branchId: string;

  @Field(() => ID, { nullable: true, description: 'Join a specific barber queue' })
  @IsOptional()
  @IsUUID()
  barberId?: string;

  @Field(() => EntryType, { defaultValue: 'WALK_IN' })
  @IsEnum(EntryType)
  entryType: EntryType;

  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  @Max(10)
  priority: number;

  // Guest (non-authenticated) fields
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  guestName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Matches(/^\+[1-9]\d{6,14}$/)
  guestPhone?: string;

  @Field(() => ID, { nullable: true, description: 'Link to an appointment' })
  @IsOptional()
  @IsUUID()
  appointmentId?: string;
}
