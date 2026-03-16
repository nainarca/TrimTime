import { PrismaService } from '../database/prisma.service';
import { UpdateProfileInput } from './dto/update-profile.input';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<{
        roles: {
            id: string;
            shopId: string;
            createdAt: Date;
            userId: string;
            role: import(".prisma/client").$Enums.UserRole;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        isActive: boolean;
        phone: string;
        email: string;
        avatarUrl: string;
        isVerified: boolean;
        preferredLang: string;
        updatedAt: Date;
    }>;
    findByPhone(phone: string): Promise<{
        roles: {
            id: string;
            shopId: string;
            createdAt: Date;
            userId: string;
            role: import(".prisma/client").$Enums.UserRole;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        isActive: boolean;
        phone: string;
        email: string;
        avatarUrl: string;
        isVerified: boolean;
        preferredLang: string;
        updatedAt: Date;
    }>;
    updateProfile(userId: string, input: UpdateProfileInput): Promise<{
        roles: {
            id: string;
            shopId: string;
            createdAt: Date;
            userId: string;
            role: import(".prisma/client").$Enums.UserRole;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        isActive: boolean;
        phone: string;
        email: string;
        avatarUrl: string;
        isVerified: boolean;
        preferredLang: string;
        updatedAt: Date;
    }>;
    deactivate(userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        isActive: boolean;
        phone: string;
        email: string;
        avatarUrl: string;
        isVerified: boolean;
        preferredLang: string;
        updatedAt: Date;
    }>;
}
