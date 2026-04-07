import { InputType, Field } from '@nestjs/graphql';
import { IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

@InputType()
export class VerifyOtpInput {
  @Field()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/\s/g, '').trim() : value,
  )
  @IsString()
  @Matches(/^\+[1-9]\d{6,14}$/, { message: 'Phone must be in E.164 format' })
  phone: string;

  @Field()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(4, 12, { message: 'OTP must be 4–12 digits' })
  @Matches(/^\d+$/, { message: 'OTP must be numeric' })
  otp: string;
}
