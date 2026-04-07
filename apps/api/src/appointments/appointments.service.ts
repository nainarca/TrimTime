import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../modules/database/prisma.service';
import { AppointmentInput } from './dto/appointment.input';
import { GuestBookAppointmentInput } from './dto/guest-book-appointment.input';

function isTenantScoped(allowedShopIds?: string[]): boolean {
  return Array.isArray(allowedShopIds) && allowedShopIds.length > 0;
}

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  private canonicalPhone(phone: string): string {
    return typeof phone === 'string' ? phone.replace(/\s/g, '').trim() : phone;
  }

  async createAppointment(input: AppointmentInput, allowedShopIds?: string[]) {
    if (isTenantScoped(allowedShopIds) && !allowedShopIds!.includes(input.shopId)) {
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
    if (
      isTenantScoped(allowedShopIds) &&
      !allowedShopIds!.includes(appointment.shopId)
    ) {
      throw new ForbiddenException('Access to this shop is not permitted');
    }

    await this.prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return true;
  }

  async appointmentsByShop(shopId: string, allowedShopIds?: string[]) {
    if (isTenantScoped(allowedShopIds) && !allowedShopIds!.includes(shopId)) {
      throw new ForbiddenException('Access to this shop is not permitted');
    }
    return this.prisma.appointment.findMany({
      where: { shopId },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  /** Customer app — no JWT; links or creates user by phone. */
  async bookAppointmentAsGuest(input: GuestBookAppointmentInput) {
    const phone = this.canonicalPhone(input.guestPhone);

    const branch = await this.prisma.shopBranch.findFirst({
      where: { id: input.branchId, shopId: input.shopId, isActive: true },
    });
    if (!branch) throw new NotFoundException('Branch not found for this shop');

    const barber = await this.prisma.barber.findFirst({
      where: { id: input.barberId, shopId: input.shopId, isActive: true },
    });
    if (!barber) throw new NotFoundException('Barber not found');

    const service = await this.prisma.service.findFirst({
      where: { id: input.serviceId, shopId: input.shopId, isActive: true },
    });
    if (!service) throw new NotFoundException('Service not found');

    const scheduledAt = new Date(input.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime())) {
      throw new BadRequestException('Invalid date/time');
    }
    if (scheduledAt.getTime() < Date.now() - 60_000) {
      throw new BadRequestException('Please choose a future date and time');
    }

    let user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          name: input.guestName.trim(),
          isVerified: false,
          roles: {
            create: { role: 'CUSTOMER' },
          },
        },
      });
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { name: input.guestName.trim() || user.name },
      });
    }

    return this.prisma.appointment.create({
      data: {
        shopId: input.shopId,
        branchId: input.branchId,
        barberId: input.barberId,
        customerId: user.id,
        serviceId: input.serviceId,
        scheduledAt,
        durationMins: service.durationMins,
        status: 'PENDING',
        notes: input.notes,
      },
    });
  }
}
