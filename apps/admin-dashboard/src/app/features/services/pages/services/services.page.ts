import { Component, OnInit } from '@angular/core';

export interface Service {
  id: string;
  name: string;
  category: string;
  durationMins: number;
  price: number;
  status: 'ACTIVE' | 'INACTIVE';
  bookingsToday: number;
}

@Component({
  selector: 'tt-services-page',
  templateUrl: './services.page.html',
  styleUrls: ['./services.page.scss'],
})
export class ServicesPageComponent implements OnInit {
  loading = true;

  services: Service[] = [
    { id: '1', name: 'Haircut',         category: 'Hair',    durationMins: 30, price: 25, status: 'ACTIVE',   bookingsToday: 14 },
    { id: '2', name: 'Beard Trim',      category: 'Beard',   durationMins: 15, price: 15, status: 'ACTIVE',   bookingsToday: 9  },
    { id: '3', name: 'Haircut + Beard', category: 'Package', durationMins: 45, price: 35, status: 'ACTIVE',   bookingsToday: 6  },
    { id: '4', name: 'Hot Towel Shave', category: 'Beard',   durationMins: 30, price: 28, status: 'ACTIVE',   bookingsToday: 4  },
    { id: '5', name: 'Hair Coloring',   category: 'Hair',    durationMins: 90, price: 65, status: 'INACTIVE', bookingsToday: 0  },
  ];

  dialogVisible = false;
  deleteConfirmId: string | null = null;
  editingId: string | null = null;
  categories = ['Hair', 'Beard', 'Package', 'Treatment', 'Other'];

  form = { name: '', category: 'Hair', durationMins: 30, price: 25 };

  get activeCount(): number   { return this.services.filter(s => s.status === 'ACTIVE').length; }
  get totalBookings(): number { return this.services.reduce((t, s) => t + s.bookingsToday, 0); }
  get avgPrice(): string {
    const active = this.services.filter(s => s.status === 'ACTIVE');
    if (!active.length) return '—';
    return '$' + (active.reduce((t, s) => t + s.price, 0) / active.length).toFixed(0);
  }
  get topService(): string {
    const top = [...this.services].sort((a, b) => b.bookingsToday - a.bookingsToday)[0];
    return top?.bookingsToday ? top.name : '—';
  }

  ngOnInit(): void {
    setTimeout(() => { this.loading = false; }, 600);
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
    if (!this.form.name.trim()) return;
    if (this.editingId) {
      const idx = this.services.findIndex(s => s.id === this.editingId);
      if (idx !== -1) {
        this.services[idx] = { ...this.services[idx], ...this.form };
        this.services = [...this.services];
      }
    } else {
      this.services = [...this.services, {
        id: Date.now().toString(), ...this.form, status: 'ACTIVE', bookingsToday: 0,
      }];
    }
    this.dialogVisible = false;
  }

  toggleStatus(s: Service): void {
    const idx = this.services.findIndex(x => x.id === s.id);
    if (idx !== -1) {
      this.services[idx] = { ...s, status: s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' };
      this.services = [...this.services];
    }
  }

  deleteService(s: Service): void {
    this.services = this.services.filter(x => x.id !== s.id);
    this.deleteConfirmId = null;
  }

  categoryColor(cat: string): string {
    const map: Record<string, string> = {
      Hair: 'cat-hair', Beard: 'cat-beard', Package: 'cat-package',
      Treatment: 'cat-treatment', Other: 'cat-other',
    };
    return map[cat] ?? 'cat-other';
  }
}
