import { PrismaService } from '../modules/database/prisma.service';
import { ServiceInput } from './dto/service.input';
export declare class ServicesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listServices(shopId: string, allowedShopIds?: string[]): Promise<{
        name: string;
        description: string;
        shopId: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        durationMins: number;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        displayOrder: number;
    }[]>;
    upsertService(input: ServiceInput, allowedShopIds?: string[]): Promise<{
        name: string;
        description: string;
        shopId: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        durationMins: number;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        displayOrder: number;
    }>;
    deleteService(id: string, allowedShopIds?: string[]): Promise<boolean>;
}
