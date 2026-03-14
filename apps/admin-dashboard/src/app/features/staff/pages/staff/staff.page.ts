import { Component, OnInit } from '@angular/core';
import { StaffService, StaffMember } from '../../../../core/services/staff.service';
import { TenantContextService } from '../../../../core/services/tenant-context.service';

@Component({
  selector: 'tt-staff-page',
  templateUrl: './staff.page.html',
  styleUrls: ['./staff.page.scss'],
})
export class StaffPageComponent implements OnInit {
  shopId: string | null = null;
  staff: StaffMember[] = [];
  loading = false;

  staffDialogVisible = false;
  editingStaff: StaffMember | null = null;
  form = {
    name: '',
    phone: '',
    role: 'BARBER',
    workingHours: '',
  };

  constructor(
    private readonly staffService: StaffService,
    private readonly tenant: TenantContextService,
  ) {}

  ngOnInit(): void {
    this.shopId = this.tenant.getShopId();
    if (!this.shopId) {
      return;
    }
    this.loadStaff();
  }

  loadStaff(): void {
    if (!this.shopId) return;
    this.loading = true;
    this.staffService.list(this.shopId).subscribe({
      next: (items) => {
        this.staff = items;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  openNew(): void {
    this.editingStaff = null;
    this.form = {
      name: '',
      phone: '',
      role: 'BARBER',
      workingHours: '',
    };
    this.staffDialogVisible = true;
  }

  editStaff(member: StaffMember): void {
    this.editingStaff = member;
    this.form = {
      name: member.displayName,
      phone: '',
      role: 'BARBER',
      workingHours: '',
    };
    this.staffDialogVisible = true;
  }

  saveStaff(): void {
    if (!this.shopId) return;
    const baseInput = {
      shopId: this.shopId,
      userId: this.editingStaff?.userId ?? 'USER_ID_PLACEHOLDER',
      displayName: this.form.name,
      bio: null,
      branchId: null,
      queueAccepting: true,
      maxQueueSize: 20,
    };

    const input = this.editingStaff ? { ...baseInput, id: this.editingStaff.id } : baseInput;

    this.staffService.upsert(input).subscribe({
      next: () => {
        this.staffDialogVisible = false;
        this.loadStaff();
      },
      error: () => {
        this.staffDialogVisible = false;
      },
    });
  }
}

