import { User } from './user.types';
import { UserRole } from './enums';

export interface AuthPayload {
  accessToken: string;
  refreshToken: string;
  user: User;
  isNewUser: boolean;
}

export interface OtpResponse {
  success: boolean;
  expiresIn: number;
}

export interface JwtPayload {
  sub: string;        // userId
  phone?: string;
  roles: UserRole[];
  shopIds: string[];
  iat?: number;
  exp?: number;
}

export interface RequestOtpInput {
  phone: string;
}

export interface VerifyOtpInput {
  phone: string;
  code: string;
}
