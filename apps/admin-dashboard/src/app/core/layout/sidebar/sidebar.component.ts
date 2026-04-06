import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { QueueSocketService } from '../../services/queue-socket.service';
import { ShopService } from '../../services/shop.service';
import { TenantContextService } from '../../services/tenant-context.service';
import { AuthService } from '../../services/auth/auth.service';

interface NavItem {
  label: string;
  icon:  string;
  route: string;
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

@Component({
  selector: 'tt-sidebar',
  standalone: true,
  imports: [NgFor, NgIf, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  /** Live count of WAITING entries — updates from socket QUEUE_UPDATED */
  queueBadge = 0;
  shopName   = 'QueueCut';
  shopPlan   = 'Pro Plan';
  shopInitials = 'QC';

  navGroups: NavGroup[] = [];

  private subs: Subscription[] = [];

  constructor(
    private readonly queueSocket: QueueSocketService,
    private readonly shopService: ShopService,
    private readonly tenant:      TenantContextService,
    private readonly auth:        AuthService,
  ) {}

  ngOnInit(): void {
    this.buildNav();

    // Resolve shop name from cache-first Apollo query
    this.shopService.getMyShop().subscribe({
      next: (shop) => {
        this.shopName     = shop.name;
        this.shopInitials = shop.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
        // Connect socket with the resolved shop ID
        const shopId = this.tenant.getShopId() ?? this.auth.getShopId();
        if (shopId) {
          this.connectSocket(shopId);
        }
      },
      error: () => { /* keep defaults */ },
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  private connectSocket(shopId: string): void {
    this.queueSocket.connect(shopId);

    this.subs.push(
      this.queueSocket.queueUpdated$.subscribe((evt) => {
        const entries = evt.data as any[];
        this.queueBadge = Array.isArray(entries)
          ? entries.filter((e: any) => e.status === 'WAITING').length
          : 0;
        // Patch badge into Queue Monitor nav item
        this.buildNav();
      }),
    );
  }

  private buildNav(): void {
    this.navGroups = [
      {
        label: 'Main',
        items: [
          { label: 'Dashboard',     icon: 'pi pi-home',      route: '/dashboard' },
          { label: 'Queue Monitor', icon: 'pi pi-list',      route: '/queue',     badge: this.queueBadge || undefined },
          { label: 'Bookings',      icon: 'pi pi-calendar',  route: '/bookings' },
          { label: 'Customers',     icon: 'pi pi-user',      route: '/customers' },
        ],
      },
      {
        label: 'Manage',
        items: [
          { label: 'Barbers',   icon: 'pi pi-id-card',    route: '/barbers'  },
          { label: 'Staff',     icon: 'pi pi-users',      route: '/staff'    },
          { label: 'Services',  icon: 'pi pi-briefcase',  route: '/services' },
          { label: 'Reports',   icon: 'pi pi-chart-bar',  route: '/reports'  },
          { label: 'Finance',   icon: 'pi pi-wallet',     route: '/finance'  },
        ],
      },
      {
        label: 'System',
        items: [
          { label: 'Settings', icon: 'pi pi-cog', route: '/settings' },
        ],
      },
    ];
  }
}
