import { QueueStatus, EntryType, QueueUpdateType } from './enums';
export interface QueueEntry {
    id: string;
    shopId: string;
    branchId: string;
    barberId?: string;
    customerId?: string;
    guestPhone?: string;
    guestName?: string;
    serviceId?: string;
    ticketNumber: number;
    entryType: EntryType;
    priority: number;
    status: QueueStatus;
    position: number;
    estimatedWaitMins: number;
    joinedAt: Date;
    calledAt?: Date;
    servingAt?: Date;
    servedAt?: Date;
    leftAt?: Date;
    noShowAt?: Date;
    appointmentId?: string;
    notes?: string;
    createdAt: Date;
}
export interface JoinQueueInput {
    qrCode: string;
    barberId?: string;
    serviceId?: string;
    guestPhone?: string;
    guestName?: string;
    notes?: string;
}
export interface QueueUpdate {
    type: QueueUpdateType;
    entry: QueueEntry;
    queueSnapshot: QueueEntry[];
}
export interface PositionUpdate {
    queueEntryId: string;
    newPosition: number;
    estimatedWaitMins: number;
    status: QueueStatus;
}
export interface QueueStats {
    totalWaiting: number;
    estimatedWaitMins: number;
    isAcceptingQueue: boolean;
    longestWaitMins: number;
}
export interface BarberDayStats {
    totalServed: number;
    totalNoShow: number;
    avgWaitTimeMins: number;
    avgServiceTimeMins: number;
}
