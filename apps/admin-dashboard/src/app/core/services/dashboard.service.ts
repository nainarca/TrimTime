import { Injectable } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';
import { QueueService, QueueStats } from './queue.service';
import { CustomersService } from './customers.service';
import { BookingsService, Booking } from './bookings.service';
import { TenantContextService } from './tenant-context.service';

export interface DashboardKpis {
  totalCustomersToday: number;
  activeQueueCount: number;
  completedServicesToday: number;
  revenueToday: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(
    private readonly queueService: QueueService,
    private readonly customersService: CustomersService,
    private readonly bookingsService: BookingsService,
    private readonly tenant: TenantContextService,
  ) {}

  loadKpis(shopId?: string | null): Observable<DashboardKpis> {
    const resolvedShopId = shopId ?? this.tenant.getShopId();
    if (!resolvedShopId) {
      throw new Error('No shopId available in TenantContextService');
    }
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const queueStats$ = this.queueService.getQueueStats(resolvedShopId);
    const customers$ = this.customersService.list(resolvedShopId);
    const bookings$ = this.bookingsService.list(
      resolvedShopId,
      todayStart.toISOString(),
      todayEnd.toISOString(),
    );

    return combineLatest([queueStats$, customers$, bookings$]).pipe(
      map(([queueStats, customers, bookings]) => {
        const totalCustomersToday = customers.length;
        const activeQueueCount =
          (queueStats as QueueStats)?.waitingCount +
          (queueStats as QueueStats)?.servingCount;
        const completedServicesToday = bookings.filter(
          (b) => b.status === 'COMPLETED' || b.status === 'SERVED',
        ).length;
        // Placeholder: revenueToday could be derived from booking + service price
        const revenueToday = 0;

        return {
          totalCustomersToday,
          activeQueueCount,
          completedServicesToday,
          revenueToday,
        };
      }),
    );
  }
}

