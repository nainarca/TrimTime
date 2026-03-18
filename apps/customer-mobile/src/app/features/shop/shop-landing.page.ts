import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { QueueApiService, ShopBranch } from '../queue/services/queue-api.service';

export interface ServiceCard {
  name: string;
  duration: string;
  price: string;
  icon: string;
}

@Component({
  standalone: true,
  selector: 'tt-shop-landing-page',
  imports: [CommonModule, IonicModule],
  templateUrl: './shop-landing.page.html',
  styleUrls: ['./shop-landing.page.scss'],
})
export class ShopLandingPage implements OnInit {
  shopName = '';
  description = '';
  cityDisplay = '';
  loading = true;
  error = '';
  branches: ShopBranch[] = [];
  selectedBranch?: ShopBranch;
  slug = '';

  // Placeholder services (wire to API in Phase 2)
  services: ServiceCard[] = [
    { name: 'Haircut',          duration: '30 min', price: '$25', icon: 'cut-outline'          },
    { name: 'Beard Trim',       duration: '20 min', price: '$15', icon: 'color-filter-outline' },
    { name: 'Haircut + Beard',  duration: '45 min', price: '$35', icon: 'sparkles-outline'     },
    { name: 'Hair Wash',        duration: '15 min', price: '$10', icon: 'water-outline'        },
  ];

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
        this.shopName    = shop.name;
        this.description = shop.description || 'Join queue and get notified when it\'s your turn.';
        this.cityDisplay = shop.country;
      },
      error: (err) => {
        this.error = err.message || 'Could not load shop';
      },
    });

    this.queueApi.getShopBranchesBySlug(this.slug).subscribe({
      next: (branches) => {
        this.branches = branches;
        if (branches.length > 0) this.selectedBranch = branches[0];
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Could not load branches.';
        this.loading = false;
      },
    });
  }

  selectBranch(branch: ShopBranch): void {
    this.selectedBranch = branch;
  }

  joinQueue(): void {
    if (!this.selectedBranch) return;
    this.router.navigate(['/join-queue'], {
      queryParams: {
        shopId:     this.selectedBranch.shopId || '',
        branchId:   this.selectedBranch.id,
        shopName:   this.shopName,
        branchName: this.selectedBranch.name,
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/tabs/scan']);
  }
}
