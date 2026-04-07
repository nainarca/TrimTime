import { PrismaService } from '../database/prisma.service';
import { UpdateProfileInput } from './dto/update-profile.input';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<{
        roles: {
            id: string;
            userId: string;
            shopId: string;
            createdAt: Date;
            role: import(".prisma/client").$Enums.UserRole;
        }[];
    } & {
        name: string;
        id: string;
        avatarUrl: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        email: string;
        isVerified: boolean;
        preferredLang: string;
    }>;
    findByPhone(phone: string): Promise<{
        roles: {
            id: string;
            userId: string;
            shopId: string;
            createdAt: Date;
            role: import(".prisma/client").$Enums.UserRole;
        }[];
    } & {
        name: string;
        id: string;
        avatarUrl: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        email: string;
        isVerified: boolean;
        preferredLang: string;
    }>;
    updateProfile(userId: string, input: UpdateProfileInput): Promise<{
        roles: {
            id: string;
            userId: string;
            shopId: string;
            createdAt: Date;
            role: import(".prisma/client").$Enums.UserRole;
        }[];
    } & {
        name: string;
        id: string;
        avatarUrl: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        email: string;
        isVerified: boolean;
        preferredLang: string;
    }>;
    deactivate(userId: string): Promise<{
        name: string;
        id: string;
        avatarUrl: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        email: string;
        isVerified: boolean;
        preferredLang: string;
    }>;
}
