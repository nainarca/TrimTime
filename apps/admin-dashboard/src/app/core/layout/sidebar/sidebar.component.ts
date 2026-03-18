import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
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
export class SidebarComponent {
  // Live badge count — in production feed this from QueueSocketService
  queueBadge = 7;

  navGroups: NavGroup[] = [
    {
      label: 'Main',
      items: [
        { label: 'Dashboard',     icon: 'pi pi-home',      route: '/dashboard' },
        { label: 'Queue Monitor', icon: 'pi pi-list',      route: '/queue', badge: this.queueBadge },
      ],
    },
    {
      label: 'Manage',
      items: [
        { label: 'Barbers',   icon: 'pi pi-id-card',    route: '/staff'    },
        { label: 'Services',  icon: 'pi pi-briefcase',  route: '/services' },
        { label: 'Reports',   icon: 'pi pi-chart-bar',  route: '/reports'  },
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
