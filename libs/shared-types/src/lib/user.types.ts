import { UserRole } from './enums';

export interface User {
  id: string;
  phone?: string;
  email?: string;
  name: string;
  avatarUrl?: string;
  isVerified: boolean;
  isActive: boolean;
  preferredLang: string;
  roles: UserRoleAssignment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRoleAssignment {
  id: string;
  userId: string;
  role: UserRole;
  shopId?: string;
  createdAt: Date;
}

export interface UpdateProfileInput {
  name?: string;
  email?: string;
  preferredLang?: string;
}
