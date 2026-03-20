import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  BookingsService,
  Booking,
  BookingUpdateEvent,
} from '../../../../core/services/bookings.service';
import { TenantContextService } from '../../../../core/services/tenant-context.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'tt-bookings-page',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPageComponent implements OnInit, OnDestroy {
  shopId: string | null = null;
  bookings: Booking[] = [];
  loading = false;

  createDialogVisible = false;
  newBooking = {
    customerId: '',
    serviceId: '',
    barberId: '',
    scheduledAt: new Date(),
    durationMins: 30,
  };

  private sub?: Subscription;

  constructor(
    private readonly bookingsService: BookingsService,
    private readonly tenant: TenantContextService,
    private readonly notifications: NotificationService,
  ) {}

  ngOnInit(): void {
    this.shopId = this.tenant.getShopId();
    if (!this.shopId) {
      return;
    }
    this.loadBookings();
    this.sub = this.bookingsService.bookingUpdated$(this.shopId).subscribe({
      next: (event) => this.applyBookingUpdate(event),
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  loadBookings(): void {
    if (!this.shopId) return;
    this.loading = true;
    this.bookingsService.list(this.shopId).subscribe({
      next: (items) => {
        this.bookings = items;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  get confirmedCount(): number { return this.bookings.filter(b => b.status === 'CONFIRMED').length; }
  get pendingCount(): number   { return this.bookings.filter(b => b.status === 'PENDING').length; }
  get cancelledCount(): number { return this.bookings.filter(b => b.status === 'CANCELLED').length; }

  bookingStatusClass(status: string): string {
    const map: Record<string, string> = {
      CONFIRMED: 's-active',
      PENDING:   's-waiting',
      CANCELLED: 's-inactive',
      COMPLETED: 's-served',
      NO_SHOW:   's-no-show',
    };
    return map[status] ?? 's-waiting';
  }

  createBooking(): void {
    if (!this.shopId) return;
    this.createDialogVisible = true;
  }

  saveBooking(): void {
    if (!this.shopId) return;
    const input = {
      shopId: this.shopId,
      branchId: null,
      barberId: this.newBooking.barberId,
      customerId: this.newBooking.customerId,
      serviceId: this.newBooking.serviceId,
      scheduledAt: this.newBooking.scheduledAt.toISOString(),
      durationMins: this.newBooking.durationMins,
      notes: null,
    };

    this.bookingsService.create(input).subscribe({
      next: () => {
        this.createDialogVisible = false;
        this.loadBookings();
        this.notifications.success('Booking created');
      },
      error: () => {
        this.createDialogVisible = false;
        this.notifications.error('Failed to create booking');
      },
    });
  }

  cancelBooking(booking: Booking): void {
    this.bookingsService.cancel(booking.id).subscribe({
      next: () => this.loadBookings(),
      error: () => {
        this.notifications.error('Failed to cancel booking');
      },
    });
  }

  private applyBookingUpdate(event: BookingUpdateEvent): void {
    const idx = this.bookings.findIndex((b) => b.id === event.id);
    if (idx !== -1) {
      this.bookings[idx] = { ...this.bookings[idx], status: event.status };
    } else {
      // if not present, refresh list for now
      this.loadBookings();
    }
  }
}

