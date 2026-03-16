import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { QueueApiService } from './services/queue-api.service';

@Component({
  standalone: true,
  selector: 'tt-join-queue-page',
  imports: [CommonModule, FormsModule, IonicModule],
  template: `
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/shop"></ion-back-button></ion-buttons>
        <ion-title>Join Queue</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding custom-bg">
      <div *ngIf="!shopId || !branchId" class="error-panel">
        <p>Please start from the shop QR scan to join the queue.</p>
        <ion-button expand="full" shape="round" (click)="goToScan()">Scan Shop</ion-button>
      </div>
      <div *ngIf="shopId && branchId" class="join-panel">
        <div class="hero-row">
          <div>
            <div class="eyebrow">{{ shopName || 'Your Shop' }}</div>
            <h2>Branch: {{ branchName || 'Main Branch' }}</h2>
          </div>
          <ion-badge color="primary">Ready</ion-badge>
        </div>

        <ion-item>
          <ion-label position="stacked">Name</ion-label>
          <ion-input [(ngModel)]="guestName" placeholder="Enter your name"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Phone</ion-label>
          <ion-input [(ngModel)]="guestPhone" placeholder="+11234567890"></ion-input>
        </ion-item>

        <ion-button expand="full" shape="round" [disabled]="loading" (click)="join()">{{ loading ? 'Joining...' : 'Join Queue' }}</ion-button>
        <ion-text color="danger" *ngIf="error">{{ error }}</ion-text>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .error-card {
        margin-top: 1rem;
      }
    `,
  ],
})
export class JoinQueuePage implements OnInit {
  shopId: string | null = null;
  branchId: string | null = null;
  shopName = '';
  branchName = '';
  guestName = 'Guest';
  guestPhone = '+11234567890';
  loading = false;
  error = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly queueApi: QueueApiService,
  ) {}

  ngOnInit(): void {
    this.shopId = this.route.snapshot.queryParamMap.get('shopId');
    this.branchId = this.route.snapshot.queryParamMap.get('branchId');
    this.shopName = this.route.snapshot.queryParamMap.get('shopName') || '';
    this.branchName = this.route.snapshot.queryParamMap.get('branchName') || '';
  }

  join(): void {
    if (!this.shopId || !this.branchId) {
      this.error = 'Invalid shop or branch. Please scan again.';
      return;
    }
    this.loading = true;
    this.error = '';

    this.queueApi
      .joinQueue({
        shopId: this.shopId,
        branchId: this.branchId,
        entryType: 'WALK_IN',
        priority: 1,
        guestName: this.guestName || 'Guest',
        guestPhone: this.guestPhone,
      })
      .subscribe({
        next: (entry) => {
          this.loading = false;
          this.router.navigate(['/queue', entry.id]);
        },
        error: (err) => {
          this.loading = false;
          this.error = err.message || 'Could not join queue right now.';
        },
      });
  }

  goToScan(): void {
    this.router.navigate(['/scan']);
  }
}

