import { PrismaService } from '../modules/database/prisma.service';
import { AppointmentInput } from './dto/appointment.input';
export declare class AppointmentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createAppointment(input: AppointmentInput, allowedShopIds?: string[]): Promise<{
        id: string;
        shopId: string;
        branchId: string;
        barberId: string;
        customerId: string;
        serviceId: string;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        notes: string;
        createdAt: Date;
        durationMins: number;
        updatedAt: Date;
        scheduledAt: Date;
        reminderSent: boolean;
    }>;
    cancelAppointment(id: string, allowedShopIds?: string[]): Promise<boolean>;
    appointmentsByShop(shopId: string, allowedShopIds?: string[]): Promise<{
        id: string;
        shopId: string;
        branchId: string;
        barberId: string;
        customerId: string;
        serviceId: string;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        notes: string;
        createdAt: Date;
        durationMins: number;
        updatedAt: Date;
        scheduledAt: Date;
        reminderSent: boolean;
    }[]>;
}
