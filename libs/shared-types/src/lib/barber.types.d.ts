import { BarberStatus } from './enums';
export interface Barber {
    id: string;
    userId: string;
    shopId: string;
    branchId?: string;
    displayName: string;
    bio?: string;
    avatarUrl?: string;
    avgServiceDurationMins: number;
    currentStatus: BarberStatus;
    queueAccepting: boolean;
    maxQueueSize: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface WorkingHour {
    id: string;
    barberId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isWorking: boolean;
}
export interface BarberBreak {
    id: string;
    barberId: string;
    startsAt: Date;
    endsAt?: Date;
    reason?: string;
    createdAt: Date;
}
export interface BarberService {
    id: string;
    barberId: string;
    serviceId: string;
    customDuration?: number;
    customPrice?: number;
    isActive: boolean;
}
