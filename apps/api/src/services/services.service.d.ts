import { PrismaService } from '../modules/database/prisma.service';
import { ServiceInput } from './dto/service.input';
export declare class ServicesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listServices(shopId: string, allowedShopIds?: string[]): Promise<{
        name: string;
        id: string;
        shopId: string;
        durationMins: number;
        createdAt: Date;
        description: string;
        isActive: boolean;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        displayOrder: number;
    }[]>;
    upsertService(input: ServiceInput, allowedShopIds?: string[]): Promise<{
        name: string;
        id: string;
        shopId: string;
        durationMins: number;
        createdAt: Date;
        description: string;
        isActive: boolean;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        displayOrder: number;
    }>;
    deleteService(id: string, allowedShopIds?: string[]): Promise<boolean>;
}
