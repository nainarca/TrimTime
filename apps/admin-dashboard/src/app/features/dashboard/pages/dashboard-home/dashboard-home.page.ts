import { Component, OnInit } from '@angular/core';
import { DashboardService, DashboardKpis } from '../../../../core/services/dashboard.service';
import { TenantContextService } from '../../../../core/services/tenant-context.service';

@Component({
  selector: 'tt-dashboard-home-page',
  templateUrl: './dashboard-home.page.html',
  styleUrls: ['./dashboard-home.page.scss'],
})
export class DashboardHomePageComponent implements OnInit {
  shopId: string | null = null;

  kpis?: DashboardKpis;
  loading = false;

  queueChartData: any;
  queueChartOptions: any;

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly tenant: TenantContextService,
  ) {}

  ngOnInit(): void {
    this.shopId = this.tenant.getShopId();
    if (!this.shopId) {
      return;
    }
    this.loadKpis();
    this.initCharts();
  }

  loadKpis(): void {
    if (!this.shopId) return;
    this.loading = true;
    this.dashboardService.loadKpis(this.shopId).subscribe({
      next: (kpis) => {
        this.kpis = kpis;
        this.loading = false;
        this.updateCharts();
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  private initCharts(): void {
    this.queueChartData = {
      labels: ['Waiting', 'Serving', 'Completed'],
      datasets: [
        {
          data: [0, 0, 0],
          backgroundColor: ['#3b82f6', '#10b981', '#6b7280'],
        },
      ],
    };
    this.queueChartOptions = {
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#64748b' },
        },
      },
    };
  }

  private updateCharts(): void {
    if (!this.kpis) return;
    const waiting = this.kpis.activeQueueCount;
    const serving = 0; // refine when queueStats exposes serving breakdown
    const completed = this.kpis.completedServicesToday;
    this.queueChartData = {
      ...this.queueChartData,
      datasets: [
        {
          ...this.queueChartData.datasets[0],
          data: [waiting, serving, completed],
        },
      ],
    };
  }
}


