import { PrismaService } from '../modules/database/prisma.service';
import { BarberInput } from './dto/barber.input';
export declare class BarbersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listBarbers(shopId: string, allowedShopIds?: string[]): Promise<{
        id: string;
        userId: string;
        shopId: string;
        branchId: string;
        displayName: string;
        bio: string;
        avatarUrl: string;
        avgServiceDurationMins: number;
        currentStatus: import(".prisma/client").$Enums.BarberStatus;
        queueAccepting: boolean;
        maxQueueSize: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    upsertBarber(input: BarberInput, allowedShopIds?: string[]): Promise<{
        id: string;
        userId: string;
        shopId: string;
        branchId: string;
        displayName: string;
        bio: string;
        avatarUrl: string;
        avgServiceDurationMins: number;
        currentStatus: import(".prisma/client").$Enums.BarberStatus;
        queueAccepting: boolean;
        maxQueueSize: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteBarber(id: string, allowedShopIds?: string[]): Promise<boolean>;
}
