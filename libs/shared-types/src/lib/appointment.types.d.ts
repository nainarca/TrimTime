import { AppointmentStatus } from './enums';
export interface Appointment {
    id: string;
    shopId: string;
    branchId: string;
    barberId: string;
    customerId: string;
    serviceId: string;
    scheduledAt: Date;
    durationMins: number;
    status: AppointmentStatus;
    notes?: string;
    reminderSent: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface TimeSlot {
    startTime: string;
    endTime: string;
    isAvailable: boolean;
}
export interface BookAppointmentInput {
    barberId: string;
    serviceId: string;
    scheduledAt: Date;
    notes?: string;
}
