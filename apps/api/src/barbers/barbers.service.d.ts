import { PrismaService } from '../modules/database/prisma.service';
import { BarberInput } from './dto/barber.input';
export declare class BarbersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listBarbers(shopId: string, allowedShopIds?: string[]): Promise<{
        id: string;
        shopId: string;
        branchId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        displayName: string;
        bio: string;
        avatarUrl: string;
        avgServiceDurationMins: number;
        currentStatus: import(".prisma/client").$Enums.BarberStatus;
        queueAccepting: boolean;
        maxQueueSize: number;
        isActive: boolean;
    }[]>;
    upsertBarber(input: BarberInput, allowedShopIds?: string[]): Promise<{
        id: string;
        shopId: string;
        branchId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        displayName: string;
        bio: string;
        avatarUrl: string;
        avgServiceDurationMins: number;
        currentStatus: import(".prisma/client").$Enums.BarberStatus;
        queueAccepting: boolean;
        maxQueueSize: number;
        isActive: boolean;
    }>;
    deleteBarber(id: string, allowedShopIds?: string[]): Promise<boolean>;
}
