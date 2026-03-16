import { PrismaService } from '../modules/database/prisma.service';
export declare class ReportsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    dailyQueueStats(shopId: string, allowedShopIds?: string[]): Promise<{
        waitingCount: number;
        servingCount: number;
        avgWaitMins: number;
        servedTodayCount: number;
    }>;
    averageWaitTime(shopId: string, allowedShopIds?: string[]): Promise<number>;
    servicesUsage(shopId: string, allowedShopIds?: string[]): Promise<{
        serviceId: string;
        serviceName: string;
        usageCount: number;
    }[]>;
}
