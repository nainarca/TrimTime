import { PrismaService } from '../modules/database/prisma.service';
import { ServiceInput } from './dto/service.input';
export declare class ServicesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listServices(shopId: string, allowedShopIds?: string[]): Promise<{
        name: string;
        id: string;
        shopId: string;
        description: string;
        durationMins: number;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        isActive: boolean;
        displayOrder: number;
        createdAt: Date;
    }[]>;
    upsertService(input: ServiceInput, allowedShopIds?: string[]): Promise<{
        name: string;
        id: string;
        shopId: string;
        description: string;
        durationMins: number;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        isActive: boolean;
        displayOrder: number;
        createdAt: Date;
    }>;
    deleteService(id: string, allowedShopIds?: string[]): Promise<boolean>;
}
