import { Component, OnInit } from '@angular/core';
import { CustomersService, Customer } from '../../../../core/services/customers.service';
import { TenantContextService } from '../../../../core/services/tenant-context.service';
import { NotificationService } from '../../../../core/services/notification.service';

// Demo seed — shown when the backend customers resolver is not yet available.
const MOCK_CUSTOMERS: Customer[] = [
  { id: 'm1', name: 'James Carter',    phone: '+1 555-2001', email: 'james@demo.com', isVerified: true,  isActive: true  },
  { id: 'm2', name: 'Sofia Martinez',  phone: '+1 555-2002', email: null,             isVerified: false, isActive: true  },
  { id: 'm3', name: 'David Park',      phone: '+1 555-2003', email: 'david@demo.com', isVerified: true,  isActive: true  },
  { id: 'm4', name: 'Amira Hassan',    phone: '+1 555-2004', email: null,             isVerified: false, isActive: false },
  { id: 'm5', name: 'Liam Thompson',   phone: '+1 555-2005', email: 'liam@demo.com',  isVerified: true,  isActive: true  },
  { id: 'm6', name: 'Chen Wei',        phone: '+1 555-2006', email: null,             isVerified: false, isActive: true  },
  { id: 'm7', name: 'Omar Al-Rashid',  phone: '+1 555-2007', email: 'omar@demo.com',  isVerified: true,  isActive: true  },
  { id: 'm8', name: 'Priya Patel',     phone: '+1 555-2008', email: null,             isVerified: false, isActive: false },
];

const MOCK_HISTORY: { date: string; service: string; barber: string; wait: string; status: string }[] = [
  { date: '2025-04-03', service: 'Haircut',         barber: 'Mike',   wait: '12 min', status: 'SERVED' },
  { date: '2025-03-28', service: 'Beard Trim',      barber: 'James',  wait: '8 min',  status: 'SERVED' },
  { date: '2025-03-20', service: 'Haircut + Beard', barber: 'Carlos', wait: '15 min', status: 'SERVED' },
  { date: '2025-03-12', service: 'Haircut',         barber: 'Mike',   wait: '10 min', status: 'SERVED' },
];

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
  visitHistory: typeof MOCK_HISTORY = [];
  visitLoading = false;

  constructor(
    private readonly customersService: CustomersService,
    private readonly tenant:           TenantContextService,
    private readonly notify:           NotificationService,
  ) {}

  ngOnInit(): void {
    this.shopId = this.tenant.getShopId();
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;

    if (!this.shopId) {
      // No shop context yet — use mock data
      setTimeout(() => {
        this.customers = [...MOCK_CUSTOMERS];
        this.loading   = false;
      }, 400);
      return;
    }

    this.customersService.list(this.shopId).subscribe({
      next: (items) => {
        this.customers = items.length ? items : [...MOCK_CUSTOMERS];
        this.loading   = false;
      },
      error: () => {
        // Backend customers resolver not yet available (Phase-2).
        // Fall back to demo data so the page is functional for demo.
        this.customers = [...MOCK_CUSTOMERS];
        this.loading   = false;
      },
    });
  }

  get activeCustomers(): number { return this.customers.filter(c => c.isActive).length; }
  get phoneCustomers():  number { return this.customers.filter(c => c.phone && !c.email).length; }

  initials(c: Customer): string {
    const name = c.name || c.phone || c.email || '?';
    return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  }

  get visitInitials(): string {
    if (!this.selectedCustomer) return '?';
    return this.initials(this.selectedCustomer);
  }

  viewHistory(customer: Customer): void {
    this.selectedCustomer  = customer;
    this.visitDialogVisible = true;
    this.visitLoading       = true;
    this.visitHistory       = [];

    // Show demo history after brief loading state
    setTimeout(() => {
      this.visitHistory = [...MOCK_HISTORY];
      this.visitLoading  = false;
    }, 400);
  }
}
