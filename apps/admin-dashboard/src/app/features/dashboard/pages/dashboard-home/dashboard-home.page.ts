import { Component, OnInit } from '@angular/core';
import { DashboardService, DashboardKpis } from '../../../../core/services/dashboard.service';
import { TenantContextService } from '../../../../core/services/tenant-context.service';

interface RecentEntry {
  token: string;
  customer: string;
  service: string;
  barber: string;
  status: string;
  wait: string;
}

@Component({
  selector: 'tt-dashboard-home-page',
  templateUrl: './dashboard-home.page.html',
  styleUrls: ['./dashboard-home.page.scss'],
})
export class DashboardHomePageComponent implements OnInit {
  shopId: string | null = null;
  kpis?: DashboardKpis;
  loading = false;
  today = new Date();

  lineChartData: any;
  lineChartOptions: any;

  recentEntries: RecentEntry[] = [
    { token: 'A001', customer: 'James Wilson', service: 'Haircut',         barber: 'Mike',  status: 'SERVED',   wait: '12 min' },
    { token: 'A002', customer: 'Guest',         service: 'Beard Trim',      barber: 'James', status: 'SERVING',  wait: '—'      },
    { token: 'A003', customer: 'Carlos M.',     service: 'Haircut + Beard', barber: 'Mike',  status: 'WAITING',  wait: '8 min'  },
    { token: 'A004', customer: 'Guest',         service: 'Haircut',         barber: 'James', status: 'WAITING',  wait: '20 min' },
    { token: 'A005', customer: 'Tony B.',       service: 'Beard Trim',      barber: 'Mike',  status: 'CALLED',   wait: '2 min'  },
  ];

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly tenant: TenantContextService,
  ) {}

  ngOnInit(): void {
    this.shopId = this.tenant.getShopId();
    this.initCharts();
    if (this.shopId) {
      this.loadKpis();
    }
  }

  loadKpis(): void {
    if (!this.shopId) return;
    this.loading = true;
    this.dashboardService.loadKpis(this.shopId).subscribe({
      next: (kpis) => { this.kpis = kpis; this.loading = false; },
      error: ()     => { this.loading = false; },
    });
  }

  private initCharts(): void {
    this.lineChartData = {
      labels: ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'],
      datasets: [
        {
          label: 'Customers Served',
          data: [3, 7, 12, 18, 14, 22, 19, 25, 16],
          fill: true,
          // Dynamic gradient fill applied via Chart.js plugin callback
          backgroundColor: (ctx: any) => {
            const canvas = ctx.chart.ctx;
            const gradient = canvas.createLinearGradient(0, 0, 0, 280);
            gradient.addColorStop(0,   'rgba(99, 102, 241, 0.18)');
            gradient.addColorStop(0.6, 'rgba(99, 102, 241, 0.04)');
            gradient.addColorStop(1,   'rgba(99, 102, 241, 0)');
            return gradient;
          },
          borderColor: '#6366f1',
          borderWidth: 2.5,
          tension: 0.42,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#fff',
          pointBorderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#6366f1',
        },
        {
          label: 'Avg Wait (min)',
          data: [5, 8, 12, 15, 10, 18, 14, 20, 12],
          fill: false,
          borderColor: '#10b981',
          borderWidth: 2,
          borderDash: [5, 4],
          tension: 0.42,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#fff',
          pointBorderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };

    this.lineChartOptions = {
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            color: '#64748b',
            font: { size: 11.5, family: 'inherit', weight: '500' },
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 18,
          },
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#f1f5f9',
          bodyColor: '#94a3b8',
          borderColor: '#1e293b',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 10,
          displayColors: true,
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true,
        },
      },
      scales: {
        x: {
          grid:  { color: 'rgba(241,245,249,0.8)', drawBorder: false },
          ticks: { color: '#94a3b8', font: { size: 11 }, padding: 6 },
          border: { display: false },
        },
        y: {
          grid:  { color: 'rgba(241,245,249,0.8)', drawBorder: false },
          ticks: { color: '#94a3b8', font: { size: 11 }, padding: 6 },
          border: { display: false },
          beginAtZero: true,
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      elements: { line: { capBezierPoints: true } },
    };
  }
}
