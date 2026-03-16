import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../modules/database/prisma.service';
import { ServiceInput } from './dto/service.input';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async listServices(shopId: string, allowedShopIds?: string[]) {
    if (allowedShopIds && !allowedShopIds.includes(shopId)) {
      throw new ForbiddenException('Access to this shop is not permitted');
    }
    return this.prisma.service.findMany({
      where: { shopId, isActive: true },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async upsertService(input: ServiceInput, allowedShopIds?: string[]) {
    if (allowedShopIds && !allowedShopIds.includes(input.shopId)) {
      throw new ForbiddenException('Access to this shop is not permitted');
    }

    if (input.id) {
      const existing = await this.prisma.service.findUnique({ where: { id: input.id } });
      if (!existing) throw new NotFoundException(`Service ${input.id} not found`);
      if (allowedShopIds && !allowedShopIds.includes(existing.shopId)) {
        throw new ForbiddenException('Access to this shop is not permitted');
      }
      return this.prisma.service.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          durationMins: input.durationMins,
          price: input.price,
          currency: input.currency,
          isActive: input.isActive,
        },
      });
    }

    return this.prisma.service.create({
      data: {
        shopId: input.shopId,
        name: input.name,
        description: input.description,
        durationMins: input.durationMins,
        price: input.price,
        currency: input.currency,
        isActive: input.isActive,
      },
    });
  }

  async deleteService(id: string, allowedShopIds?: string[]) {
    const svc = await this.prisma.service.findUnique({ where: { id } });
    if (!svc) return false;
    if (allowedShopIds && !allowedShopIds.includes(svc.shopId)) {
      throw new ForbiddenException('Access to this shop is not permitted');
    }
    await this.prisma.service.delete({ where: { id } });
    return true;
  }
}
