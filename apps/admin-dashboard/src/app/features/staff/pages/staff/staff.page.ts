import { Component, OnInit } from '@angular/core';

export interface StaffMember {
  id: string;
  name: string;
  initials: string;
  role: 'OWNER' | 'BARBER' | 'ADMIN' | 'RECEPTIONIST';
  phone: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
  joinedDate: string;
  lastActive: string;
}

@Component({
  selector: 'tt-staff-page',
  templateUrl: './staff.page.html',
  styleUrls: ['./staff.page.scss'],
})
export class StaffPageComponent implements OnInit {
  loading = true;

  staff: StaffMember[] = [
    { id: '1', name: 'Mike Owner',     initials: 'MO', role: 'OWNER',       phone: '+1 555-0100', email: 'mike&#64;barbershop.com',   status: 'ACTIVE',   joinedDate: 'Jan 2022', lastActive: 'Today'      },
    { id: '2', name: 'James Williams', initials: 'JW', role: 'BARBER',      phone: '+1 555-0102', email: 'james&#64;barbershop.com',  status: 'ACTIVE',   joinedDate: 'Mar 2022', lastActive: 'Today'      },
    { id: '3', name: 'Carlos Martinez',initials: 'CM', role: 'BARBER',      phone: '+1 555-0103', email: 'carlos&#64;barbershop.com', status: 'ACTIVE',   joinedDate: 'Jun 2022', lastActive: 'Yesterday'  },
    { id: '4', name: 'Sarah Chen',     initials: 'SC', role: 'RECEPTIONIST',phone: '+1 555-0105', email: 'sarah&#64;barbershop.com',  status: 'ACTIVE',   joinedDate: 'Sep 2023', lastActive: 'Today'      },
    { id: '5', name: 'David Lee',      initials: 'DL', role: 'BARBER',      phone: '+1 555-0104', email: 'david&#64;barbershop.com',  status: 'INACTIVE', joinedDate: 'Dec 2021', lastActive: '2 weeks ago'},
  ];

  dialogVisible = false;
  deleteConfirmId: string | null = null;
  editingId: string | null = null;
  roles = ['OWNER', 'BARBER', 'ADMIN', 'RECEPTIONIST'];

  form: { name: string; phone: string; email: string; role: 'OWNER' | 'BARBER' | 'ADMIN' | 'RECEPTIONIST' } =
    { name: '', phone: '', email: '', role: 'BARBER' };

  get activeCount(): number { return this.staff.filter(s => s.status === 'ACTIVE').length; }
  get barberCount(): number { return this.staff.filter(s => s.role === 'BARBER').length; }
  get ownerCount(): number  { return this.staff.filter(s => s.role === 'OWNER').length; }

  ngOnInit(): void {
    setTimeout(() => { this.loading = false; }, 600);
  }

  openNew(): void {
    this.editingId = null;
    this.form = { name: '', phone: '', email: '', role: 'BARBER' };
    this.dialogVisible = true;
  }

  editMember(m: StaffMember): void {
    this.editingId = m.id;
    this.form = { name: m.name, phone: m.phone, email: m.email, role: m.role as 'OWNER' | 'BARBER' | 'ADMIN' | 'RECEPTIONIST' };
    this.dialogVisible = true;
  }

  saveMember(): void {
    if (!this.form.name.trim()) return;
    const initials = this.form.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
    if (this.editingId) {
      const idx = this.staff.findIndex(s => s.id === this.editingId);
      if (idx !== -1) {
        this.staff[idx] = { ...this.staff[idx], ...this.form, initials };
        this.staff = [...this.staff];
      }
    } else {
      this.staff = [...this.staff, {
        id: Date.now().toString(), initials, ...this.form,
        status: 'ACTIVE', joinedDate: 'Just now', lastActive: 'Today',
      } as StaffMember];
    }
    this.dialogVisible = false;
  }

  toggleStatus(m: StaffMember): void {
    const idx = this.staff.findIndex(s => s.id === m.id);
    if (idx !== -1) {
      this.staff[idx] = { ...m, status: m.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' };
      this.staff = [...this.staff];
    }
  }

  deleteMember(m: StaffMember): void {
    this.staff = this.staff.filter(s => s.id !== m.id);
    this.deleteConfirmId = null;
  }

  roleClass(role: string): string {
    const map: Record<string, string> = {
      OWNER: 'role-owner', BARBER: 'role-barber',
      ADMIN: 'role-admin', RECEPTIONIST: 'role-reception',
    };
    return map[role] ?? 'role-barber';
  }
}
