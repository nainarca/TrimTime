export interface AnalyticsSnapshot {
  id: string;
  shopId: string;
  barberId?: string;
  date: Date;
  totalServed: number;
  totalNoShow: number;
  totalLeft: number;
  avgWaitTimeMins: number;
  avgServiceTimeMins: number;
  peakHour?: number;
  totalQueueEntries: number;
  createdAt: Date;
}

export interface ShopAnalytics {
  period: { from: Date; to: Date };
  totalServed: number;
  totalNoShow: number;
  avgWaitTimeMins: number;
  avgServiceTimeMins: number;
  peakHour?: number;
  queueTrend: DayMetric[];
  barberPerformance: BarberMetric[];
  hourlyDistribution: HourlyBucket[];
}

export interface DayMetric {
  date: Date;
  totalServed: number;
  totalNoShow: number;
  avgWaitMins: number;
}

export interface BarberMetric {
  barberId: string;
  displayName: string;
  totalServed: number;
  avgServiceMins: number;
  noShowRate: number;
}

export interface HourlyBucket {
  hour: number;
  count: number;
}
