export declare class BarberModel {
    id: string;
    shopId: string;
    userId: string;
    displayName: string;
    branchId?: string | null;
    queueAccepting: boolean;
    maxQueueSize: number;
    isActive: boolean;
    createdAt: Date;
}
