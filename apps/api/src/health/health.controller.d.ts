import { PrismaService } from '../modules/database/prisma.service';
export declare class HealthController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    check(): Promise<Record<string, unknown>>;
}
