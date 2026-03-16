import { ReportsService } from './reports.service';
import { AuthenticatedUser } from '../modules/auth/decorators/current-user.decorator';
export declare class ReportsResolver {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    dailyQueueStats(shopId: string, user: AuthenticatedUser): Promise<{
        waitingCount: number;
        servingCount: number;
        avgWaitMins: number;
        servedTodayCount: number;
    }>;
    averageWaitTime(shopId: string, user: AuthenticatedUser): Promise<number>;
    servicesUsage(shopId: string, user: AuthenticatedUser): Promise<{
        serviceId: string;
        serviceName: string;
        usageCount: number;
    }[]>;
}
