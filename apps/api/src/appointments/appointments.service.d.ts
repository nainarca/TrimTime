import { PrismaService } from '../modules/database/prisma.service';
import { AppointmentInput } from './dto/appointment.input';
export declare class AppointmentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createAppointment(input: AppointmentInput, allowedShopIds?: string[]): Promise<{
        shopId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        durationMins: number;
        branchId: string;
        barberId: string;
        customerId: string;
        serviceId: string;
        scheduledAt: Date;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        notes: string;
        reminderSent: boolean;
    }>;
    cancelAppointment(id: string, allowedShopIds?: string[]): Promise<boolean>;
    appointmentsByShop(shopId: string, allowedShopIds?: string[]): Promise<{
        shopId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        durationMins: number;
        branchId: string;
        barberId: string;
        customerId: string;
        serviceId: string;
        scheduledAt: Date;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        notes: string;
        reminderSent: boolean;
    }[]>;
}
