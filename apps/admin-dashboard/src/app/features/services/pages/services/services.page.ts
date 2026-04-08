import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../../../core/services/notification.service';

export interface Service {
  id: string;
  name: string;
  category: string;
  durationMins: number;
  price: number;
  status: 'ACTIVE' | 'INACTIVE';
  bookingsToday: number;
}

const SEED_SERVICES: Service[] = [
  { id: '1', name: 'Haircut',         category: 'Hair',      durationMins: 20, price: 200, status: 'ACTIVE',   bookingsToday: 16 },
  { id: '2', name: 'Beard Trim',      category: 'Beard',     durationMins: 10, price: 100, status: 'ACTIVE',   bookingsToday: 12 },
  { id: '3', name: 'Haircut + Beard', category: 'Package',   durationMins: 30, price: 250, status: 'ACTIVE',   bookingsToday: 10 },
  { id: '4', name: 'Hair Spa',        category: 'Treatment', durationMins: 45, price: 500, status: 'ACTIVE',   bookingsToday:  4 },
  { id: '5', name: 'Kids Haircut',    category: 'Hair',      durationMins: 20, price: 150, status: 'ACTIVE',   bookingsToday:  3 },
  { id: '6', name: 'Head Massage',    category: 'Treatment', durationMins: 20, price: 200, status: 'INACTIVE', bookingsToday:  0 },
];

@Component({
  selector: 'tt-services-page',
  templateUrl: './services.page.html',
  styleUrls: ['./services.page.scss'],
})
export class ServicesPageComponent implements OnInit {
  loading = true;
  saving  = false;

  services: Service[] = [];

  dialogVisible     = false;
  deleteConfirmId: string | null = null;
  editingId: string | null = null;
  categories = ['Hair', 'Beard', 'Package', 'Treatment', 'Other'];

  form = { name: '', category: 'Hair', durationMins: 30, price: 25 };

  constructor(private readonly notify: NotificationService) {}

  get activeCount(): number   { return this.services.filter(s => s.status === 'ACTIVE').length; }
  get totalBookings(): number { return this.services.reduce((t, s) => t + s.bookingsToday, 0); }
  get avgPrice(): string {
    const active = this.services.filter(s => s.status === 'ACTIVE');
    if (!active.length) return '—';
    return '₹' + (active.reduce((t, s) => t + s.price, 0) / active.length).toFixed(0);
  }
  get topService(): string {
    const top = [...this.services].sort((a, b) => b.bookingsToday - a.bookingsToday)[0];
    return top?.bookingsToday ? top.name : '—';
  }

  ngOnInit(): void {
    // Simulate load; replace with upsertService GraphQL call in Phase-2
    setTimeout(() => {
      this.services = [...SEED_SERVICES];
      this.loading  = false;
    }, 500);
  }

  openNew(): void {
    this.editingId = null;
    this.form = { name: '', category: 'Hair', durationMins: 30, price: 25 };
    this.dialogVisible = true;
  }

  editService(s: Service): void {
    this.editingId = s.id;
    this.form = { name: s.name, category: s.category, durationMins: s.durationMins, price: s.price };
    this.dialogVisible = true;
  }

  saveService(): void {
    if (!this.form.name.trim()) {
      this.notify.warn('Validation', 'Service name is required.');
      return;
    }
    this.saving = true;

    // Simulate async save (replace with upsertService mutation when backend ready)
    setTimeout(() => {
      if (this.editingId) {
        const idx = this.services.findIndex(s => s.id === this.editingId);
        if (idx !== -1) {
          this.services[idx] = { ...this.services[idx], ...this.form };
          this.services = [...this.services];
        }
        this.notify.success('Updated', `"${this.form.name}" updated successfully.`);
      } else {
        this.services = [...this.services, {
          id: Date.now().toString(),
          ...this.form,
          status:       'ACTIVE',
          bookingsToday: 0,
        }];
        this.notify.success('Added', `"${this.form.name}" added to your catalog.`);
      }
      this.saving        = false;
      this.dialogVisible = false;
    }, 500);
  }

  toggleStatus(s: Service): void {
    const idx = this.services.findIndex(x => x.id === s.id);
    if (idx === -1) return;
    const next  = s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.services[idx] = { ...s, status: next };
    this.services = [...this.services];
    const label = next === 'ACTIVE' ? 'activated' : 'deactivated';
    this.notify.info('Status changed', `"${s.name}" has been ${label}.`);
  }

  deleteService(s: Service): void {
    this.services = this.services.filter(x => x.id !== s.id);
    this.deleteConfirmId = null;
    this.notify.warn('Deleted', `"${s.name}" has been removed from the catalog.`);
  }

  categoryColor(cat: string): string {
    const map: Record<string, string> = {
      Hair: 'cat-hair', Beard: 'cat-beard', Package: 'cat-package',
      Treatment: 'cat-treatment', Other: 'cat-other',
    };
    return map[cat] ?? 'cat-other';
  }
}
