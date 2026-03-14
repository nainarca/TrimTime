import { Component } from '@angular/core';

@Component({
  selector: 'tt-reports-page',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
})
export class ReportsPageComponent {
  dateRange: Date[] | null = null;

  revenueChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Revenue',
        data: [320, 450, 390, 520, 610, 700, 480],
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  revenueChartOptions = {
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: { ticks: { color: '#64748b' } },
      y: { ticks: { color: '#64748b' } },
    },
  };

  staffPerformanceData = {
    labels: ['Alice', 'Bob', 'Carlos', 'Dana'],
    datasets: [
      {
        label: 'Completed services',
        data: [42, 37, 50, 29],
        backgroundColor: ['#4f46e5', '#06b6d4', '#f97316', '#22c55e'],
      },
    ],
  };

  customerAnalyticsData = {
    labels: ['New', 'Returning'],
    datasets: [
      {
        data: [60, 40],
        backgroundColor: ['#0ea5e9', '#6366f1'],
      },
    ],
  };

  servicePopularityData = {
    labels: ['Haircut', 'Beard', 'Package', 'Coloring'],
    datasets: [
      {
        label: 'Bookings',
        data: [120, 80, 40, 25],
        backgroundColor: '#22c55e',
      },
    ],
  };

  exportReport(type: string): void {
    // TODO: implement CSV / Excel export
    // Placeholder to show button wiring
    // eslint-disable-next-line no-console
    console.log(`Exporting ${type} report`);
  }
}

