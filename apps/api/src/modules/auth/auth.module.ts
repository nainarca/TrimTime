import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GqlJwtGuard } from './guards/gql-jwt.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_ACCESS_EXPIRY', '15m') },
      }),
    }),
  ],
  providers: [AuthService, AuthResolver, JwtStrategy, GqlJwtGuard, RolesGuard],
  exports: [AuthService, JwtModule, GqlJwtGuard, RolesGuard],
})
export class AuthModule {}
