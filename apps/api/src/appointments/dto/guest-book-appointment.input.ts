import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsString,
  IsUUID,
  IsDateString,
  MinLength,
  Matches,
  IsOptional,
} from 'class-validator';

/** Public booking — creates/links customer by phone (no JWT). */
@InputType()
export class GuestBookAppointmentInput {
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
  serviceId: string;

  @Field()
  @IsDateString()
  scheduledAt: string;

  @Field()
  @IsString()
  @MinLength(1, { message: 'Name is required' })
  guestName: string;

  @Field()
  @IsString()
  @Matches(/^\+[1-9]\d{6,14}$/, {
    message: 'Phone must be E.164 (e.g. +919876543210)',
  })
  guestPhone: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}
