import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NotificationService } from '../../../../core/services/notification.service';

export interface Barber {
  id: string;
  name: string;
  initials: string;
  avatarUrl: string;
  phone: string;
  email: string;
  specialties: string[];
  status: 'ACTIVE' | 'INACTIVE';
  rating: number;
  todayServed: number;
  queueSize: number;
}

const AV = (n: string, c: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&background=${c}&color=fff&size=200&bold=true`;

const SEED_BARBERS: Barber[] = [
  { id: '1', name: 'Arjun Kumar',   initials: 'AK', avatarUrl: AV('Arjun Kumar',   '6366f1'), phone: '+91 98765 00011', email: 'arjun@elitebarber.in',   specialties: ['Haircut', 'Fade', 'Texture'], status: 'ACTIVE',   rating: 4.9, todayServed: 16, queueSize: 3 },
  { id: '2', name: 'Karthik Raja',  initials: 'KR', avatarUrl: AV('Karthik Raja',  '10b981'), phone: '+91 98765 00012', email: 'karthik@elitebarber.in',  specialties: ['Beard Trim', 'Hot Shave'],     status: 'ACTIVE',   rating: 4.7, todayServed: 14, queueSize: 2 },
  { id: '3', name: 'Rahim Sheikh',  initials: 'RS', avatarUrl: AV('Rahim Sheikh',  'f59e0b'), phone: '+91 98765 00013', email: 'rahim@elitebarber.in',    specialties: ['Haircut + Beard', 'Hair Spa'], status: 'ACTIVE',   rating: 4.8, todayServed: 12, queueSize: 1 },
  { id: '4', name: 'Vijay Kumar',   initials: 'VK', avatarUrl: AV('Vijay Kumar',   'ef4444'), phone: '+91 98765 00014', email: 'vijay@elitebarber.in',    specialties: ['Kids Cut', 'Haircut'],         status: 'ACTIVE',   rating: 4.5, todayServed:  6, queueSize: 0 },
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

  dialogVisible    = false;
  editingId: string | null = null;
  deleteConfirmId: string | null = null;

  form = {
    name: '', phone: '', email: '', specialties: '',
    avatarUrl: '',
    avatarPreview: '',   // shown in dialog preview
  };

  constructor(
    private readonly notify: NotificationService,
    private readonly cdr:    ChangeDetectorRef,
  ) {}

  get totalActive(): number { return this.barbers.filter(b => b.status === 'ACTIVE').length; }
  get totalServed(): number { return this.barbers.reduce((s, b) => s + b.todayServed, 0); }
  get avgRating(): string {
    const active = this.barbers.filter(b => b.status === 'ACTIVE');
    if (!active.length) return '—';
    return (active.reduce((s, b) => s + b.rating, 0) / active.length).toFixed(1);
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.barbers = [...SEED_BARBERS];
      this.loading = false;
    }, 500);
  }

  openNew(): void {
    this.editingId = null;
    this.form = { name: '', phone: '', email: '', specialties: '', avatarUrl: '', avatarPreview: '' };
    this.dialogVisible = true;
  }

  editBarber(b: Barber): void {
    this.editingId = b.id;
    this.form = {
      name:          b.name,
      phone:         b.phone,
      email:         b.email,
      specialties:   b.specialties.join(', '),
      avatarUrl:     b.avatarUrl || '',
      avatarPreview: b.avatarUrl || '',
    };
    this.dialogVisible = true;
  }

  /** Handle file picker */
  onPhotoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input?.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      this.form.avatarUrl     = result;
      this.form.avatarPreview = result;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  removePhoto(): void {
    this.form.avatarUrl     = '';
    this.form.avatarPreview = '';
  }

  saveBarber(): void {
    if (!this.form.name.trim()) {
      this.notify.warn('Validation', 'Barber name is required.');
      return;
    }
    const specialties = this.form.specialties.split(',').map(s => s.trim()).filter(Boolean);
    this.saving = true;

    setTimeout(() => {
      if (this.editingId) {
        const idx = this.barbers.findIndex(b => b.id === this.editingId);
        if (idx !== -1) {
          this.barbers[idx] = {
            ...this.barbers[idx],
            name:        this.form.name,
            initials:    this.toInitials(this.form.name),
            avatarUrl:   this.form.avatarUrl,
            phone:       this.form.phone,
            email:       this.form.email,
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
          avatarUrl:   this.form.avatarUrl,
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
      this.saving        = false;
      this.dialogVisible = false;
    }, 500);
  }

  toggleStatus(b: Barber): void {
    const idx = this.barbers.findIndex(x => x.id === b.id);
    if (idx === -1) return;
    const next = b.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.barbers[idx] = { ...b, status: next };
    this.barbers = [...this.barbers];
    this.notify.info('Status changed', `${b.name} ${next === 'ACTIVE' ? 'activated' : 'deactivated'}.`);
  }

  deleteBarber(b: Barber): void {
    this.barbers = this.barbers.filter(x => x.id !== b.id);
    this.deleteConfirmId = null;
    this.notify.warn('Deleted', `${b.name} removed.`);
  }

  starsArray(): number[] {
    return Array.from({ length: 5 });
  }

  private toInitials(name: string): string {
    return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  }
}
