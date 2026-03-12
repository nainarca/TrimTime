import { InputType, Field } from '@nestjs/graphql';
import { IsString, Length, Matches } from 'class-validator';

@InputType()
export class VerifyOtpInput {
  @Field()
  @IsString()
  @Matches(/^\+[1-9]\d{6,14}$/, { message: 'Phone must be in E.164 format' })
  phone: string;

  @Field()
  @IsString()
  @Length(6, 6, { message: 'OTP must be 6 digits' })
  @Matches(/^\d{6}$/, { message: 'OTP must be numeric' })
  otp: string;
}
