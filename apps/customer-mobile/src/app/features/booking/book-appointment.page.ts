import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import {
  QueueApiService,
  PublicService,
  PublicBarber,
} from '../queue/services/queue-api.service';

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
  selectedServiceId: string | null = null;
  /** ISO string for ion-datetime */
  scheduledIso = '';
  minIso = '';
  maxIso = '';

  guestName = '';
  guestPhone = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly queueApi: QueueApiService,
    private readonly alertCtrl: AlertController,
  ) {}

  ngOnInit(): void {
    this.shopId = this.route.snapshot.queryParamMap.get('shopId');
    this.branchId = this.route.snapshot.queryParamMap.get('branchId');
    this.shopName = this.route.snapshot.queryParamMap.get('shopName') || '';
    this.branchName = this.route.snapshot.queryParamMap.get('branchName') || '';
    this.shopSlug = this.route.snapshot.queryParamMap.get('slug') || '';

    const now = new Date();
    this.minIso = now.toISOString();
    const max = new Date();
    max.setMonth(max.getMonth() + 3);
    this.maxIso = max.toISOString();

    const start = new Date();
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 1);
    this.scheduledIso = start.toISOString();

    if (this.shopId) {
      this.loadData(this.shopId);
    }
  }

  private loadData(shopId: string): void {
    this.loadingData = true;
    this.queueApi.getPublicBarbers(shopId).subscribe({
      next: (list) => {
        this.barbers = list.filter((b) => b.isActive);
        this.loadingData = false;
      },
      error: () => {
        this.barbers = [];
        this.loadingData = false;
      },
    });
    this.queueApi.getPublicServices(shopId).subscribe({
      next: (list) => {
        this.services = list.filter((s) => s.isActive);
      },
      error: () => {
        this.services = [];
      },
    });
  }

  barberInitials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }

  selectBarber(id: string): void {
    this.selectedBarberId = id;
  }

  onScheduleChange(ev: Event): void {
    const v = (ev as CustomEvent<{ value: string | string[] | null | undefined }>).detail?.value;
    if (typeof v === 'string') this.scheduledIso = v;
  }

  selectService(id: string): void {
    this.selectedServiceId = id;
  }

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
      if (!this.selectedServiceId) {
        this.error = 'Please select a service.';
        return;
      }
      if (!this.scheduledIso) {
        this.error = 'Please pick a date and time.';
        return;
      }
      const t = new Date(this.scheduledIso).getTime();
      if (t < Date.now() - 60_000) {
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
    if (p && !p.startsWith('+')) {
      p = '+91' + p;
    }
    return p;
  }

  private friendlyError(err: unknown): string {
    const e = err as {
      graphQLErrors?: { message?: string }[];
      message?: string;
    };
    if (e?.graphQLErrors?.[0]?.message) return e.graphQLErrors[0].message;
    if (e?.message) return e.message;
    return 'Could not complete booking. Please try again.';
  }

  confirmBooking(): void {
    if (!this.shopId || !this.branchId || !this.selectedBarberId || !this.selectedServiceId) {
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
        shopId: this.shopId,
        branchId: this.branchId,
        barberId: this.selectedBarberId,
        serviceId: this.selectedServiceId,
        scheduledAt: new Date(this.scheduledIso).toISOString(),
        guestName: this.guestName.trim(),
        guestPhone: phone,
      })
      .subscribe({
        next: async (appt) => {
          this.loading = false;
          const when = new Date(appt.scheduledAt).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
          });
          const a = await this.alertCtrl.create({
            header: 'Booking confirmed',
            message: `You're booked for ${when}. Reference: ${appt.id.slice(0, 8)}…`,
            buttons: [
              {
                text: 'OK',
                handler: () => {
                  if (this.shopSlug) {
                    void this.router.navigate(['/shop', this.shopSlug]);
                  } else {
                    void this.router.navigate(['/tabs/scan']);
                  }
                },
              },
            ],
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
    if (this.shopSlug) {
      void this.router.navigate(['/shop', this.shopSlug]);
    } else {
      void this.router.navigate(['/tabs/scan']);
    }
  }
}
