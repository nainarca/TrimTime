import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../modules/database/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async dailyQueueStats(shopId: string, allowedShopIds?: string[]) {
    if (allowedShopIds && !allowedShopIds.includes(shopId)) {
      throw new ForbiddenException('Access to this shop is not permitted');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [waitingCount, servingCount, servedTodayCount] = await Promise.all([
      this.prisma.queueEntry.count({ where: { shopId, status: 'WAITING' } }),
      this.prisma.queueEntry.count({ where: { shopId, status: 'SERVING' } }),
      this.prisma.queueEntry.count({ where: { shopId, status: 'SERVED', servedAt: { gte: today } } }),
    ]);

    const avgWaitResult = await this.prisma.queueEntry.aggregate({
      where: { shopId, status: 'SERVED', estimatedWaitMins: { not: null } },
      _avg: { estimatedWaitMins: true },
    });

    return {
      waitingCount,
      servingCount,
      avgWaitMins: avgWaitResult._avg.estimatedWaitMins ?? null,
      servedTodayCount,
    };
  }

  async averageWaitTime(shopId: string, allowedShopIds?: string[]) {
    const stats = await this.dailyQueueStats(shopId, allowedShopIds);
    return stats.avgWaitMins;
  }

  async servicesUsage(shopId: string, allowedShopIds?: string[]) {
    if (allowedShopIds && !allowedShopIds.includes(shopId)) {
      throw new ForbiddenException('Access to this shop is not permitted');
    }

    const usage = await this.prisma.queueEntry.groupBy({
      by: ['serviceId'],
      where: { shopId, serviceId: { not: null } },
      _count: { serviceId: true },
    });

    const serviceIds = usage.map((u) => u.serviceId as string);
    const services = await this.prisma.service.findMany({ where: { id: { in: serviceIds } } });
    const serviceMap = new Map(services.map((s) => [s.id, s.name]));

    return usage.map((u) => ({
      serviceId: u.serviceId as string,
      serviceName: serviceMap.get(u.serviceId as string) ?? 'Unknown',
      usageCount: u._count.serviceId,
    }));
  }
}
