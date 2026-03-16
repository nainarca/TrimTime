import {
  Resolver,
  Query,
  Mutation,
  Subscription,
  Args,
  ID,
} from '@nestjs/graphql';
import { UseGuards, Optional } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueEntryModel, QueueUpdateEvent } from './models/queue-entry.model';
import { QueueStatsModel } from '@trimtime/shared-types';
import { JoinQueueInput } from './dto/join-queue.input';
import { UpdateQueueStatusInput } from './dto/update-queue-status.input';
import { GqlJwtGuard } from '../auth/guards/gql-jwt.guard';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { pubSub, QUEUE_EVENTS } from './queue.pubsub';
import { User } from '@prisma/client';

@Resolver(() => QueueEntryModel)
export class QueueResolver {
  constructor(private readonly queueService: QueueService) {}

  // ── Queries ───────────────────────────────────────────────────────────────

  @Query(() => [QueueEntryModel], {
    description: 'Get active queue entries for a shop or barber',
  })
  activeQueue(
    @Args('shopId', { type: () => ID }) shopId: string,
    @Args('barberId', { type: () => ID, nullable: true }) barberId?: string,
  ): Promise<QueueEntryModel[]> {
    return this.queueService.getActiveQueue(shopId, barberId) as unknown as Promise<QueueEntryModel[]>;
  }

  @Query(() => QueueEntryModel, {
    description: 'Get a single queue entry by ID (for customer live tracker)',
  })
  queueEntry(
    @Args('entryId', { type: () => ID }) entryId: string,
  ): Promise<QueueEntryModel> {
    return this.queueService.getEntryById(entryId) as unknown as Promise<QueueEntryModel>;
  }

  @Query(() => QueueStatsModel, {
    description: 'Get queue statistics for a shop or barber',
  })
  queueStats(
    @Args('shopId', { type: () => ID }) shopId: string,
    @Args('barberId', { type: () => ID, nullable: true }) barberId?: string,
  ): Promise<QueueStatsModel> {
    return this.queueService.getQueueStats(shopId, barberId) as unknown as Promise<QueueStatsModel>;
  }

  // ── Mutations ─────────────────────────────────────────────────────────────

  @Mutation(() => QueueEntryModel, {
    description: 'Join a queue (authenticated or guest)',
  })
  joinQueue(
    @Args('input') input: JoinQueueInput,
    @Optional() @CurrentUser() user?: AuthenticatedUser,
  ): Promise<QueueEntryModel> {
    return this.queueService.joinQueue(input, user?.id, user?.shopIds) as unknown as Promise<QueueEntryModel>;
  }

  @UseGuards(GqlJwtGuard)
  @Mutation(() => QueueEntryModel, {
    description: 'Update queue entry status (barber/owner action)',
  })
  updateQueueStatus(
    @Args('input') input: UpdateQueueStatusInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<QueueEntryModel> {
    return this.queueService.updateStatus(input, user.id, user.shopIds) as unknown as Promise<QueueEntryModel>;
  }

  @UseGuards(GqlJwtGuard)
  @Mutation(() => QueueEntryModel, {
    description: 'Customer leaves their own queue entry',
  })
  leaveQueue(
    @Args('entryId', { type: () => ID }) entryId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<QueueEntryModel> {
    return this.queueService.leaveQueue(entryId, user.id, user.shopIds) as unknown as Promise<QueueEntryModel>;
  }

  // ── Subscriptions ─────────────────────────────────────────────────────────

  @Subscription(() => QueueUpdateEvent, {
    filter(payload, variables) {
      const event = payload.queueUpdated;
      if (event.shopId !== variables.shopId) return false;
      if (variables.barberId && event.barberId !== variables.barberId) return false;
      return true;
    },
    resolve: (payload) => payload.queueUpdated,
    description: 'Real-time queue updates for a shop or barber',
  })
  queueUpdated(
    @Args('shopId', { type: () => ID }) shopId: string,
    @Args('barberId', { type: () => ID, nullable: true }) _barberId?: string,
  ) {
    void shopId; // used in filter above
    return pubSub.asyncIterator(QUEUE_EVENTS.QUEUE_UPDATED);
  }
}
