import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TenantContextService } from './tenant-context.service';

export interface Customer {
  id: string;
  phone?: string | null;
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  isVerified: boolean;
  isActive: boolean;
}

const CUSTOMERS_QUERY = gql`
  query Customers($shopId: ID!, $search: String, $skip: Int, $take: Int) {
    customers(shopId: $shopId, search: $search, skip: $skip, take: $take) {
      id
      phone
      email
      name
      avatarUrl
      isVerified
      isActive
    }
  }
`;

const CUSTOMER_QUERY = gql`
  query Customer($id: ID!) {
    customer(id: $id) {
      id
      phone
      email
      name
      avatarUrl
      isVerified
      isActive
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class CustomersService {
  constructor(
    private readonly apollo: Apollo,
    private readonly tenant: TenantContextService,
  ) {}

  list(
    shopId?: string | null,
    search?: string,
    skip = 0,
    take = 20,
  ): Observable<Customer[]> {
    const resolvedShopId = shopId ?? this.tenant.getShopId();
    if (!resolvedShopId) {
      throw new Error('No shopId available in TenantContextService');
    }

    return this.apollo
      .watchQuery<{ customers: Customer[] }>({
        query: CUSTOMERS_QUERY,
        variables: { shopId: resolvedShopId, search, skip, take },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((res) => res.data.customers));
  }

  get(id: string): Observable<Customer> {
    return this.apollo
      .watchQuery<{ customer: Customer }>({
        query: CUSTOMER_QUERY,
        variables: { id },
      })
      .valueChanges.pipe(map((res) => res.data.customer));
  }
}

