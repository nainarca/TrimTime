import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { TenantContextService } from './tenant-context.service';

export interface ShopProfile {
  id: string;
  name: string;
  slug: string;
}

const MY_SHOP_QUERY = gql`
  query MyShop {
    myShop {
      id
      name
      slug
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class ShopService {
  constructor(
    private readonly apollo: Apollo,
    private readonly tenant: TenantContextService,
  ) {}

  /**
   * Fetches the current user's shop and sets it in TenantContextService.
   * Uses Apollo cache-first so repeated calls don't hit the network.
   */
  getMyShop(): Observable<ShopProfile> {
    return this.apollo
      .query<{ myShop: ShopProfile }>({
        query: MY_SHOP_QUERY,
        fetchPolicy: 'cache-first',
      })
      .pipe(
        map((res) => res.data.myShop),
        tap((shop) => this.tenant.setShopId(shop.id)),
      );
  }
}
