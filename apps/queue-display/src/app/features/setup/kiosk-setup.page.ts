import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-kiosk-setup',
  imports: [CommonModule],
  template: `
    <main style="padding: 1rem;">
      <h1>Kiosk Setup</h1>
      <p>Enter your shop ID to start queue display.</p>
      <label style="display:block; margin-top:0.5rem;">
        Shop ID
        <input #shopId style="margin-left:0.5rem;" />
      </label>
      <button style="margin-top:1rem;" (click)="go(shopId.value)">Open Queue Display</button>
    </main>
  `,
})
export class KioskSetupPage {
  constructor(private readonly router: Router) {}

  go(shopId: string) {
    if (!shopId?.trim()) {
      return;
    }
    this.router.navigate(['/display', shopId.trim()]);
  }
}
