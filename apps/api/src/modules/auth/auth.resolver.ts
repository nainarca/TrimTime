import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestOtpInput } from './dto/request-otp.input';
import { VerifyOtpInput } from './dto/verify-otp.input';
import { LoginInput } from './dto/login.input';
import { AuthResponse, OtpRequestResponse } from './dto/auth-response.type';
import { GqlJwtGuard } from './guards/gql-jwt.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '@prisma/client';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => OtpRequestResponse, {
    description: 'Send OTP to a phone number (creates user if new)',
  })
  requestOtp(@Args('input') input: RequestOtpInput): Promise<OtpRequestResponse> {
    return this.authService.requestOtp(input.phone);
  }

  @Mutation(() => AuthResponse, {
    description: 'Verify OTP and receive JWT tokens',
  })
  verifyOtp(@Args('input') input: VerifyOtpInput): Promise<AuthResponse> {
    return this.authService.verifyOtp(input.phone, input.otp);
  }

  @Mutation(() => AuthResponse, {
    description: 'Login with username/password and receive JWT tokens',
  })
  login(@Args('input') input: LoginInput): Promise<AuthResponse> {
    return this.authService.login(input.username, input.password, input.role);
  }

  @Mutation(() => AuthResponse, {
    description: 'Exchange refresh token for new access + refresh tokens',
  })
  refreshToken(
    @Args('refreshToken') refreshToken: string,
  ): Promise<AuthResponse> {
    return this.authService.refreshToken(refreshToken);
  }

  @UseGuards(GqlJwtGuard)
  @Mutation(() => Boolean, {
    description: 'Revoke refresh token and log out',
  })
  logout(
    @CurrentUser() user: User,
    @Context() _ctx: unknown,
  ): Promise<boolean> {
    return this.authService.logout(user.id);
  }
}
