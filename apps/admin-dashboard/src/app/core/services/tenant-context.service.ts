import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TenantContextService {
  private readonly shopId$ = new BehaviorSubject<string | null>(null);
  private readonly branchId$ = new BehaviorSubject<string | null>(null);

  setTenant(shopId: string | null, branchId: string | null = null): void {
    this.shopId$.next(shopId);
    this.branchId$.next(branchId);
  }

  setShopId(shopId: string | null): void {
    this.shopId$.next(shopId);
  }

  setBranchId(branchId: string | null): void {
    this.branchId$.next(branchId);
  }

  getShopId(): string | null {
    return this.shopId$.value;
  }

  getBranchId(): string | null {
    return this.branchId$.value;
  }
}

