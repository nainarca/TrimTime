import { Component, OnInit } from '@angular/core';

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

@Component({
  selector: 'tt-barbers-page',
  templateUrl: './barbers.page.html',
  styleUrls: ['./barbers.page.scss'],
})
export class BarbersPageComponent implements OnInit {
  loading = true;

  barbers: Barber[] = [
    {
      id: '1', name: 'Mike Johnson',   initials: 'MJ',
      phone: '+1 555-0101', email: 'mike&#64;barbershop.com',
      specialties: ['Haircut', 'Beard Trim'],
      status: 'ACTIVE', rating: 4.9, todayServed: 12, queueSize: 3,
    },
    {
      id: '2', name: 'James Williams', initials: 'JW',
      phone: '+1 555-0102', email: 'james&#64;barbershop.com',
      specialties: ['Haircut', 'Hair Color'],
      status: 'ACTIVE', rating: 4.7, todayServed: 8, queueSize: 2,
    },
    {
      id: '3', name: 'Carlos Martinez', initials: 'CM',
      phone: '+1 555-0103', email: 'carlos&#64;barbershop.com',
      specialties: ['Beard Trim', 'Hot Shave'],
      status: 'ACTIVE', rating: 4.8, todayServed: 6, queueSize: 1,
    },
    {
      id: '4', name: 'David Chen',     initials: 'DC',
      phone: '+1 555-0104', email: 'david&#64;barbershop.com',
      specialties: ['Haircut'],
      status: 'INACTIVE', rating: 4.5, todayServed: 0, queueSize: 0,
    },
  ];

  dialogVisible = false;
  editingId: string | null = null;
  deleteConfirmId: string | null = null;

  form = {
    name: '',
    phone: '',
    email: '',
    specialties: '',
  };

  get totalActive(): number   { return this.barbers.filter(b => b.status === 'ACTIVE').length; }
  get totalServed(): number   { return this.barbers.reduce((s, b) => s + b.todayServed, 0); }
  get avgRating(): string {
    const active = this.barbers.filter(b => b.status === 'ACTIVE');
    if (!active.length) return '—';
    return (active.reduce((s, b) => s + b.rating, 0) / active.length).toFixed(1);
  }

  ngOnInit(): void {
    setTimeout(() => { this.loading = false; }, 600);
  }

  openNew(): void {
    this.editingId = null;
    this.form = { name: '', phone: '', email: '', specialties: '' };
    this.dialogVisible = true;
  }

  editBarber(b: Barber): void {
    this.editingId = b.id;
    this.form = {
      name: b.name,
      phone: b.phone,
      email: b.email,
      specialties: b.specialties.join(', '),
    };
    this.dialogVisible = true;
  }

  saveBarber(): void {
    if (!this.form.name.trim()) return;
    const specialties = this.form.specialties
      .split(',').map(s => s.trim()).filter(Boolean);

    if (this.editingId) {
      const idx = this.barbers.findIndex(b => b.id === this.editingId);
      if (idx !== -1) {
        this.barbers[idx] = {
          ...this.barbers[idx],
          name: this.form.name,
          initials: this.initials(this.form.name),
          phone: this.form.phone,
          email: this.form.email,
          specialties,
        };
        this.barbers = [...this.barbers];
      }
    } else {
      this.barbers = [...this.barbers, {
        id: Date.now().toString(),
        name: this.form.name,
        initials: this.initials(this.form.name),
        phone: this.form.phone,
        email: this.form.email,
        specialties,
        status: 'ACTIVE',
        rating: 5.0,
        todayServed: 0,
        queueSize: 0,
      }];
    }
    this.dialogVisible = false;
  }

  toggleStatus(b: Barber): void {
    const idx = this.barbers.findIndex(x => x.id === b.id);
    if (idx !== -1) {
      this.barbers[idx] = {
        ...b,
        status: b.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
      };
      this.barbers = [...this.barbers];
    }
  }

  deleteBarber(b: Barber): void {
    this.barbers = this.barbers.filter(x => x.id !== b.id);
    this.deleteConfirmId = null;
  }

  starsArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i);
  }

  private initials(name: string): string {
    return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  }
}
