import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'tt-reports-page',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
})
export class ReportsPageComponent implements OnInit {
  loading = true;
  dateRange: Date[] | null = null;

  ngOnInit(): void {
    setTimeout(() => { this.loading = false; }, 700);
  }

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

  barChartOptions = {
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#64748b' } },
      y: { ticks: { color: '#64748b' } },
    },
  };

  doughnutOptions = {
    plugins: {
      legend: { display: false },
    },
    cutout: '70%',
  };

  transactions = [
    { token: 'A-001', customer: 'James Carter',   service: 'Haircut',        barber: 'Mike',   duration: 30, amount: 35, date: 'Today, 9:10 AM'   },
    { token: 'A-002', customer: 'Lena Brown',     service: 'Beard Trim',     barber: 'Carlos', duration: 20, amount: 20, date: 'Today, 9:40 AM'   },
    { token: 'A-003', customer: 'Marcus Davis',   service: 'Haircut+Beard',  barber: 'James',  duration: 45, amount: 50, date: 'Today, 10:05 AM'  },
    { token: 'A-004', customer: 'Priya Patel',    service: 'Haircut',        barber: 'Mike',   duration: 30, amount: 35, date: 'Today, 10:35 AM'  },
    { token: 'A-005', customer: 'Tyler Johnson',  service: 'Beard Trim',     barber: 'Carlos', duration: 20, amount: 20, date: 'Today, 11:00 AM'  },
    { token: 'A-006', customer: 'Aisha Nguyen',   service: 'Haircut',        barber: 'James',  duration: 30, amount: 35, date: 'Today, 11:30 AM'  },
    { token: 'A-007', customer: 'Omar Hassan',    service: 'Haircut+Beard',  barber: 'Mike',   duration: 45, amount: 50, date: 'Today, 12:00 PM'  },
    { token: 'A-008', customer: 'Sofia Garcia',   service: 'Haircut',        barber: 'Carlos', duration: 30, amount: 35, date: 'Today, 12:30 PM'  },
    { token: 'A-009', customer: 'Ben Mitchell',   service: 'Beard Trim',     barber: 'James',  duration: 20, amount: 20, date: 'Today, 1:00 PM'   },
    { token: 'A-010', customer: 'Chloe Turner',   service: 'Haircut',        barber: 'Mike',   duration: 30, amount: 35, date: 'Today, 1:30 PM'   },
  ];

  exportReport(type: string): void {
    console.log(`Exporting ${type} report`);
  }
}

