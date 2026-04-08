import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { QueueApiService, PublicService, PublicBarber } from './services/queue-api.service';

export interface ServiceOption extends PublicService {
  icon: string;
}

export interface BarberOption extends PublicBarber {}

const PROFILE_KEY = 'queuecut_customer_profile';

interface CustomerProfile {
  name:    string;
  phone:   string;
  age:     string;
  gender:  string;
  address: string;
  pincode: string;
}

@Component({
  standalone: true,
  selector: 'tt-join-queue-page',
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './join-queue.page.html',
  styleUrls: ['./join-queue.page.scss'],
})
export class JoinQueuePage implements OnInit {
  shopId: string | null   = null;
  branchId: string | null = null;
  shopName   = '';
  branchName = '';

  // ── Customer details ──────────────────────────────────────────
  guestName    = '';
  guestPhone   = '';
  guestAge     = '';
  guestGender  = '';
  guestAddress = '';
  guestPincode = '';

  loading     = false;
  loadingData = false;
  error       = '';

  services: ServiceOption[] = [];
  barbers:  BarberOption[]  = [];

  selectedServiceIds = new Set<string>();
  selectedBarberId: string | null = null;  // null = "Any Barber"

  readonly genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

  private readonly mockServices: ServiceOption[] = [
    { id: 's1', name: 'Haircut',         durationMins: 30, price: 25, currency: 'USD', shopId: '', description: null, isActive: true, icon: 'cut-outline'          },
    { id: 's2', name: 'Beard Trim',      durationMins: 20, price: 15, currency: 'USD', shopId: '', description: null, isActive: true, icon: 'color-filter-outline' },
    { id: 's3', name: 'Haircut + Beard', durationMins: 45, price: 35, currency: 'USD', shopId: '', description: null, isActive: true, icon: 'sparkles-outline'     },
    { id: 's4', name: 'Hair Wash',       durationMins: 15, price: 10, currency: 'USD', shopId: '', description: null, isActive: true, icon: 'water-outline'        },
  ];

  constructor(
    private readonly route:    ActivatedRoute,
    private readonly router:   Router,
    private readonly queueApi: QueueApiService,
  ) {}

  ngOnInit(): void {
    this.shopId     = this.route.snapshot.queryParamMap.get('shopId');
    this.branchId   = this.route.snapshot.queryParamMap.get('branchId');
    this.shopName   = this.route.snapshot.queryParamMap.get('shopName')   || '';
    this.branchName = this.route.snapshot.queryParamMap.get('branchName') || '';

    // Handle "no branch" error from shop-landing
    const err = this.route.snapshot.queryParamMap.get('error');
    if (err === 'no-branch') {
      this.error = 'This shop has no branches configured yet. Please contact the shop owner.';
    }

    // Pre-fill from saved profile
    this.loadProfile();

    if (this.shopId) {
      this.loadShopData(this.shopId);
    }
  }

  // ── Profile persistence ──────────────────────────────────────

  private loadProfile(): void {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) {
        const p: CustomerProfile = JSON.parse(raw);
        this.guestName    = p.name    || '';
        this.guestPhone   = p.phone   || '';
        this.guestAge     = p.age     || '';
        this.guestGender  = p.gender  || '';
        this.guestAddress = p.address || '';
        this.guestPincode = p.pincode || '';
      }
    } catch { /* ignore */ }
  }

  private saveProfile(): void {
    try {
      const p: CustomerProfile = {
        name:    this.guestName.trim(),
        phone:   this.guestPhone.trim(),
        age:     this.guestAge.trim(),
        gender:  this.guestGender,
        address: this.guestAddress.trim(),
        pincode: this.guestPincode.trim(),
      };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    } catch { /* ignore */ }
  }

  // ── Shop data ────────────────────────────────────────────────

  private loadShopData(shopId: string): void {
    this.loadingData = true;

    this.queueApi.getPublicServices(shopId).subscribe({
      next: (svcs) => {
        this.services    = svcs.length > 0
          ? svcs.map((s) => ({ ...s, icon: this.iconForService(s.name) }))
          : this.mockServices;
        this.loadingData = false;
      },
      error: () => {
        this.services    = this.mockServices;
        this.loadingData = false;
      },
    });

    this.queueApi.getPublicBarbers(shopId).subscribe({
      next:  (list) => { this.barbers = list.filter((b) => b.isActive); },
      error: ()     => { this.barbers = []; },
    });
  }

  private iconForService(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('beard') || n.includes('shave')) return 'color-filter-outline';
    if (n.includes('wash') || n.includes('shampoo')) return 'water-outline';
    if (n.includes('color') || n.includes('dye') || n.includes('highlight')) return 'color-palette-outline';
    if (n.includes('massage') || n.includes('spa') || n.includes('facial')) return 'sparkles-outline';
    if (n.includes('kid') || n.includes('child')) return 'happy-outline';
    return 'cut-outline';
  }

  // ── Service selection (multi-select) ────────────────────────

  toggleService(id: string): void {
    if (this.selectedServiceIds.has(id)) {
      this.selectedServiceIds.delete(id);
    } else {
      this.selectedServiceIds.add(id);
    }
    this.selectedServiceIds = new Set(this.selectedServiceIds);
  }

  isServiceSelected(id: string): boolean {
    return this.selectedServiceIds.has(id);
  }

  get selectedServices(): ServiceOption[] {
    return this.services.filter((s) => this.selectedServiceIds.has(s.id));
  }

  get totalPrice(): number {
    return this.selectedServices.reduce((sum, s) => sum + s.price, 0);
  }

  get totalDurationMins(): number {
    return this.selectedServices.reduce((sum, s) => sum + s.durationMins, 0);
  }

  get currency(): string {
    return this.selectedServices[0]?.currency ?? 'USD';
  }

  get priceDisplay(): string {
    if (this.selectedServiceIds.size === 0) return '—';
    return `${this.currency} ${this.totalPrice.toFixed(2)}`;
  }

  get durationDisplay(): string {
    if (this.totalDurationMins === 0) return '';
    const h = Math.floor(this.totalDurationMins / 60);
    const m = this.totalDurationMins % 60;
    return h > 0 ? `${h}h ${m > 0 ? m + 'm' : ''}`.trim() : `${m} min`;
  }

  // ── Barber selection ─────────────────────────────────────────

  selectBarber(id: string | null): void {
    this.selectedBarberId = id;
  }

  barberInitials(name: string): string {
    return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  }

  // ── Phone normalisation ──────────────────────────────────────

  private normalizePhone(raw: string): string {
    let p = raw.replace(/[\s\-\(\)\.]/g, '');
    if (p && !p.startsWith('+')) {
      p = '+91' + p;
    }
    return p;
  }

  // ── Submit ───────────────────────────────────────────────────

  get isFormValid(): boolean {
    return !!(this.shopId && this.branchId && this.guestName.trim() && this.guestPhone.trim());
  }

  join(): void {
    if (!this.shopId || !this.branchId) {
      this.error = 'Invalid shop or branch. Please scan again.';
      return;
    }
    if (!this.guestName.trim()) {
      this.error = 'Please enter your name.';
      return;
    }
    if (!this.guestAge.trim()) {
      this.error = 'Please enter your age.';
      return;
    }
    if (!this.guestGender) {
      this.error = 'Please select your gender.';
      return;
    }
    if (!this.guestPhone.trim()) {
      this.error = 'Please enter your WhatsApp number.';
      return;
    }

    const phone = this.normalizePhone(this.guestPhone.trim());
    if (!/^\+[1-9]\d{6,14}$/.test(phone)) {
      this.error = 'Enter a valid phone number with country code, e.g. +91 98765 43210';
      return;
    }

    if (!this.guestAddress.trim()) {
      this.error = 'Please enter your address.';
      return;
    }
    if (!this.guestPincode.trim()) {
      this.error = 'Please enter your pincode.';
      return;
    }

    this.loading = true;
    this.error   = '';

    // Serialize extra profile fields into notes
    const notes = JSON.stringify({
      age:     this.guestAge.trim(),
      gender:  this.guestGender,
      address: this.guestAddress.trim(),
      pincode: this.guestPincode.trim(),
    });

    this.queueApi
      .joinQueue({
        shopId:     this.shopId,
        branchId:   this.branchId,
        entryType:  'WALK_IN',
        priority:   1,
        guestName:  this.guestName.trim(),
        guestPhone: phone,
        barberId:   this.selectedBarberId || undefined,
        notes,
      })
      .subscribe({
        next: (entry) => {
          this.loading = false;
          this.saveProfile();           // persist for next visit
          const selectedBarber = this.barbers.find(b => b.id === this.selectedBarberId);
          this.router.navigate(['/queue', entry.id], {
            queryParams: {
              shopName:   this.shopName,
              barberName: selectedBarber?.displayName || '',
            },
          });
        },
        error: (err) => {
          this.loading = false;
          this.error = err.message || 'Could not join queue. Please try again.';
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/tabs/scan']);
  }
}
