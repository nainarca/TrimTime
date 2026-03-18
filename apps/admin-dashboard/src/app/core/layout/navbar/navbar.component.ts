import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'tt-navbar',
  standalone: true,
  imports: [NgIf, ButtonModule, BadgeModule, TooltipModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  notificationCount = 3;
  profileOpen = false;

  toggleProfile(): void {
    this.profileOpen = !this.profileOpen;
  }
}
