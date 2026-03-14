import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TenantContextService } from './tenant-context.service';

export interface Service {
  id: string;
  shopId: string;
  name: string;
  description?: string | null;
  durationMins: number;
  price: number;
  currency: string;
  isActive: boolean;
}

const SERVICES_QUERY = gql`
  query Services($shopId: ID!) {
    services(shopId: $shopId) {
      id
      shopId
      name
      description
      durationMins
      price
      currency
      isActive
    }
  }
`;

const SERVICE_QUERY = gql`
  query Service($id: ID!) {
    service(id: $id) {
      id
      shopId
      name
      description
      durationMins
      price
      currency
      isActive
    }
  }
`;

const UPSERT_SERVICE_MUTATION = gql`
  mutation UpsertService($input: UpsertServiceInput!) {
    upsertService(input: $input) {
      id
    }
  }
`;

const ARCHIVE_SERVICE_MUTATION = gql`
  mutation ArchiveService($id: ID!) {
    archiveService(id: $id) {
      id
      isActive
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class ServicesService {
  constructor(
    private readonly apollo: Apollo,
    private readonly tenant: TenantContextService,
  ) {}

  list(shopId?: string | null): Observable<Service[]> {
    const resolvedShopId = shopId ?? this.tenant.getShopId();
    if (!resolvedShopId) {
      throw new Error('No shopId available in TenantContextService');
    }

    return this.apollo
      .watchQuery<{ services: Service[] }>({
        query: SERVICES_QUERY,
        variables: { shopId: resolvedShopId },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((res) => res.data.services));
  }

  get(id: string): Observable<Service> {
    return this.apollo
      .watchQuery<{ service: Service }>({
        query: SERVICE_QUERY,
        variables: { id },
      })
      .valueChanges.pipe(map((res) => res.data.service));
  }

  upsert(input: unknown) {
    return this.apollo.mutate({
      mutation: UPSERT_SERVICE_MUTATION,
      variables: { input },
    });
  }

  archive(id: string) {
    return this.apollo.mutate({
      mutation: ARCHIVE_SERVICE_MUTATION,
      variables: { id },
    });
  }
}

