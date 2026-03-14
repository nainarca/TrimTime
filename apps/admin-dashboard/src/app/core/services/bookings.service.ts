import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TenantContextService } from './tenant-context.service';

export interface Booking {
  id: string;
  shopId: string;
  branchId: string;
  barberId: string;
  customerId: string;
  serviceId: string;
  scheduledAt: string;
  durationMins: number;
  status: string;
  notes?: string | null;
}

export interface BookingUpdateEvent {
  id: string;
  shopId: string;
  status: string;
}

const BOOKINGS_QUERY = gql`
  query Appointments($shopId: ID!, $from: DateTime, $to: DateTime) {
    appointments(shopId: $shopId, from: $from, to: $to) {
      id
      shopId
      branchId
      barberId
      customerId
      serviceId
      scheduledAt
      durationMins
      status
      notes
    }
  }
`;

const BOOKING_QUERY = gql`
  query Appointment($id: ID!) {
    appointment(id: $id) {
      id
      shopId
      branchId
      barberId
      customerId
      serviceId
      scheduledAt
      durationMins
      status
      notes
    }
  }
`;

const CREATE_BOOKING_MUTATION = gql`
  mutation CreateAppointment($input: CreateAppointmentInput!) {
    createAppointment(input: $input) {
      id
    }
  }
`;

const UPDATE_BOOKING_MUTATION = gql`
  mutation UpdateAppointment($id: ID!, $input: UpdateAppointmentInput!) {
    updateAppointment(id: $id, input: $input) {
      id
    }
  }
`;

const CANCEL_BOOKING_MUTATION = gql`
  mutation CancelAppointment($id: ID!) {
    cancelAppointment(id: $id) {
      id
      status
    }
  }
`;

const BOOKING_UPDATED_SUBSCRIPTION = gql`
  subscription BookingUpdated($shopId: ID!) {
    bookingUpdated(shopId: $shopId) {
      id
      shopId
      status
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class BookingsService {
  constructor(
    private readonly apollo: Apollo,
    private readonly tenant: TenantContextService,
  ) {}

  list(shopId?: string | null, from?: string, to?: string): Observable<Booking[]> {
    const resolvedShopId = shopId ?? this.tenant.getShopId();
    if (!resolvedShopId) {
      throw new Error('No shopId available in TenantContextService');
    }

    return this.apollo
      .watchQuery<{ appointments: Booking[] }>({
        query: BOOKINGS_QUERY,
        variables: { shopId: resolvedShopId, from, to },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((res) => res.data.appointments));
  }

  get(id: string): Observable<Booking> {
    return this.apollo
      .watchQuery<{ appointment: Booking }>({
        query: BOOKING_QUERY,
        variables: { id },
      })
      .valueChanges.pipe(map((res) => res.data.appointment));
  }

  create(input: unknown) {
    return this.apollo.mutate({
      mutation: CREATE_BOOKING_MUTATION,
      variables: { input },
    });
  }

  update(id: string, input: unknown) {
    return this.apollo.mutate({
      mutation: UPDATE_BOOKING_MUTATION,
      variables: { id, input },
    });
  }

  cancel(id: string) {
    return this.apollo.mutate({
      mutation: CANCEL_BOOKING_MUTATION,
      variables: { id },
    });
  }

  bookingUpdated$(shopId?: string | null): Observable<BookingUpdateEvent> {
    const resolvedShopId = shopId ?? this.tenant.getShopId();
    if (!resolvedShopId) {
      throw new Error('No shopId available in TenantContextService');
    }

    return this.apollo
      .subscribe<{ bookingUpdated: BookingUpdateEvent }>({
        query: BOOKING_UPDATED_SUBSCRIPTION,
        variables: { shopId: resolvedShopId },
      })
      .pipe(map((res) => res.data!.bookingUpdated));
  }
}

