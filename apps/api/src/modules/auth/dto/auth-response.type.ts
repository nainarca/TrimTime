import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class AuthResponse {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field()
  userId: string;

  @Field()
  isNewUser: boolean;
}

@ObjectType()
export class OtpRequestResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  /** Seconds until OTP expires */
  @Field()
  expiresIn: number;
}
