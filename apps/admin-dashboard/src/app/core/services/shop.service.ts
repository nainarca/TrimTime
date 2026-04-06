import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { TenantContextService } from './tenant-context.service';

export interface ShopProfile {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
}

export interface UpdateShopInput {
  name?: string;
  description?: string;
  logoUrl?: string;
  coverUrl?: string;
}

const MY_SHOP_QUERY = gql`
  query MyShop {
    myShop {
      id
      name
      slug
      description
      logoUrl
      coverUrl
    }
  }
`;

const UPDATE_SHOP_MUTATION = gql`
  mutation UpdateShop($shopId: ID!, $input: UpdateShopInput!) {
    updateShop(shopId: $shopId, input: $input) {
      id
      name
      slug
      description
      logoUrl
      coverUrl
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

  /**
   * Reloads shop bypassing Apollo cache (e.g. after a settings save).
   */
  reloadMyShop(): Observable<ShopProfile> {
    return this.apollo
      .query<{ myShop: ShopProfile }>({
        query: MY_SHOP_QUERY,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((res) => res.data.myShop),
        tap((shop) => this.tenant.setShopId(shop.id)),
      );
  }

  /**
   * Updates shop name / description / logo.
   * Only these fields are accepted by UpdateShopInput on the backend.
   */
  updateShop(shopId: string, input: UpdateShopInput): Observable<ShopProfile> {
    return this.apollo
      .mutate<{ updateShop: ShopProfile }>({
        mutation: UPDATE_SHOP_MUTATION,
        variables: { shopId, input },
      })
      .pipe(map((res) => res.data!.updateShop));
  }
}
