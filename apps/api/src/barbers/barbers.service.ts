import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../modules/database/prisma.service';
import { BarberInput } from './dto/barber.input';

@Injectable()
export class BarbersService {
  constructor(private readonly prisma: PrismaService) {}

  async listBarbers(shopId: string, allowedShopIds?: string[]) {
    if (allowedShopIds && !allowedShopIds.includes(shopId)) {
      throw new ForbiddenException('Access to this shop is not permitted');
    }
    return this.prisma.barber.findMany({
      where: { shopId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async upsertBarber(input: BarberInput, allowedShopIds?: string[]) {
    if (allowedShopIds && !allowedShopIds.includes(input.shopId)) {
      throw new ForbiddenException('Access to this shop is not permitted');
    }

    if (input.id) {
      const existing = await this.prisma.barber.findUnique({ where: { id: input.id } });
      if (!existing) throw new NotFoundException(`Barber ${input.id} not found`);
      if (allowedShopIds && !allowedShopIds.includes(existing.shopId)) {
        throw new ForbiddenException('Access to this shop is not permitted');
      }
      return this.prisma.barber.update({
        where: { id: input.id },
        data: {
          displayName:  input.displayName,
          bio:          input.bio,
          avatarUrl:    input.avatarUrl,
          ...(input.branchId ? { branch: { connect: { id: input.branchId } } } : { branch: { disconnect: true } }),
          queueAccepting: input.queueAccepting,
          maxQueueSize:   input.maxQueueSize,
          isActive:       input.isActive,
        },
      });
    }

    return this.prisma.barber.create({
      data: {
        user: { connect: { id: input.userId } },
        shop: { connect: { id: input.shopId } },
        ...(input.branchId ? { branch: { connect: { id: input.branchId } } } : {}),
        displayName:  input.displayName,
        bio:          input.bio,
        avatarUrl:    input.avatarUrl,
        queueAccepting: input.queueAccepting,
        maxQueueSize:   input.maxQueueSize,
        isActive:       input.isActive,
      },
    });
  }

  async deleteBarber(id: string, allowedShopIds?: string[]) {
    const barber = await this.prisma.barber.findUnique({ where: { id } });
    if (!barber) return false;
    if (allowedShopIds && !allowedShopIds.includes(barber.shopId)) {
      throw new ForbiddenException('Access to this shop is not permitted');
    }
    await this.prisma.barber.delete({ where: { id } });
    return true;
  }
}
