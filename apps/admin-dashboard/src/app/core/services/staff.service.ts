import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TenantContextService } from './tenant-context.service';

export interface StaffMember {
  id: string;
  userId: string;
  shopId: string;
  branchId?: string | null;
  displayName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  currentStatus: string;
  queueAccepting: boolean;
  maxQueueSize: number;
  isActive: boolean;
}

const STAFF_QUERY = gql`
  query Barbers($shopId: ID!) {
    barbers(shopId: $shopId) {
      id
      userId
      shopId
      branchId
      displayName
      bio
      avatarUrl
      currentStatus
      queueAccepting
      maxQueueSize
      isActive
    }
  }
`;

const STAFF_MEMBER_QUERY = gql`
  query Barber($id: ID!) {
    barber(id: $id) {
      id
      userId
      shopId
      branchId
      displayName
      bio
      avatarUrl
      currentStatus
      queueAccepting
      maxQueueSize
      isActive
    }
  }
`;

const UPSERT_STAFF_MUTATION = gql`
  mutation UpsertBarber($input: UpsertBarberInput!) {
    upsertBarber(input: $input) {
      id
    }
  }
`;

const DEACTIVATE_STAFF_MUTATION = gql`
  mutation DeactivateBarber($id: ID!) {
    deactivateBarber(id: $id) {
      id
      isActive
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class StaffService {
  constructor(
    private readonly apollo: Apollo,
    private readonly tenant: TenantContextService,
  ) {}

  list(shopId?: string | null): Observable<StaffMember[]> {
    const resolvedShopId = shopId ?? this.tenant.getShopId();
    if (!resolvedShopId) {
      throw new Error('No shopId available in TenantContextService');
    }

    return this.apollo
      .watchQuery<{ barbers: StaffMember[] }>({
        query: STAFF_QUERY,
        variables: { shopId: resolvedShopId },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((res) => res.data.barbers));
  }

  get(id: string): Observable<StaffMember> {
    return this.apollo
      .watchQuery<{ barber: StaffMember }>({
        query: STAFF_MEMBER_QUERY,
        variables: { id },
      })
      .valueChanges.pipe(map((res) => res.data.barber));
  }

  upsert(input: unknown) {
    return this.apollo.mutate({
      mutation: UPSERT_STAFF_MUTATION,
      variables: { input },
    });
  }

  deactivate(id: string) {
    return this.apollo.mutate({
      mutation: DEACTIVATE_STAFF_MUTATION,
      variables: { id },
    });
  }
}

