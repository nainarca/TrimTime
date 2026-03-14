import { PrismaService } from '../database/prisma.service';
import { UpdateProfileInput } from './dto/update-profile.input';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<{
        roles: {
            id: string;
            createdAt: Date;
            shopId: string;
            userId: string;
            role: import(".prisma/client").$Enums.UserRole;
        }[];
    } & {
        name: string;
        id: string;
        phone: string;
        email: string;
        avatarUrl: string;
        isVerified: boolean;
        isActive: boolean;
        preferredLang: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByPhone(phone: string): Promise<{
        roles: {
            id: string;
            createdAt: Date;
            shopId: string;
            userId: string;
            role: import(".prisma/client").$Enums.UserRole;
        }[];
    } & {
        name: string;
        id: string;
        phone: string;
        email: string;
        avatarUrl: string;
        isVerified: boolean;
        isActive: boolean;
        preferredLang: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(userId: string, input: UpdateProfileInput): Promise<{
        roles: {
            id: string;
            createdAt: Date;
            shopId: string;
            userId: string;
            role: import(".prisma/client").$Enums.UserRole;
        }[];
    } & {
        name: string;
        id: string;
        phone: string;
        email: string;
        avatarUrl: string;
        isVerified: boolean;
        isActive: boolean;
        preferredLang: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deactivate(userId: string): Promise<{
        name: string;
        id: string;
        phone: string;
        email: string;
        avatarUrl: string;
        isVerified: boolean;
        isActive: boolean;
        preferredLang: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
