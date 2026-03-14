import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ACTIVE_QUEUE_QUERY,
  QUEUE_STATS_QUERY,
  UPDATE_QUEUE_STATUS_MUTATION,
  QUEUE_UPDATED_SUBSCRIPTION,
} from '../../features/queue/graphql/queue.gql';

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

export interface QueueStats {
  waitingCount: number;
  servingCount: number;
  avgWaitMins: number | null;
  servedTodayCount: number;
}

export interface QueueUpdateEvent {
  shopId: string;
  barberId?: string | null;
  type: string;
  activeEntries: QueueEntry[];
}

@Injectable({ providedIn: 'root' })
export class QueueService {
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

  getQueueStats(shopId: string, barberId?: string | null): Observable<QueueStats> {
    return this.apollo
      .watchQuery<{ queueStats: QueueStats }>({
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

  queueUpdated$(shopId: string, barberId?: string | null): Observable<QueueUpdateEvent> {
    return this.apollo
      .subscribe<{ queueUpdated: QueueUpdateEvent }>({
        query: QUEUE_UPDATED_SUBSCRIPTION,
        variables: { shopId, barberId },
      })
      .pipe(map((res) => res.data!.queueUpdated));
  }
}

