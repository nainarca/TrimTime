import { Component } from '@angular/core';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'tt-sidebar',
  standalone: true,
  imports: [PanelMenuModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  items: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/dashboard'] },
    { label: 'Queue', icon: 'pi pi-list', routerLink: ['/queue'] },
    { label: 'Bookings', icon: 'pi pi-calendar', routerLink: ['/bookings'] },
    { label: 'Customers', icon: 'pi pi-users', routerLink: ['/customers'] },
    { label: 'Staff', icon: 'pi pi-id-card', routerLink: ['/staff'] },
    { label: 'Services', icon: 'pi pi-briefcase', routerLink: ['/services'] },
    { label: 'Finance', icon: 'pi pi-wallet', routerLink: ['/finance'] },
    { label: 'Reports', icon: 'pi pi-chart-bar', routerLink: ['/reports'] },
    { label: 'Settings', icon: 'pi pi-cog', routerLink: ['/settings'] },
  ];
}

