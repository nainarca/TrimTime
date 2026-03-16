import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  standalone: true,
  selector: 'tt-profile-page',
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header translucent>
      <ion-toolbar>
        <ion-title>Profile</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding custom-bg">
      <div class="profile-card">
        <div class="name">Guest Customer</div>
        <div class="meta">Joined using QueueCut app</div>
      </div>
      <ion-list>
        <ion-item button routerLink="/history">
          <ion-label>
            <h3>Service History</h3>
            <p>View your past appointments and status</p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  styles: [
    `
      .custom-bg { background: #f5f7fb; }
      .profile-card { background: #fff; padding: 1rem; border-radius: 14px; margin-bottom: 1rem; box-shadow: 0 8px 20px rgba(0,0,0,0.08); }
      .name { font-size: 1.3rem; font-weight: 700; }
      .meta { color: #64748b; margin-top: 0.2rem; }
    `,
  ],})
export class ProfilePage {}
