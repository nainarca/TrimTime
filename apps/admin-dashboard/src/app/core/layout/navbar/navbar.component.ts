import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../services/auth/auth.service';
import { ShopService } from '../../services/shop.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'tt-navbar',
  standalone: true,
  imports: [NgIf, ButtonModule, BadgeModule, TooltipModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  notificationCount = 0;
  profileOpen = false;

  /** Populated from JWT payload on init */
  userName  = 'Shop Owner';
  userRole  = 'Owner';
  userEmail = '';
  userInitials = 'SO';

  shopName = 'My Shop';

  constructor(
    private readonly auth:   AuthService,
    private readonly shop:   ShopService,
    private readonly notify: NotificationService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.resolveUserFromToken();
    this.resolveShopName();
  }

  private resolveUserFromToken(): void {
    // AuthService decodes the JWT to expose roles; derive display info from it.
    const roles = this.auth.getUserRoles();
    if (roles.includes('SHOP_OWNER') || roles.includes('OWNER')) {
      this.userRole = 'Shop Owner';
    } else if (roles.includes('ADMIN')) {
      this.userRole = 'Admin';
    } else if (roles.includes('BARBER')) {
      this.userRole = 'Barber';
    } else if (roles.includes('STAFF')) {
      this.userRole = 'Staff';
    }
    // Initials from first two words of name (placeholder until /me query lands)
    this.userInitials = this.userRole.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  private resolveShopName(): void {
    this.shop.getMyShop().subscribe({
      next: (s) => {
        this.shopName    = s.name;
        this.userName    = s.name + ' Owner';
        this.userInitials = s.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
      },
      error: () => { /* keep defaults */ },
    });
  }

  toggleProfile(): void {
    this.profileOpen = !this.profileOpen;
  }

  logout(): void {
    this.profileOpen = false;
    this.notify.info('Signed out', 'You have been logged out.');
    this.auth.logout();
  }

  goToSettings(): void {
    this.profileOpen = false;
    void this.router.navigate(['/settings']);
  }
}
