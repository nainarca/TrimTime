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
        updatedAt: Date;
        avatarUrl: string;
        isActive: boolean;
        phone: string;
        email: string;
        isVerified: boolean;
        preferredLang: string;
    } & {
        shopIds: string[];
    }>;
}
export {};
