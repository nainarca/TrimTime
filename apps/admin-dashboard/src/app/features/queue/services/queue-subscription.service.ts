import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { QUEUE_UPDATED_SUBSCRIPTION } from '../graphql/queue.gql';
import type { QueueEntry } from './queue-api.service';

export interface QueueUpdateEvent {
  shopId: string;
  barberId?: string | null;
  type: string;
  activeEntries: QueueEntry[];
}

@Injectable({ providedIn: 'root' })
export class QueueSubscriptionService {
  constructor(private readonly apollo: Apollo) {}

  subscribeQueue(shopId: string, barberId?: string | null): Observable<QueueUpdateEvent> {
    return this.apollo
      .subscribe<{ queueUpdated: QueueUpdateEvent }>({
        query: QUEUE_UPDATED_SUBSCRIPTION,
        variables: { shopId, barberId },
      })
      .pipe(map((res) => res.data!.queueUpdated));
  }
}

