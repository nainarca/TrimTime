import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../../../core/services/notification.service';

export interface Barber {
  id: string;
  name: string;
  initials: string;
  phone: string;
  email: string;
  specialties: string[];
  status: 'ACTIVE' | 'INACTIVE';
  rating: number;
  todayServed: number;
  queueSize: number;
}

const SEED_BARBERS: Barber[] = [
  {
    id: '1', name: 'Mike Johnson',    initials: 'MJ',
    phone: '+1 555-0101', email: 'mike@barbershop.com',
    specialties: ['Haircut', 'Beard Trim'],
    status: 'ACTIVE', rating: 4.9, todayServed: 12, queueSize: 3,
  },
  {
    id: '2', name: 'James Williams',  initials: 'JW',
    phone: '+1 555-0102', email: 'james@barbershop.com',
    specialties: ['Haircut', 'Hair Color'],
    status: 'ACTIVE', rating: 4.7, todayServed: 8, queueSize: 2,
  },
  {
    id: '3', name: 'Carlos Martinez', initials: 'CM',
    phone: '+1 555-0103', email: 'carlos@barbershop.com',
    specialties: ['Beard Trim', 'Hot Shave'],
    status: 'ACTIVE', rating: 4.8, todayServed: 6, queueSize: 1,
  },
  {
    id: '4', name: 'David Chen',      initials: 'DC',
    phone: '+1 555-0104', email: 'david@barbershop.com',
    specialties: ['Haircut'],
    status: 'INACTIVE', rating: 4.5, todayServed: 0, queueSize: 0,
  },
];

@Component({
  selector: 'tt-barbers-page',
  templateUrl: './barbers.page.html',
  styleUrls: ['./barbers.page.scss'],
})
export class BarbersPageComponent implements OnInit {
  loading  = true;
  saving   = false;

  barbers: Barber[] = [];

  dialogVisible     = false;
  editingId: string | null = null;
  deleteConfirmId: string | null = null;

  form = { name: '', phone: '', email: '', specialties: '' };

  constructor(private readonly notify: NotificationService) {}

  get totalActive(): number { return this.barbers.filter(b => b.status === 'ACTIVE').length; }
  get totalServed(): number { return this.barbers.reduce((s, b) => s + b.todayServed, 0); }
  get avgRating(): string {
    const active = this.barbers.filter(b => b.status === 'ACTIVE');
    if (!active.length) return '—';
    return (active.reduce((s, b) => s + b.rating, 0) / active.length).toFixed(1);
  }

  ngOnInit(): void {
    // Simulate loading from API; replace with real GraphQL call when barbers
    // resolver is added to the backend (Phase-2).
    setTimeout(() => {
      this.barbers = [...SEED_BARBERS];
      this.loading = false;
    }, 500);
  }

  openNew(): void {
    this.editingId = null;
    this.form = { name: '', phone: '', email: '', specialties: '' };
    this.dialogVisible = true;
  }

  editBarber(b: Barber): void {
    this.editingId = b.id;
    this.form = {
      name:        b.name,
      phone:       b.phone,
      email:       b.email,
      specialties: b.specialties.join(', '),
    };
    this.dialogVisible = true;
  }

  saveBarber(): void {
    if (!this.form.name.trim()) {
      this.notify.warn('Validation', 'Barber name is required.');
      return;
    }
    const specialties = this.form.specialties.split(',').map(s => s.trim()).filter(Boolean);
    this.saving = true;

    // Simulate async save (replace with upsertBarber mutation when available)
    setTimeout(() => {
      if (this.editingId) {
        const idx = this.barbers.findIndex(b => b.id === this.editingId);
        if (idx !== -1) {
          this.barbers[idx] = {
            ...this.barbers[idx],
            name:       this.form.name,
            initials:   this.toInitials(this.form.name),
            phone:      this.form.phone,
            email:      this.form.email,
            specialties,
          };
          this.barbers = [...this.barbers];
        }
        this.notify.success('Updated', `${this.form.name} updated successfully.`);
      } else {
        this.barbers = [...this.barbers, {
          id:          Date.now().toString(),
          name:        this.form.name,
          initials:    this.toInitials(this.form.name),
          phone:       this.form.phone,
          email:       this.form.email,
          specialties,
          status:      'ACTIVE',
          rating:      5.0,
          todayServed: 0,
          queueSize:   0,
        }];
        this.notify.success('Added', `${this.form.name} added to your team.`);
      }
      this.saving       = false;
      this.dialogVisible = false;
    }, 500);
  }

  toggleStatus(b: Barber): void {
    const idx = this.barbers.findIndex(x => x.id === b.id);
    if (idx === -1) return;
    const next = b.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.barbers[idx] = { ...b, status: next };
    this.barbers = [...this.barbers];
    const label = next === 'ACTIVE' ? 'activated' : 'deactivated';
    this.notify.info('Status changed', `${b.name} has been ${label}.`);
  }

  deleteBarber(b: Barber): void {
    this.barbers = this.barbers.filter(x => x.id !== b.id);
    this.deleteConfirmId = null;
    this.notify.warn('Deleted', `${b.name} has been removed.`);
  }

  starsArray(_rating: number): number[] {
    return Array.from({ length: 5 });
  }

  private toInitials(name: string): string {
    return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  }
}
