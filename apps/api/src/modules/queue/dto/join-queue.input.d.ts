import { EntryType } from '@trimtime/shared-types';
export declare class JoinQueueInput {
    shopId: string;
    branchId: string;
    barberId?: string;
    entryType: EntryType;
    priority: number;
    guestName?: string;
    guestPhone?: string;
    appointmentId?: string;
}
