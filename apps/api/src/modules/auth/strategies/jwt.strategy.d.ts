import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { JwtPayload } from '@trimtime/shared-types';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly config;
    private readonly prisma;
    constructor(config: ConfigService, prisma: PrismaService);
    validate(payload: JwtPayload): Promise<{
        roles: {
            shopId: string;
            id: string;
            createdAt: Date;
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
    } & {
        shopIds: string[];
    }>;
}
export {};
