import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

export interface StaffMember {
  id: string;
  name: string;
  initials: string;
  avatarUrl: string;     // base64 data-URL or remote URL; '' = show initials
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

  private av = (n: string, c: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&background=${c}&color=fff&size=200&bold=true`;

  staff: StaffMember[] = [
    { id: '1', name: 'Ganesh Kumar',   initials: 'GK', avatarUrl: this.av('Ganesh Kumar',   '0f172a'), role: 'OWNER',       phone: '+91 98765 00001', email: 'owner@elitebarber.in',   status: 'ACTIVE',   joinedDate: 'Jan 2023', lastActive: 'Today'     },
    { id: '2', name: 'Arjun Kumar',    initials: 'AK', avatarUrl: this.av('Arjun Kumar',    '6366f1'), role: 'BARBER',      phone: '+91 98765 00011', email: 'arjun@elitebarber.in',   status: 'ACTIVE',   joinedDate: 'Feb 2023', lastActive: 'Today'     },
    { id: '3', name: 'Karthik Raja',   initials: 'KR', avatarUrl: this.av('Karthik Raja',   '10b981'), role: 'BARBER',      phone: '+91 98765 00012', email: 'karthik@elitebarber.in', status: 'ACTIVE',   joinedDate: 'Mar 2023', lastActive: 'Today'     },
    { id: '4', name: 'Rahim Sheikh',   initials: 'RS', avatarUrl: this.av('Rahim Sheikh',   'f59e0b'), role: 'BARBER',      phone: '+91 98765 00013', email: 'rahim@elitebarber.in',   status: 'ACTIVE',   joinedDate: 'Apr 2023', lastActive: 'Today'     },
    { id: '5', name: 'Vijay Kumar',    initials: 'VK', avatarUrl: this.av('Vijay Kumar',    'ef4444'), role: 'BARBER',      phone: '+91 98765 00014', email: 'vijay@elitebarber.in',   status: 'ACTIVE',   joinedDate: 'Jun 2023', lastActive: 'Yesterday' },
    { id: '6', name: 'Meena Priya',    initials: 'MP', avatarUrl: this.av('Meena Priya',    'ec4899'), role: 'RECEPTIONIST',phone: '+91 98765 00020', email: 'meena@elitebarber.in',   status: 'ACTIVE',   joinedDate: 'Aug 2023', lastActive: 'Today'     },
  ];

  dialogVisible      = false;
  deleteConfirmId: string | null = null;
  editingId: string | null = null;
  saving = false;
  roles = ['OWNER', 'BARBER', 'ADMIN', 'RECEPTIONIST'];

  form: {
    name: string;
    phone: string;
    email: string;
    role: 'OWNER' | 'BARBER' | 'ADMIN' | 'RECEPTIONIST';
    avatarUrl: string;
    avatarPreview: string;   // shown in dialog; may be blob URL or data-URL
  } = { name: '', phone: '', email: '', role: 'BARBER', avatarUrl: '', avatarPreview: '' };

  constructor(private readonly cdr: ChangeDetectorRef) {}

  get previewInitials(): string {
    return this.form.name
      ? this.form.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
      : 'Photo';
  }

  get activeCount(): number { return this.staff.filter(s => s.status === 'ACTIVE').length; }
  get barberCount(): number { return this.staff.filter(s => s.role === 'BARBER').length; }
  get ownerCount():  number { return this.staff.filter(s => s.role === 'OWNER').length; }

  ngOnInit(): void {
    setTimeout(() => { this.loading = false; }, 600);
  }

  openNew(): void {
    this.editingId = null;
    this.form = { name: '', phone: '', email: '', role: 'BARBER', avatarUrl: '', avatarPreview: '' };
    this.dialogVisible = true;
  }

  editMember(m: StaffMember): void {
    this.editingId = m.id;
    this.form = {
      name:          m.name,
      phone:         m.phone,
      email:         m.email,
      role:          m.role,
      avatarUrl:     m.avatarUrl,
      avatarPreview: m.avatarUrl,
    };
    this.dialogVisible = true;
  }

  /** Called when user picks a file from the file input */
  onPhotoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input?.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      this.form.avatarUrl     = result;   // base64 data-URL stored in record
      this.form.avatarPreview = result;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  removePhoto(): void {
    this.form.avatarUrl     = '';
    this.form.avatarPreview = '';
  }

  saveMember(): void {
    if (!this.form.name.trim()) return;
    this.saving = true;
    const initials = this.form.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);

    setTimeout(() => {
      if (this.editingId) {
        const idx = this.staff.findIndex(s => s.id === this.editingId);
        if (idx !== -1) {
          this.staff[idx] = { ...this.staff[idx], ...this.form, initials, avatarUrl: this.form.avatarUrl };
          this.staff = [...this.staff];
        }
      } else {
        this.staff = [...this.staff, {
          id:          Date.now().toString(),
          initials,
          avatarUrl:   this.form.avatarUrl,
          name:        this.form.name,
          phone:       this.form.phone,
          email:       this.form.email,
          role:        this.form.role,
          status:      'ACTIVE',
          joinedDate:  'Just now',
          lastActive:  'Today',
        }];
      }
      this.saving        = false;
      this.dialogVisible = false;
    }, 400);
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
