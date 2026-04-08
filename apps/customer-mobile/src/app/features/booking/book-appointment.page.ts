import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import {
  QueueApiService,
  PublicService,
  PublicBarber,
  Appointment,
} from '../queue/services/queue-api.service';

interface DateChip {
  iso:     string;   // YYYY-MM-DD
  label:   string;   // "Mon"
  day:     string;   // "7"
  month:   string;   // "Apr"
  isToday: boolean;
}

interface TimeSlot {
  value: string;   // "HH:mm"
  label: string;   // "10:30 AM"
}

@Component({
  standalone: true,
  selector: 'tt-book-appointment-page',
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './book-appointment.page.html',
  styleUrls: ['./book-appointment.page.scss'],
})
export class BookAppointmentPage implements OnInit {
  shopId: string | null = null;
  branchId: string | null = null;
  shopName = '';
  branchName = '';
  shopSlug = '';

  step: 1 | 2 | 3 = 1;
  loadingData = false;
  loading = false;
  error = '';

  barbers: PublicBarber[] = [];
  services: PublicService[] = [];

  selectedBarberId: string | null = null;
  // Multi-select services
  selectedServiceIds: string[] = [];
  selectedDate = '';   // YYYY-MM-DD
  selectedTime = '';   // HH:mm

  dateChips: DateChip[] = [];
  timeSlots: TimeSlot[] = [];

  guestName = '';
  guestPhone = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly queueApi: QueueApiService,
    private readonly alertCtrl: AlertController,
  ) {}

  ngOnInit(): void {
    this.shopId    = this.route.snapshot.queryParamMap.get('shopId');
    this.branchId  = this.route.snapshot.queryParamMap.get('branchId');
    this.shopName  = this.route.snapshot.queryParamMap.get('shopName') || '';
    this.branchName = this.route.snapshot.queryParamMap.get('branchName') || '';
    this.shopSlug  = this.route.snapshot.queryParamMap.get('slug') || '';

    this.buildDateChips();
    this.buildTimeSlots();

    if (this.shopId) {
      this.loadData(this.shopId);
    }
  }

  // ── Date chip helpers ──────────────────────────────────────

  private buildDateChips(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      this.dateChips.push({
        iso,
        label:   days[d.getDay()],
        day:     String(d.getDate()),
        month:   months[d.getMonth()],
        isToday: i === 0,
      });
    }
    // Default to today
    this.selectedDate = this.dateChips[0].iso;
  }

  private buildTimeSlots(): void {
    const slots: TimeSlot[] = [];
    for (let h = 9; h < 20; h++) {
      for (const m of [0, 30]) {
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        const period = h < 12 ? 'AM' : 'PM';
        const h12 = h <= 12 ? h : h - 12;
        slots.push({ value: `${hh}:${mm}`, label: `${h12}:${mm} ${period}` });
      }
    }
    this.timeSlots = slots;
    // Default: next round half-hour
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes() < 30 ? 30 : 0;
    const hNext = m === 0 ? h + 1 : h;
    const clampedH = Math.max(9, Math.min(19, hNext));
    this.selectedTime = `${String(clampedH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    if (!this.timeSlots.find(s => s.value === this.selectedTime)) {
      this.selectedTime = this.timeSlots[0].value;
    }
  }

  get scheduledIso(): string {
    if (!this.selectedDate || !this.selectedTime) return '';
    return new Date(`${this.selectedDate}T${this.selectedTime}:00`).toISOString();
  }

  selectDate(iso: string): void { this.selectedDate = iso; }
  selectTime(slot: TimeSlot): void { this.selectedTime = slot.value; }

  // ── Service multi-select ────────────────────────────────────

  toggleService(id: string): void {
    const idx = this.selectedServiceIds.indexOf(id);
    if (idx === -1) {
      this.selectedServiceIds = [...this.selectedServiceIds, id];
    } else {
      this.selectedServiceIds = this.selectedServiceIds.filter(s => s !== id);
    }
  }

  isServiceSelected(id: string): boolean {
    return this.selectedServiceIds.includes(id);
  }

  get selectedServices(): PublicService[] {
    return this.services.filter(s => this.selectedServiceIds.includes(s.id));
  }

  get totalDuration(): number {
    return this.selectedServices.reduce((acc, s) => acc + s.durationMins, 0);
  }

  get totalPrice(): number {
    return this.selectedServices.reduce((acc, s) => acc + s.price, 0);
  }

  get totalCurrency(): string {
    return this.selectedServices[0]?.currency || 'INR';
  }

  get selectedBarberName(): string {
    return this.barbers.find(b => b.id === this.selectedBarberId)?.displayName || '—';
  }

  get selectedServiceNames(): string {
    return this.selectedServices.map(s => s.name).join(', ');
  }

  get selectedDateObj(): Date | null {
    if (!this.selectedDate) return null;
    const [y, m, d] = this.selectedDate.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  // ── Barber ──────────────────────────────────────────────────

  private loadData(shopId: string): void {
    this.loadingData = true;
    this.queueApi.getPublicBarbers(shopId).subscribe({
      next: (list) => {
        this.barbers = list.filter(b => b.isActive);
        this.loadingData = false;
      },
      error: () => {
        this.barbers = [];
        this.loadingData = false;
      },
    });
    this.queueApi.getPublicServices(shopId).subscribe({
      next: (list) => { this.services = list.filter(s => s.isActive); },
      error: () => { this.services = []; },
    });
  }

  barberInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  selectBarber(id: string): void { this.selectedBarberId = id; }

  // ── Steps ───────────────────────────────────────────────────

  nextStep(): void {
    this.error = '';
    if (this.step === 1) {
      if (!this.selectedBarberId) {
        this.error = 'Please select a barber.';
        return;
      }
      this.step = 2;
      return;
    }
    if (this.step === 2) {
      if (this.selectedServiceIds.length === 0) {
        this.error = 'Please select at least one service.';
        return;
      }
      if (!this.selectedDate || !this.selectedTime) {
        this.error = 'Please pick a date and time.';
        return;
      }
      if (new Date(this.scheduledIso).getTime() < Date.now() - 60_000) {
        this.error = 'Please choose a future time.';
        return;
      }
      this.step = 3;
    }
  }

  prevStep(): void {
    this.error = '';
    if (this.step > 1) this.step = (this.step - 1) as 1 | 2 | 3;
  }

  private normalizePhone(raw: string): string {
    let p = raw.replace(/[\s\-\(\)\.]/g, '');
    if (p && !p.startsWith('+')) p = '+91' + p;
    return p;
  }

  private friendlyError(err: unknown): string {
    const e = err as { graphQLErrors?: { message?: string }[]; message?: string };
    if (e?.graphQLErrors?.[0]?.message) return e.graphQLErrors[0].message;
    if (e?.message) return e.message;
    return 'Could not complete booking. Please try again.';
  }

  confirmBooking(): void {
    if (!this.shopId || !this.selectedBarberId || this.selectedServiceIds.length === 0) {
      this.error = 'Missing shop or selection. Go back and try again.';
      return;
    }
    if (!this.guestName.trim()) {
      this.error = 'Please enter your name.';
      return;
    }
    const phone = this.normalizePhone(this.guestPhone.trim());
    if (!/^\+[1-9]\d{6,14}$/.test(phone)) {
      this.error = 'Enter a valid phone with country code, e.g. +91 98765 43210';
      return;
    }

    this.loading = true;
    this.error = '';
    this.queueApi
      .bookAppointmentAsGuest({
        shopId:      this.shopId,
        branchId:    this.branchId || '00000000-0000-0000-0000-000000000000',
        barberId:    this.selectedBarberId,
        serviceId:   this.selectedServiceIds[0],   // Primary service
        scheduledAt: new Date(this.scheduledIso).toISOString(),
        guestName:   this.guestName.trim(),
        guestPhone:  phone,
        notes:       this.selectedServiceIds.length > 1
          ? `Services: ${this.selectedServices.map(s => s.name).join(', ')}`
          : undefined,
      })
      .subscribe({
        next: async (appt) => {
          this.loading = false;
          const when = new Date(appt.scheduledAt).toLocaleString(undefined, {
            dateStyle: 'medium', timeStyle: 'short',
          });
          const a = await this.alertCtrl.create({
            header: 'Booking confirmed',
            message: `You're booked for ${when}. Reference: ${appt.id.slice(0, 8)}…`,
            buttons: [{
              text: 'OK',
              handler: () => {
                if (this.shopSlug) void this.router.navigate(['/shop', this.shopSlug]);
                else void this.router.navigate(['/tabs/scan']);
              },
            }],
          });
          await a.present();
        },
        error: (err) => {
          this.loading = false;
          this.error = this.friendlyError(err);
        },
      });
  }

  goBack(): void {
    if (this.shopSlug) void this.router.navigate(['/shop', this.shopSlug]);
    else void this.router.navigate(['/tabs/scan']);
  }
}
