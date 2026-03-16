import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../modules/database/prisma.service';
import { AppointmentInput } from './dto/appointment.input';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createAppointment(input: AppointmentInput, allowedShopIds?: string[]) {
    if (allowedShopIds && !allowedShopIds.includes(input.shopId)) {
      throw new ForbiddenException('Access to this shop is not permitted');
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        shopId: input.shopId,
        branchId: input.branchId,
        barberId: input.barberId,
        customerId: input.customerId,
        serviceId: input.serviceId,
        scheduledAt: new Date(input.scheduledAt),
        durationMins: input.durationMins,
        status: 'PENDING',
        notes: input.notes,
      },
    });

    return appointment;
  }

  async cancelAppointment(id: string, allowedShopIds?: string[]) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appointment) throw new NotFoundException(`Appointment ${id} not found`);
    if (allowedShopIds && !allowedShopIds.includes(appointment.shopId)) {
      throw new ForbiddenException('Access to this shop is not permitted');
    }

    await this.prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return true;
  }

  async appointmentsByShop(shopId: string, allowedShopIds?: string[]) {
    if (allowedShopIds && !allowedShopIds.includes(shopId)) {
      throw new ForbiddenException('Access to this shop is not permitted');
    }
    return this.prisma.appointment.findMany({
      where: { shopId },
      orderBy: { scheduledAt: 'asc' },
    });
  }
}
