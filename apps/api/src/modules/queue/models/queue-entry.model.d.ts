import { QueueStatus, EntryType } from '@trimtime/shared-types';
export declare class QueueEntryModel {
    id: string;
    shopId: string;
    branchId: string;
    barberId: string | null;
    customerId: string | null;
    ticketNumber: number;
    ticketDisplay: string;
    entryType: EntryType;
    priority: number;
    status: QueueStatus;
    position: number;
    estimatedWaitMins: number | null;
    joinedAt: Date;
    calledAt: Date | null;
    servingAt: Date | null;
    servedAt: Date | null;
    guestName: string | null;
    guestPhone: string | null;
    createdAt: Date;
}
export declare class QueueStatsModel {
    waitingCount: number;
    servingCount: number;
    avgWaitMins: number | null;
    servedTodayCount: number;
}
export declare class QueueUpdateEvent {
    shopId: string;
    barberId: string | null;
    type: string;
    entry: QueueEntryModel | null;
    activeEntries: QueueEntryModel[];
}
