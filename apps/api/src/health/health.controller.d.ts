import { PrismaService } from '../modules/database/prisma.service';
import { RedisService } from '../modules/redis/redis.service';
export declare class HealthController {
    private readonly prisma;
    private readonly redis;
    constructor(prisma: PrismaService, redis: RedisService);
    check(): Promise<Record<string, unknown>>;
}
