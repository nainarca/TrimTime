import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { QueueService } from './queue.service';

export interface DashboardKpis {
  totalCustomersToday: number;
  activeQueueCount: number;
  waitingCount: number;
  servingCount: number;
  completedServicesToday: number;
  avgWaitMins: number | null;
  revenueToday: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private readonly queueService: QueueService) {}

  /**
   * Loads KPIs from queue stats (single API call, Phase-1 compatible).
   * Revenue tracking requires Phase-3 payment integration.
   */
  loadKpis(shopId: string): Observable<DashboardKpis> {
    return this.queueService.getQueueStats(shopId).pipe(
      map((stats) => ({
        totalCustomersToday:    stats.servedTodayCount,
        activeQueueCount:       stats.waitingCount + stats.servingCount,
        waitingCount:           stats.waitingCount,
        servingCount:           stats.servingCount,
        completedServicesToday: stats.servedTodayCount,
        avgWaitMins:            stats.avgWaitMins,
        revenueToday:           0,
      })),
    );
  }
}
