import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { QueueApiService, ShopBranch } from '../queue/services/queue-api.service';

@Component({
  standalone: true,
  selector: 'tt-shop-landing-page',
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/scan"></ion-back-button></ion-buttons>
        <ion-title>{{ shopName || 'Shop' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding custom-bg">
      <div class="banner">
        <div>
          <div class="badge">Barber Queue</div>
          <h1>{{ shopName || 'Your shop' }}</h1>
          <p class="desc">{{ description || 'Join queue and get notified when it’s your turn.' }}</p>
        </div>
        <div class="meta">{{ cityDisplay }}</div>
      </div>

      <ion-list lines="none">
        <ion-list-header>
          <ion-label>Branches</ion-label>
        </ion-list-header>
        <ion-item *ngFor="let branch of branches" button (click)="joinQueue(branch)">
          <ion-label>
            <h3>{{ branch.name }}</h3>
            <p class="muted">{{ branch.address || 'No address available' }}</p>
          </ion-label>
          <ion-note slot="end">Join</ion-note>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
})
export class ShopLandingPage implements OnInit {
  shopName = '';
  description = '';
  cityDisplay = '';
  loading = true;
  error = '';
  branches: ShopBranch[] = [];
  slug = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly queueApi: QueueApiService,
  ) {}

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug') || '';
    if (!this.slug) {
      this.error = 'Invalid shop link';
      this.loading = false;
      return;
    }

    this.queueApi.getShopBySlug(this.slug).subscribe({
      next: (shop) => {
        if (!shop) {
          this.error = 'Shop not found';
          this.loading = false;
          return;
        }
        this.shopName = shop.name;
        this.description = shop.description || 'View queue and join now.';
        this.cityDisplay = `${shop.country}`;
      },
      error: (err) => {
        this.error = err.message || 'Could not load shop';
      },
    });

    this.queueApi.getShopBranchesBySlug(this.slug).subscribe({
      next: (branches) => {
        this.branches = branches;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Could not load branches.';
        this.loading = false;
      },
    });
  }

  joinQueue(branch: ShopBranch): void {
    this.router.navigate(['/join-queue'], {
      queryParams: {
        shopId: branch.shopId || '',
        branchId: branch.id,
        shopName: this.shopName,
        branchName: branch.name,
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/scan']);
  }
}

