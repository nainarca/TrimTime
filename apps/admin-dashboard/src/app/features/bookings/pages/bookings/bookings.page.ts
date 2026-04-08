import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  BookingsService,
  Booking,
} from '../../../../core/services/bookings.service';
import { TenantContextService } from '../../../../core/services/tenant-context.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

// ── Demo seed — used when the appointments resolver is not yet available ────
const today = new Date();
const d = (offsetDays: number, h = 10, m = 0) => {
  const dt = new Date(today);
  dt.setDate(dt.getDate() + offsetDays);
  dt.setHours(h, m, 0, 0);
  return dt.toISOString();
};

const MOCK_BOOKINGS: Booking[] = [
  { id: 'bk-001', shopId: 'demo', branchId: 'br-1', barberId: 'arjun',   customerId: 'suresh',  serviceId: 'haircut', scheduledAt: d(0,  9, 30), durationMins: 20, status: 'COMPLETED', notes: null },
  { id: 'bk-002', shopId: 'demo', branchId: 'br-1', barberId: 'karthik', customerId: 'ramesh',  serviceId: 'beard',   scheduledAt: d(0, 10,  0), durationMins: 10, status: 'COMPLETED', notes: null },
  { id: 'bk-003', shopId: 'demo', branchId: 'br-1', barberId: 'rahim',   customerId: 'anand',   serviceId: 'combo',   scheduledAt: d(0, 10, 30), durationMins: 30, status: 'CONFIRMED', notes: null },
  { id: 'bk-004', shopId: 'demo', branchId: 'br-1', barberId: 'arjun',   customerId: 'priya',   serviceId: 'haircut', scheduledAt: d(0, 15,  0), durationMins: 20, status: 'CONFIRMED', notes: null },
  { id: 'bk-005', shopId: 'demo', branchId: 'br-1', barberId: 'karthik', customerId: 'kavitha', serviceId: 'spa',     scheduledAt: d(0, 16,  0), durationMins: 45, status: 'CONFIRMED', notes: 'Deep conditioning' },
  { id: 'bk-006', shopId: 'demo', branchId: 'br-1', barberId: 'vijay',   customerId: 'ravi',    serviceId: 'combo',   scheduledAt: d(0, 18, 30), durationMins: 30, status: 'CONFIRMED', notes: 'Kids cut too' },
  { id: 'bk-007', shopId: 'demo', branchId: 'br-1', barberId: 'rahim',   customerId: 'murugan', serviceId: 'spa',     scheduledAt: d(1, 11,  0), durationMins: 45, status: 'CONFIRMED', notes: null },
  { id: 'bk-008', shopId: 'demo', branchId: 'br-1', barberId: 'arjun',   customerId: 'selvam',  serviceId: 'haircut', scheduledAt: d(2, 16,  0), durationMins: 20, status: 'CONFIRMED', notes: null },
  { id: 'bk-009', shopId: 'demo', branchId: 'br-1', barberId: 'karthik', customerId: 'lakshmi', serviceId: 'spa',     scheduledAt: d(-1, 14, 30), durationMins: 45, status: 'COMPLETED', notes: null },
  { id: 'bk-010', shopId: 'demo', branchId: 'br-1', barberId: 'rahim',   customerId: 'deepa',   serviceId: 'beard',   scheduledAt: d(-1, 16,  0), durationMins: 10, status: 'CANCELLED', notes: 'Customer rescheduled' },
];

const BARBER_NAMES: Record<string, string> = {
  arjun: 'Arjun Kumar', karthik: 'Karthik Raja',
  rahim: 'Rahim Sheikh', vijay: 'Vijay Kumar',
};
const SERVICE_NAMES: Record<string, string> = {
  haircut: 'Haircut', beard: 'Beard Trim',
  combo: 'Haircut + Beard', spa: 'Hair Spa',
};
const CUSTOMER_NAMES: Record<string, string> = {
  suresh: 'Suresh Babu', ramesh: 'Ramesh Kumar', priya: 'Priya Devi',
  anand: 'Anand Raj', kavitha: 'Kavitha Subramani', ravi: 'Ravi Shankar',
  deepa: 'Deepa Menon', murugan: 'Murugan Pillai', lakshmi: 'Lakshmi Narayanan',
  selvam: 'Selvam Rajendran',
};

@Component({
  selector: 'tt-bookings-page',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPageComponent implements OnInit, OnDestroy {
  shopId:  string | null = null;
  bookings: Booking[]    = [];
  loading  = false;
  saving   = false;

  /** True when we fell back to mock data (no backend resolver yet) */
  usingMockData = false;

  createDialogVisible = false;
  newBooking = {
    customerName: '',
    serviceName:  '',
    barberName:   '',
    scheduledAt:  new Date(),
    durationMins: 30,
  };

  private sub?: Subscription;

  constructor(
    private readonly bookingsService: BookingsService,
    private readonly tenant:          TenantContextService,
    private readonly auth:            AuthService,
    private readonly notify:          NotificationService,
  ) {}

  ngOnInit(): void {
    this.shopId = this.tenant.getShopId() ?? this.auth.getShopId();
    this.loadBookings();

    // Subscribe to real-time booking updates. Silently ignore errors since
    // the bookingUpdated resolver does not exist yet in Phase-1 backend.
    if (this.shopId) {
      this.sub = this.bookingsService.bookingUpdated$(this.shopId).subscribe({
        next: (event) => {
          const idx = this.bookings.findIndex(b => b.id === event.id);
          if (idx !== -1) {
            this.bookings[idx] = { ...this.bookings[idx], status: event.status };
            this.bookings = [...this.bookings];
          }
        },
        error: () => { /* resolver not yet available — ignore silently */ },
      });
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  loadBookings(): void {
    if (!this.shopId) {
      this.bookings     = [...MOCK_BOOKINGS];
      this.usingMockData = true;
      return;
    }
    this.loading = true;

    this.bookingsService.list(this.shopId).subscribe({
      next: (items) => {
        this.loading       = false;
        this.usingMockData = false;
        // If resolver returns empty or backend isn't ready, use demo data
        this.bookings = items.length ? items : [...MOCK_BOOKINGS];
        if (!items.length) this.usingMockData = true;
      },
      error: () => {
        // Appointments resolver not yet available — fall back to demo data
        this.loading       = false;
        this.usingMockData = true;
        this.bookings      = [...MOCK_BOOKINGS];
      },
    });
  }

  // ── Computed counts ─────────────────────────────────────────────────────

  get confirmedCount(): number  { return this.bookings.filter(b => b.status === 'CONFIRMED').length;  }
  get pendingCount():   number  { return this.bookings.filter(b => b.status === 'PENDING').length;    }
  get cancelledCount(): number  { return this.bookings.filter(b => b.status === 'CANCELLED').length;  }
  get completedCount(): number  { return this.bookings.filter(b => b.status === 'COMPLETED').length;  }

  // ── Display helpers for mock data ────────────────────────────────────────

  displayCustomer(b: Booking): string {
    return CUSTOMER_NAMES[b.customerId] ?? b.customerId?.slice(0, 10) ?? '—';
  }

  displayService(b: Booking): string {
    return SERVICE_NAMES[b.serviceId] ?? b.serviceId?.slice(0, 12) ?? '—';
  }

  displayBarber(b: Booking): string {
    return BARBER_NAMES[b.barberId] ?? b.barberId?.slice(0, 12) ?? '—';
  }

  bookingStatusClass(status: string): string {
    const map: Record<string, string> = {
      CONFIRMED: 's-active',  PENDING:   's-waiting',
      CANCELLED: 's-inactive', COMPLETED: 's-served',
      QUEUED:    's-serving',  NO_SHOW:   's-no-show',
    };
    return map[status] ?? 's-waiting';
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  createBooking(): void {
    this.newBooking = {
      customerName: '', serviceName: '', barberName: '',
      scheduledAt: new Date(), durationMins: 30,
    };
    this.createDialogVisible = true;
  }

  saveBooking(): void {
    if (!this.newBooking.customerName.trim()) {
      this.notify.warn('Validation', 'Customer name is required.');
      return;
    }
    this.saving = true;

    // Demo: add to local list immediately (real mutation not wired — no resolver)
    setTimeout(() => {
      const mock: Booking = {
        id:           'bk-' + Date.now(),
        shopId:       this.shopId ?? 'demo',
        branchId:     'br-1',
        barberId:     this.newBooking.barberName || 'barber-mike',
        customerId:   this.newBooking.customerName,
        serviceId:    this.newBooking.serviceName || 'svc-haircut',
        scheduledAt:  this.newBooking.scheduledAt.toISOString(),
        durationMins: this.newBooking.durationMins,
        status:       'CONFIRMED',
        notes:        null,
      };
      this.bookings = [mock, ...this.bookings];
      this.saving              = false;
      this.createDialogVisible = false;
      this.notify.success('Booking created', `Appointment for ${this.newBooking.customerName} has been scheduled.`);
    }, 600);
  }

  cancelBooking(booking: Booking): void {
    if (this.usingMockData) {
      // Update local state immediately in demo mode
      const idx = this.bookings.findIndex(b => b.id === booking.id);
      if (idx !== -1) {
        this.bookings[idx] = { ...this.bookings[idx], status: 'CANCELLED' };
        this.bookings = [...this.bookings];
      }
      this.notify.warn('Cancelled', 'Booking has been cancelled.');
      return;
    }

    this.bookingsService.cancel(booking.id).subscribe({
      next:  () => {
        this.loadBookings();
        this.notify.warn('Cancelled', 'Booking has been cancelled.');
      },
      error: () => this.notify.error('Failed', 'Could not cancel booking.'),
    });
  }
}
