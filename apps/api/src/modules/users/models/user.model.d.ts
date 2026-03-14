import { UserRole } from '@trimtime/shared-types';
export declare class RoleAssignment {
    role: UserRole;
    shopId: string | null;
}
export declare class UserModel {
    id: string;
    phone: string;
    email: string | null;
    name: string | null;
    avatarUrl: string | null;
    isVerified: boolean;
    isActive: boolean;
    roles: RoleAssignment[];
    createdAt: Date;
}
