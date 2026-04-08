import { AppointmentsService } from './appointments.service';
import { AppointmentModel } from './models/appointment.model';
import { AppointmentInput } from './dto/appointment.input';
import { GuestBookAppointmentInput } from './dto/guest-book-appointment.input';
import { AuthenticatedUser } from '../modules/auth/decorators/current-user.decorator';
export declare class AppointmentsResolver {
    private readonly appointmentsService;
    constructor(appointmentsService: AppointmentsService);
    bookAppointmentAsGuest(input: GuestBookAppointmentInput): Promise<AppointmentModel>;
    createAppointment(input: AppointmentInput, user: AuthenticatedUser): Promise<{
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
    cancelAppointment(id: string, user: AuthenticatedUser): Promise<boolean>;
    appointmentsByShop(shopId: string, user: AuthenticatedUser): Promise<{
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
}
