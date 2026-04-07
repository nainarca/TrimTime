/** Public booking — creates/links customer by phone (no JWT). */
export declare class GuestBookAppointmentInput {
    shopId: string;
    branchId: string;
    barberId: string;
    serviceId: string;
    scheduledAt: string;
    guestName: string;
    guestPhone: string;
    notes?: string;
}
