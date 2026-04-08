export declare class BarberModel {
    id: string;
    shopId: string;
    userId: string;
    displayName: string;
    bio?: string | null;
    avatarUrl?: string | null;
    branchId?: string | null;
    avgServiceDurationMins: number;
    queueAccepting: boolean;
    maxQueueSize: number;
    isActive: boolean;
    createdAt: Date;
}
