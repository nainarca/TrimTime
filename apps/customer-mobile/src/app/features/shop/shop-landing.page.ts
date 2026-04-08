import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
  /** Stored from shopBySlug response — used when branches have no shopId */
  private resolvedShopId = '';

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

    forkJoin({
      shop:     this.queueApi.getShopBySlug(this.slug).pipe(catchError(() => of(null))),
      branches: this.queueApi.getShopBranchesBySlug(this.slug).pipe(catchError(() => of([] as ShopBranch[]))),
    }).subscribe({
      next: ({ shop, branches }) => {
        if (!shop) {
          this.error = 'Shop not found';
        } else {
          this.resolvedShopId = shop.id;
          this.shopName    = shop.name;
          this.description = shop.description || 'Join queue and get notified when it\'s your turn.';
          this.cityDisplay = shop.country;
        }
        this.branches = branches;
        if (branches.length > 0) this.selectedBranch = branches[0];
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Could not load shop';
        this.loading = false;
      },
    });
  }

  selectBranch(branch: ShopBranch): void {
    this.selectedBranch = branch;
  }

  get canJoin(): boolean {
    if (!this.resolvedShopId) return false;
    // If branches exist, one must be selected
    if (this.branches.length > 0) return !!this.selectedBranch?.id;
    // No branches — allow anyway (shop-level join)
    return true;
  }

  get noBranchesWarning(): boolean {
    return !this.loading && !this.error && this.branches.length === 0;
  }

  joinQueue(): void {
    const shopId   = this.selectedBranch?.shopId || this.resolvedShopId;
    const branchId = this.selectedBranch?.id;
    if (!shopId) return;
    if (!branchId) {
      // No branch — cannot form a valid request; surface a message
      this.router.navigate(['/join-queue'], {
        queryParams: { shopId, shopName: this.shopName, error: 'no-branch' },
      });
      return;
    }

    this.router.navigate(['/join-queue'], {
      queryParams: {
        shopId,
        branchId,
        shopName:   this.shopName,
        branchName: this.selectedBranch?.name || 'Main Branch',
      },
    });
  }

  bookAppointment(): void {
    const shopId   = this.selectedBranch?.shopId || this.resolvedShopId;
    if (!shopId) return;

    this.router.navigate(['/book-appointment'], {
      queryParams: {
        shopId,
        branchId:   this.selectedBranch?.id || '',
        shopName:   this.shopName,
        branchName: this.selectedBranch?.name || 'Main Branch',
        slug:       this.slug,
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/tabs/scan']);
  }
}
