import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  standalone: true,
  selector: 'tt-scanner-page',
  imports: [CommonModule, FormsModule, IonicModule],
  template: `
    <ion-header translucent>
      <ion-toolbar>
        <ion-title>Join Queue</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding custom-bg">
      <div class="hero">
        <h1>Ready to join?</h1>
        <p>Scan the shop QR code or enter the shop slug to continue.</p>
      </div>
      <ion-card>
        <ion-card-content>
          <ion-item>
            <ion-label position="floating">Shop Slug</ion-label>
            <ion-input [(ngModel)]="shopSlug" placeholder="e.g. downtown-barbers"></ion-input>
          </ion-item>
          <ion-button expand="full" shape="round" (click)="goToShop()" [disabled]="!shopSlug">Continue</ion-button>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
})
export class ScannerPage {
  shopSlug = '';

  constructor(private readonly router: Router) {}

  goToShop(): void {
    if (!this.shopSlug) return;
    this.router.navigate(['/shop', this.shopSlug.trim()]);
  }
}
