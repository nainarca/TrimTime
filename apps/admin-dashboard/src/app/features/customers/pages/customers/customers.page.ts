import { Component, OnInit } from '@angular/core';
import { CustomersService, Customer } from '../../../../core/services/customers.service';
import { TenantContextService } from '../../../../core/services/tenant-context.service';

@Component({
  selector: 'tt-customers-page',
  templateUrl: './customers.page.html',
  styleUrls: ['./customers.page.scss'],
})
export class CustomersPageComponent implements OnInit {
  shopId: string | null = null;
  customers: Customer[] = [];
  loading = false;

  visitDialogVisible = false;
  selectedCustomer: Customer | null = null;
  visitHistory: { date: string; type: string; description: string }[] = [];
  visitLoading = false;

  constructor(
    private readonly customersService: CustomersService,
    private readonly tenant: TenantContextService,
  ) {}

  ngOnInit(): void {
    this.shopId = this.tenant.getShopId();
    if (!this.shopId) {
      return;
    }
    this.loadCustomers();
  }

  loadCustomers(): void {
    if (!this.shopId) return;
    this.loading = true;
    this.customersService.list(this.shopId).subscribe({
      next: (items) => {
        this.customers = items;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  get activeCustomers(): number { return this.customers.filter(c => c.isActive).length; }
  get phoneCustomers(): number  { return this.customers.filter(c => c.phone && !c.email).length; }

  initials(c: Customer): string {
    const name = c.name || c.phone || c.email || '?';
    return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  }

  get visitInitials(): string {
    if (!this.selectedCustomer) return '?';
    return this.initials(this.selectedCustomer);
  }

  viewHistory(customer: Customer): void {
    this.selectedCustomer = customer;
    this.visitDialogVisible = true;
    // TODO: replace with real visit history from GraphQL when available
    this.visitLoading = true;
    this.visitHistory = [];
    setTimeout(() => {
      this.visitHistory = [];
      this.visitLoading = false;
    }, 300);
  }
}

