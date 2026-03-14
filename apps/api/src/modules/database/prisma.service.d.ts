import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    /**
     * Enables NestJS shutdown hooks to trigger Prisma disconnect
     * Call this in main.ts if needed: app.enableShutdownHooks()
     */
    enableShutdownHooks(app: {
        close(): Promise<void>;
    }): Promise<void>;
}
