import { PrismaService } from '../modules/database/prisma.service';
import { AppointmentInput } from './dto/appointment.input';
import { GuestBookAppointmentInput } from './dto/guest-book-appointment.input';
export declare class AppointmentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private canonicalPhone;
    createAppointment(input: AppointmentInput, allowedShopIds?: string[]): Promise<{
        shopId: string;
        id: string;
        durationMins: number;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        barberId: string;
        customerId: string;
        serviceId: string;
        scheduledAt: Date;
        notes: string;
        reminderSent: boolean;
    }>;
    cancelAppointment(id: string, allowedShopIds?: string[]): Promise<boolean>;
    appointmentsByShop(shopId: string, allowedShopIds?: string[]): Promise<{
        shopId: string;
        id: string;
        durationMins: number;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        barberId: string;
        customerId: string;
        serviceId: string;
        scheduledAt: Date;
        notes: string;
        reminderSent: boolean;
    }[]>;
    /** Customer app — no JWT; links or creates user by phone. */
    bookAppointmentAsGuest(input: GuestBookAppointmentInput): Promise<{
        shopId: string;
        id: string;
        durationMins: number;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        barberId: string;
        customerId: string;
        serviceId: string;
        scheduledAt: Date;
        notes: string;
        reminderSent: boolean;
    }>;
}
