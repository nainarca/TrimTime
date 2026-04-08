import { PrismaService } from '../modules/database/prisma.service';
import { BarberInput } from './dto/barber.input';
export declare class BarbersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listBarbers(shopId: string, allowedShopIds?: string[]): Promise<{
        id: string;
        shopId: string;
        isActive: boolean;
        createdAt: Date;
        avatarUrl: string;
        updatedAt: Date;
        userId: string;
        branchId: string;
        displayName: string;
        bio: string;
        avgServiceDurationMins: number;
        currentStatus: import(".prisma/client").$Enums.BarberStatus;
        queueAccepting: boolean;
        maxQueueSize: number;
    }[]>;
    upsertBarber(input: BarberInput, allowedShopIds?: string[]): Promise<{
        id: string;
        shopId: string;
        isActive: boolean;
        createdAt: Date;
        avatarUrl: string;
        updatedAt: Date;
        userId: string;
        branchId: string;
        displayName: string;
        bio: string;
        avgServiceDurationMins: number;
        currentStatus: import(".prisma/client").$Enums.BarberStatus;
        queueAccepting: boolean;
        maxQueueSize: number;
    }>;
    deleteBarber(id: string, allowedShopIds?: string[]): Promise<boolean>;
}
