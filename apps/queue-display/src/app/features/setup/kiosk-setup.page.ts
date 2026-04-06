import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-kiosk-setup',
  imports: [CommonModule, FormsModule],
  templateUrl: './kiosk-setup.page.html',
  styleUrls: ['./kiosk-setup.page.scss'],
})
export class KioskSetupPage {
  shopId     = '';
  branchId   = '';
  shopName   = '';
  branchName = '';
  error      = '';

  constructor(private readonly router: Router) {}

  activate(): void {
    const id = this.shopId.trim();
    if (!id) {
      this.error = 'Shop ID is required.';
      return;
    }
    this.error = '';
    const path = this.branchId.trim()
      ? ['/display', id, this.branchId.trim()]
      : ['/display', id];

    const queryParams: Record<string, string> = {};
    if (this.shopName.trim())   queryParams['shopName']   = this.shopName.trim();
    if (this.branchName.trim()) queryParams['branchName'] = this.branchName.trim();

    this.router.navigate(path, { queryParams });
  }
}
