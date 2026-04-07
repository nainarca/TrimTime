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
        branchId: string;
        createdAt: Date;
        updatedAt: Date;
        durationMins: number;
        barberId: string;
        customerId: string;
        serviceId: string;
        scheduledAt: Date;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        notes: string;
        reminderSent: boolean;
    }>;
    cancelAppointment(id: string, user: AuthenticatedUser): Promise<boolean>;
    appointmentsByShop(shopId: string, user: AuthenticatedUser): Promise<{
        id: string;
        shopId: string;
        branchId: string;
        createdAt: Date;
        updatedAt: Date;
        durationMins: number;
        barberId: string;
        customerId: string;
        serviceId: string;
        scheduledAt: Date;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        notes: string;
        reminderSent: boolean;
    }[]>;
}
