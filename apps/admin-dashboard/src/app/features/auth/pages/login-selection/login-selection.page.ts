import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tt-login-selection-page',
  template: `
    <div class="login-selection">
      <div class="hero">
        <h1>Welcome to QueueCut</h1>
        <p>Select your login type</p>
      </div>
      <div class="options">
        <button class="option-btn" (click)="selectRole('CUSTOMER')">Customer Login</button>
        <button class="option-btn" (click)="selectRole('OWNER')">Barber Owner Login</button>
        <button class="option-btn" (click)="selectRole('STAFF')">Staff Login</button>
        <button class="option-btn" (click)="selectRole('ADMIN')">Admin Login</button>
      </div>
    </div>
  `,
  styles: [`
    .login-selection { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f5f7fb; }
    .hero { text-align: center; margin-bottom: 2rem; }
    .options { display: flex; flex-direction: column; gap: 1rem; }
    .option-btn { padding: 1rem 2rem; background: #5B6CFF; color: white; border: none; border-radius: 12px; font-size: 1.1rem; cursor: pointer; }
    .option-btn:hover { background: #4F46E5; }
  `],
})
export class LoginSelectionPageComponent {
  constructor(private router: Router) {}

  selectRole(role: string) {
    if (role === 'CUSTOMER') {
      this.router.navigate(['/auth/customer-login']);
    } else {
      this.router.navigate(['/auth/login'], { queryParams: { role } });
    }
  }
}