import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DashboardService, DashboardKpis } from '../../../../core/services/dashboard.service';
import { QueueService, QueueEntry } from '../../../../core/services/queue.service';
import { QueueSocketService } from '../../../../core/services/queue-socket.service';
import { ShopService } from '../../../../core/services/shop.service';
import { TenantContextService } from '../../../../core/services/tenant-context.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth/auth.service';

interface RecentEntry {
  token: string;
  customer: string;
  service: string;
  barber: string;
  status: string;
  wait: string;
}

// Shared Chart.js theme helpers
const TOOLTIP_DEFAULTS = {
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
};

const AXIS_DEFAULTS = {
  grid:   { color: 'rgba(226,232,240,0.5)', drawBorder: false },
  ticks:  { color: '#94a3b8', font: { size: 11, family: 'inherit' }, padding: 6 },
  border: { display: false },
};

// ── Static demo datasets (replaced by Phase-3 analytics API) ──────────────

const HOURS = ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM'];

const TREND_DATA: Record<string, { today: number[]; yesterday: number[] }> = {
  today: {
    today:     [2, 5, 9,  14, 21, 17, 25, 22, 28, 19, 11],
    yesterday: [1, 4, 7,  11, 17, 14, 20, 18, 24, 16,  8],
  },
  week: {
    today:     [42, 67, 55, 71, 83, 60, 48],
    yesterday: [38, 61, 50, 65, 75, 55, 42],
  },
  month: {
    today:     [310, 285, 340, 298, 362, 311, 390, 345, 420, 388, 430, 410],
    yesterday: [290, 270, 320, 280, 340, 295, 370, 325, 400, 368, 410, 385],
  },
};

const WEEK_LABELS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const BARBERS = [
  { name: 'Arjun',   servedToday: 16, servedYesterday: 14, avgWait: 10, rating: 4.9 },
  { name: 'Karthik', servedToday: 14, servedYesterday: 12, avgWait: 12, rating: 4.7 },
  { name: 'Rahim',   servedToday: 12, servedYesterday: 11, avgWait: 14, rating: 4.8 },
  { name: 'Vijay',   servedToday:  6, servedYesterday:  8, avgWait: 12, rating: 4.5 },
];

const SERVICES = [
  { label: 'Haircut',         value: 42, color: '#6366f1' },
  { label: 'Haircut + Beard', value: 26, color: '#10b981' },
  { label: 'Beard Trim',      value: 18, color: '#f59e0b' },
  { label: 'Hair Spa',        value: 10, color: '#8b5cf6' },
  { label: 'Other',           value:  4, color: '#94a3b8' },
];

@Component({
  selector: 'tt-dashboard-home-page',
  templateUrl: './dashboard-home.page.html',
  styleUrls: ['./dashboard-home.page.scss'],
})
export class DashboardHomePageComponent implements OnInit, OnDestroy {
  shopName = 'Your Shop';
  shopId: string | null = null;

  kpis?: DashboardKpis;
  kpisLoading = false;

  recentEntries: RecentEntry[] = [];
  entriesLoading = false;

  error: string | null = null;
  today = new Date();

  // ── Chart models ──────────────────────────────────────────
  activePeriod: 'today' | 'week' | 'month' = 'today';

  lineChartData: any;
  lineChartOptions: any;

  barChartData: any;
  barChartOptions: any;

  doughnutData: any;
  doughnutOptions: any;

  // Exposed for template iteration
  readonly serviceItems = SERVICES;
  readonly barberItems  = BARBERS;

  private subs: Subscription[] = [];

  constructor(
    private readonly auth: AuthService,
    private readonly dashboardService: DashboardService,
    private readonly queueService: QueueService,
    private readonly queueSocket: QueueSocketService,
    private readonly shopService: ShopService,
    private readonly tenant: TenantContextService,
    private readonly notify: NotificationService,
  ) {}

  ngOnInit(): void {
    this.initCharts();

    const jwtShopId = this.auth.getShopId();
    if (jwtShopId) {
      this.tenant.setShopId(jwtShopId);
      this.shopId = jwtShopId;
      this.loadAll();
    }

    this.subs.push(
      this.shopService.getMyShop().subscribe({
        next: (shop) => {
          this.shopName = shop.name;
          if (!this.shopId) {
            this.shopId = shop.id;
            this.loadAll();
          }
        },
        error: () => {
          if (!this.shopId) {
            this.error = 'Could not connect to the server. Retrying…';
          }
        },
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    this.queueSocket.disconnect();
  }

  // ── Data loading ─────────────────────────────────────────

  private loadAll(): void {
    this.loadKpis();
    this.loadRecentEntries();
    this.connectSocket();
  }

  loadKpis(): void {
    if (!this.shopId) return;
    this.kpisLoading = true;
    this.subs.push(
      this.dashboardService.loadKpis(this.shopId).subscribe({
        next: (kpis) => {
          this.kpis = kpis;
          this.kpisLoading = false;
          this.error = null;
        },
        error: () => {
          this.kpisLoading = false;
          this.notify.error('Stats unavailable', 'Could not load dashboard KPIs.');
        },
      }),
    );
  }

  private loadRecentEntries(): void {
    if (!this.shopId) return;
    this.entriesLoading = true;
    this.subs.push(
      this.queueService.getActiveQueue(this.shopId, null).subscribe({
        next: (entries) => {
          this.recentEntries = this.mapEntries(entries);
          this.entriesLoading = false;
        },
        error: () => { this.entriesLoading = false; },
      }),
    );
  }

  private connectSocket(): void {
    if (!this.shopId) return;
    this.queueSocket.connect(this.shopId);
    this.subs.push(
      this.queueSocket.queueUpdated$.subscribe((evt) => {
        this.recentEntries = this.mapEntries(evt.data as unknown as QueueEntry[]);
        this.loadKpis();
      }),
    );
  }

  private mapEntries(entries: QueueEntry[]): RecentEntry[] {
    return entries.slice(0, 10).map((e) => ({
      token:    e.ticketDisplay,
      customer: e.guestName || e.guestPhone || 'Guest',
      service:  '—',
      barber:   '—',
      status:   e.status,
      wait:     e.estimatedWaitMins != null ? `${e.estimatedWaitMins} min` : '—',
    }));
  }

  // ── Period selector ──────────────────────────────────────

  selectPeriod(period: 'today' | 'week' | 'month'): void {
    this.activePeriod = period;
    this.buildLineChart(period);
  }

  // ── Chart builders ───────────────────────────────────────

  private initCharts(): void {
    this.buildLineChart('today');
    this.buildBarChart();
    this.buildDoughnut();
  }

  private buildLineChart(period: 'today' | 'week' | 'month'): void {
    const raw    = TREND_DATA[period];
    const labels =
      period === 'today' ? HOURS :
      period === 'week'  ? WEEK_LABELS : MONTH_LABELS;

    this.lineChartData = {
      labels,
      datasets: [
        {
          label: 'Today',
          data: raw.today,
          fill: true,
          backgroundColor: (ctx: any) => {
            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0,   'rgba(99,102,241,0.2)');
            gradient.addColorStop(0.6, 'rgba(99,102,241,0.04)');
            gradient.addColorStop(1,   'rgba(99,102,241,0)');
            return gradient;
          },
          borderColor: '#6366f1',
          borderWidth: 2.5,
          tension: 0.42,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#fff',
          pointBorderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: '#6366f1',
          pointHoverBorderWidth: 2,
        },
        {
          label: 'Yesterday',
          data: raw.yesterday,
          fill: false,
          borderColor: 'rgba(148,163,184,0.55)',
          borderWidth: 1.8,
          borderDash: [5, 5],
          tension: 0.42,
          pointBackgroundColor: 'rgba(148,163,184,0.7)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    };

    this.lineChartOptions = {
      animation: { duration: 700, easing: 'easeInOutQuart' },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            color: '#64748b',
            font: { size: 11.5, family: 'inherit', weight: '500' },
            boxWidth: 28, boxHeight: 2,
            padding: 20,
          },
        },
        tooltip: { ...TOOLTIP_DEFAULTS },
      },
      scales: {
        x: { ...AXIS_DEFAULTS },
        y: { ...AXIS_DEFAULTS, beginAtZero: true },
      },
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
    };
  }

  private buildBarChart(): void {
    const names     = BARBERS.map((b) => b.name);
    const today     = BARBERS.map((b) => b.servedToday);
    const yesterday = BARBERS.map((b) => b.servedYesterday);

    this.barChartData = {
      labels: names,
      datasets: [
        {
          label: 'Today',
          data: today,
          backgroundColor: (ctx: any) => {
            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 260);
            gradient.addColorStop(0, 'rgba(99,102,241,0.9)');
            gradient.addColorStop(1, 'rgba(139,92,246,0.55)');
            return gradient;
          },
          borderRadius: { topLeft: 6, topRight: 6 },
          borderSkipped: false,
          barPercentage: 0.55,
          categoryPercentage: 0.7,
        },
        {
          label: 'Yesterday',
          data: yesterday,
          backgroundColor: 'rgba(226,232,240,0.65)',
          borderRadius: { topLeft: 6, topRight: 6 },
          borderSkipped: false,
          barPercentage: 0.55,
          categoryPercentage: 0.7,
        },
      ],
    };

    this.barChartOptions = {
      animation: { duration: 800, easing: 'easeOutQuart' },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            color: '#64748b',
            font: { size: 11, family: 'inherit', weight: '500' },
            boxWidth: 10, boxHeight: 10,
            usePointStyle: true, pointStyle: 'rect', padding: 16,
          },
        },
        tooltip: { ...TOOLTIP_DEFAULTS },
      },
      scales: {
        x: {
          ...AXIS_DEFAULTS,
          grid: { display: false },
          ticks: { color: '#64748b', font: { size: 12, weight: '600', family: 'inherit' } },
        },
        y: { ...AXIS_DEFAULTS, beginAtZero: true, ticks: { ...AXIS_DEFAULTS.ticks, stepSize: 5 } },
      },
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
    };
  }

  private buildDoughnut(): void {
    this.doughnutData = {
      labels: SERVICES.map((s) => s.label),
      datasets: [
        {
          data: SERVICES.map((s) => s.value),
          backgroundColor:      SERVICES.map((s) => s.color + 'cc'), // 80% opacity
          hoverBackgroundColor: SERVICES.map((s) => s.color),
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverBorderWidth: 3,
          hoverOffset: 6,
        },
      ],
    };

    this.doughnutOptions = {
      animation: { duration: 900, easing: 'easeInOutQuart' },
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: {
          ...TOOLTIP_DEFAULTS,
          callbacks: {
            label: (ctx: any) => {
              const total = (ctx.dataset.data as number[]).reduce((a: number, b: number) => a + b, 0);
              const pct   = ((ctx.parsed / total) * 100).toFixed(1);
              return ` ${ctx.label}: ${pct}%`;
            },
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    };
  }

  // ── Doughnut helpers for template ────────────────────────

  get totalServices(): number {
    return SERVICES.reduce((a, b) => a + b.value, 0);
  }

  getServicePct(value: number): number {
    return Math.round((value / this.totalServices) * 100);
  }

  getBarberPct(servedToday: number): number {
    const max = Math.max(...BARBERS.map((b) => b.servedToday));
    return Math.round((servedToday / max) * 100);
  }
}
