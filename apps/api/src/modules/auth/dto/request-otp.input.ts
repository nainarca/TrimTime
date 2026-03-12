import { InputType, Field } from '@nestjs/graphql';
import { IsString, Matches } from 'class-validator';

@InputType()
export class RequestOtpInput {
  @Field()
  @IsString()
  @Matches(/^\+[1-9]\d{6,14}$/, { message: 'Phone must be in E.164 format (e.g. +1234567890)' })
  phone: string;
}
