import { PrismaService } from '../modules/database/prisma.service';
import { AppointmentInput } from './dto/appointment.input';
import { GuestBookAppointmentInput } from './dto/guest-book-appointment.input';
export declare class AppointmentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private canonicalPhone;
    createAppointment(input: AppointmentInput, allowedShopIds?: string[]): Promise<{
        id: string;
        shopId: string;
        durationMins: number;
        createdAt: Date;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        updatedAt: Date;
        branchId: string;
        barberId: string;
        customerId: string;
        serviceId: string;
        notes: string;
        scheduledAt: Date;
        reminderSent: boolean;
    }>;
    cancelAppointment(id: string, allowedShopIds?: string[]): Promise<boolean>;
    appointmentsByShop(shopId: string, allowedShopIds?: string[]): Promise<{
        id: string;
        shopId: string;
        durationMins: number;
        createdAt: Date;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        updatedAt: Date;
        branchId: string;
        barberId: string;
        customerId: string;
        serviceId: string;
        notes: string;
        scheduledAt: Date;
        reminderSent: boolean;
    }[]>;
    /** Customer app — no JWT; links or creates user by phone. */
    bookAppointmentAsGuest(input: GuestBookAppointmentInput): Promise<{
        id: string;
        shopId: string;
        durationMins: number;
        createdAt: Date;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        updatedAt: Date;
        branchId: string;
        barberId: string;
        customerId: string;
        serviceId: string;
        notes: string;
        scheduledAt: Date;
        reminderSent: boolean;
    }>;
}
