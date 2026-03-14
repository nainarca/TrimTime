import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { QueueEntry, QueueUpdateEvent } from '../../../../../../libs/shared/src';
import { ACTIVE_QUEUE_QUERY, QUEUE_UPDATED_SUBSCRIPTION } from '../graphql/queue.gql';

export type { QueueEntry, QueueUpdateEvent };

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

  queueUpdated$(shopId: string, barberId?: string | null): Observable<QueueUpdateEvent> {
    return this.apollo
      .subscribe<{ queueUpdated: QueueUpdateEvent }>({
        query: QUEUE_UPDATED_SUBSCRIPTION,
        variables: { shopId, barberId },
      })
      .pipe(map((res) => res.data!.queueUpdated));
  }
}
