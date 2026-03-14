import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ACTIVE_QUEUE_QUERY,
  QUEUE_STATS_QUERY,
  UPDATE_QUEUE_STATUS_MUTATION,
} from '../graphql/queue.gql';

export interface QueueEntry {
  id: string;
  ticketDisplay: string;
  status: string;
  position: number;
  estimatedWaitMins: number | null;
  entryType: string;
  joinedAt: string;
  barberId?: string | null;
  customerId?: string | null;
  guestName?: string | null;
  guestPhone?: string | null;
}

@Injectable({ providedIn: 'root' })
export class QueueApiService {
  constructor(private readonly apollo: Apollo) {}

  getActiveQueue(shopId: string, barberId?: string | null): Observable<QueueEntry[]> {
    return this.apollo
      .watchQuery<{ activeQueue: QueueEntry[] }>({
        query: ACTIVE_QUEUE_QUERY,
        variables: { shopId, barberId },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((res) => res.data.activeQueue));
  }

  getQueueStats(shopId: string, barberId?: string | null) {
    return this.apollo
      .watchQuery<{ queueStats: unknown }>({
        query: QUEUE_STATS_QUERY,
        variables: { shopId, barberId },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((res) => res.data.queueStats));
  }

  updateQueueStatus(entryId: string, newStatus: string) {
    return this.apollo.mutate({
      mutation: UPDATE_QUEUE_STATUS_MUTATION,
      variables: { entryId, newStatus },
    });
  }
}

