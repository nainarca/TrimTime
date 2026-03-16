import { QueueService } from './queue.service';
import { QueueEntryModel } from './models/queue-entry.model';
import { QueueStatsModel } from '@trimtime/shared-types';
import { JoinQueueInput } from './dto/join-queue.input';
import { UpdateQueueStatusInput } from './dto/update-queue-status.input';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
export declare class QueueResolver {
    private readonly queueService;
    constructor(queueService: QueueService);
    activeQueue(shopId: string, barberId?: string): Promise<QueueEntryModel[]>;
    queueEntry(entryId: string): Promise<QueueEntryModel>;
    queueStats(shopId: string, barberId?: string): Promise<QueueStatsModel>;
    joinQueue(input: JoinQueueInput, user?: AuthenticatedUser): Promise<QueueEntryModel>;
    updateQueueStatus(input: UpdateQueueStatusInput, user: AuthenticatedUser): Promise<QueueEntryModel>;
    leaveQueue(entryId: string, user: AuthenticatedUser): Promise<QueueEntryModel>;
    queueUpdated(shopId: string, _barberId?: string): AsyncIterator<unknown, any, undefined>;
}
