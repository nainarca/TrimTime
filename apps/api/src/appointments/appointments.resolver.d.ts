import { AppointmentsService } from './appointments.service';
import { AppointmentInput } from './dto/appointment.input';
import { AuthenticatedUser } from '../modules/auth/decorators/current-user.decorator';
export declare class AppointmentsResolver {
    private readonly appointmentsService;
    constructor(appointmentsService: AppointmentsService);
    createAppointment(input: AppointmentInput, user: AuthenticatedUser): Promise<{
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
    cancelAppointment(id: string, user: AuthenticatedUser): Promise<boolean>;
    appointmentsByShop(shopId: string, user: AuthenticatedUser): Promise<{
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
