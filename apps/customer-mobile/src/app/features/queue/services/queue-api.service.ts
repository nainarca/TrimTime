import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  SHOP_BY_SLUG_QUERY,
  SHOP_BRANCHES_BY_SLUG_QUERY,
  PUBLIC_SERVICES_QUERY,
  PUBLIC_BARBERS_QUERY,
  JOIN_QUEUE_MUTATION,
  BOOK_APPOINTMENT_AS_GUEST_MUTATION,
  QUEUE_ENTRY_QUERY,
  QUEUE_UPDATED_SUBSCRIPTION,
} from '../graphql/queue.gql';

export interface Shop {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  country: string;
  timezone: string;
  currency: string;
  isActive: boolean;
  isVerified: boolean;
}

export interface ShopBranch {
  id: string;
  shopId: string;
  name: string;
  address?: string | null;
  city?: string | null;
  isMain: boolean;
  isActive: boolean;
}

export interface QueueEntry {
  id: string;
  shopId: string;
  branchId: string;
  ticketDisplay: string;
  status: string;
  position: number;
  estimatedWaitMins?: number | null;
  joinedAt: string;
  guestName?: string | null;
  guestPhone?: string | null;
}

export interface PublicService {
  id: string;
  shopId: string;
  name: string;
  description: string | null;
  durationMins: number;
  price: number;
  currency: string;
  isActive: boolean;
}

export interface PublicBarber {
  id: string;
  shopId: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  branchId: string | null;
  queueAccepting: boolean;
  isActive: boolean;
}

export interface Appointment {
  id: string;
  shopId: string;
  branchId: string;
  barberId: string;
  serviceId: string;
  scheduledAt: string;
  durationMins: number;
  status: string;
  notes?: string | null;
}

export interface QueueUpdateEvent {
  type: string;
  entry: QueueEntry | null;
  activeEntries: QueueEntry[];
}

@Injectable({ providedIn: 'root' })
export class QueueApiService {
  constructor(private readonly apollo: Apollo) {}

  // apollo.query() completes after one emission — required for forkJoin to work.
  // watchQuery().valueChanges never completes, causing forkJoin to hang forever.

  getShopBySlug(slug: string): Observable<Shop | null> {
    return this.apollo
      .query<{ shopBySlug: Shop | null }>({
        query: SHOP_BY_SLUG_QUERY,
        variables: { slug },
        fetchPolicy: 'network-only',
      })
      .pipe(map((result) => result.data.shopBySlug));
  }

  getShopBranchesBySlug(slug: string): Observable<ShopBranch[]> {
    return this.apollo
      .query<{ shopBranchesBySlug: ShopBranch[] }>({
        query: SHOP_BRANCHES_BY_SLUG_QUERY,
        variables: { slug },
        fetchPolicy: 'network-only',
      })
      .pipe(map((result) => result.data.shopBranchesBySlug));
  }

  getPublicServices(shopId: string): Observable<PublicService[]> {
    return this.apollo
      .query<{ publicServices: PublicService[] }>({
        query: PUBLIC_SERVICES_QUERY,
        variables: { shopId },
        fetchPolicy: 'network-only',
      })
      .pipe(map((result) => result.data.publicServices));
  }

  getPublicBarbers(shopId: string): Observable<PublicBarber[]> {
    return this.apollo
      .query<{ publicBarbers: PublicBarber[] }>({
        query: PUBLIC_BARBERS_QUERY,
        variables: { shopId },
        fetchPolicy: 'network-only',
      })
      .pipe(map((result) => result.data.publicBarbers));
  }

  joinQueue(input: {
    shopId: string;
    branchId: string;
    entryType: 'WALK_IN' | 'ONLINE' | 'APPOINTMENT';
    priority: number;
    guestName?: string;
    guestPhone?: string;
    barberId?: string;
    notes?: string;
  }): Observable<QueueEntry> {
    return this.apollo
      .mutate<{ joinQueue: QueueEntry }>({
        mutation: JOIN_QUEUE_MUTATION,
        variables: {
          input,
        },
      })
      .pipe(map((result) => result.data?.joinQueue as QueueEntry));
  }

  bookAppointmentAsGuest(input: {
    shopId: string;
    branchId: string;
    barberId: string;
    serviceId: string;
    scheduledAt: string;
    guestName: string;
    guestPhone: string;
    notes?: string;
  }): Observable<Appointment> {
    return this.apollo
      .mutate<{ bookAppointmentAsGuest: Appointment }>({
        mutation: BOOK_APPOINTMENT_AS_GUEST_MUTATION,
        variables: { input },
      })
      .pipe(map((result) => result.data?.bookAppointmentAsGuest as Appointment));
  }

  getQueueEntry(entryId: string): Observable<QueueEntry> {
    return this.apollo
      .query<{ queueEntry: QueueEntry }>({
        query: QUEUE_ENTRY_QUERY,
        variables: { entryId },
        fetchPolicy: 'network-only',
      })
      .pipe(map((result) => result.data.queueEntry));
  }

  queueUpdated$(shopId: string, barberId?: string | null): Observable<QueueUpdateEvent> {
    return this.apollo
      .subscribe<{ queueUpdated: QueueUpdateEvent }>({
        query: QUEUE_UPDATED_SUBSCRIPTION,
        variables: { shopId, barberId },
      })
      .pipe(map((result) => result.data!.queueUpdated));
  }
}
