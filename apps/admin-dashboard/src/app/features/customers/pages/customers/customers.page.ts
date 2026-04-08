import { Component, OnInit } from '@angular/core';
import { CustomersService, Customer } from '../../../../core/services/customers.service';
import { TenantContextService } from '../../../../core/services/tenant-context.service';
import { NotificationService } from '../../../../core/services/notification.service';

// Demo seed — shown when the backend customers resolver is not yet available.
const MOCK_CUSTOMERS: Customer[] = [
  { id: 'm01', name: 'Suresh Babu',      phone: '+91 98765 01001', email: 'suresh@demo.in',  isVerified: true,  isActive: true  },
  { id: 'm02', name: 'Ramesh Kumar',     phone: '+91 98765 01002', email: 'ramesh@demo.in',  isVerified: true,  isActive: true  },
  { id: 'm03', name: 'Priya Devi',       phone: '+91 98765 01003', email: null,               isVerified: false, isActive: true  },
  { id: 'm04', name: 'Anand Raj',        phone: '+91 98765 01004', email: 'anand@demo.in',   isVerified: true,  isActive: true  },
  { id: 'm05', name: 'Kavitha Subramani',phone: '+91 98765 01005', email: null,               isVerified: false, isActive: true  },
  { id: 'm06', name: 'Ravi Shankar',     phone: '+91 98765 01006', email: 'ravi@demo.in',    isVerified: true,  isActive: true  },
  { id: 'm07', name: 'Deepa Menon',      phone: '+91 98765 01007', email: null,               isVerified: false, isActive: true  },
  { id: 'm08', name: 'Murugan Pillai',   phone: '+91 98765 01008', email: 'murugan@demo.in', isVerified: true,  isActive: true  },
  { id: 'm09', name: 'Lakshmi Narayanan',phone: '+91 98765 01009', email: 'lakshmi@demo.in', isVerified: true,  isActive: false },
  { id: 'm10', name: 'Selvam Rajendran', phone: '+91 98765 01010', email: null,               isVerified: false, isActive: true  },
  { id: 'm11', name: 'Nithya Krishnan',  phone: '+91 98765 01011', email: null,               isVerified: false, isActive: true  },
  { id: 'm12', name: 'Balaji Venkatesh', phone: '+91 98765 01012', email: 'balaji@demo.in',  isVerified: true,  isActive: true  },
];

const MOCK_HISTORY: { date: string; service: string; barber: string; wait: string; status: string }[] = [
  { date: '2025-04-06', service: 'Haircut',         barber: 'Arjun',   wait: '10 min', status: 'SERVED' },
  { date: '2025-03-30', service: 'Beard Trim',      barber: 'Karthik', wait: '8 min',  status: 'SERVED' },
  { date: '2025-03-22', service: 'Haircut + Beard', barber: 'Rahim',   wait: '14 min', status: 'SERVED' },
  { date: '2025-03-15', service: 'Hair Spa',        barber: 'Arjun',   wait: '5 min',  status: 'SERVED' },
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
