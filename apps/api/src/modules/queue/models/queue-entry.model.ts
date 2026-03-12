import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { QueueStatus, EntryType } from '@trimtime/shared-types';

registerEnumType(QueueStatus, { name: 'QueueStatus' });
registerEnumType(EntryType, { name: 'EntryType' });

@ObjectType()
export class QueueEntryModel {
  @Field(() => ID)
  id: string;

  @Field()
  shopId: string;

  @Field()
  branchId: string;

  @Field(() => String, { nullable: true })
  barberId: string | null;

  @Field(() => String, { nullable: true })
  customerId: string | null;

  @Field(() => Int)
  ticketNumber: number;

  @Field()
  ticketDisplay: string; // e.g. "A014"

  @Field(() => EntryType)
  entryType: EntryType;

  @Field(() => Int)
  priority: number;

  @Field(() => QueueStatus)
  status: QueueStatus;

  @Field(() => Int)
  position: number;

  @Field(() => Int, { nullable: true })
  estimatedWaitMins: number | null;

  @Field()
  joinedAt: Date;

  @Field(() => Date, { nullable: true })
  calledAt: Date | null;

  @Field(() => Date, { nullable: true })
  servingAt: Date | null;

  @Field(() => Date, { nullable: true })
  servedAt: Date | null;

  @Field(() => String, { nullable: true })
  guestName: string | null;

  @Field(() => String, { nullable: true })
  guestPhone: string | null;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class QueueStatsModel {
  @Field(() => Int)
  waitingCount: number;

  @Field(() => Int)
  servingCount: number;

  @Field(() => Int, { nullable: true })
  avgWaitMins: number | null;

  @Field(() => Int)
  servedTodayCount: number;
}

@ObjectType()
export class QueueUpdateEvent {
  @Field()
  shopId: string;

  @Field(() => String, { nullable: true })
  barberId: string | null;

  @Field()
  type: string; // 'ENTRY_JOINED' | 'STATUS_CHANGED' | 'POSITION_UPDATE' | 'EWT_UPDATE'

  @Field(() => QueueEntryModel, { nullable: true })
  entry: QueueEntryModel | null;

  @Field(() => [QueueEntryModel])
  activeEntries: QueueEntryModel[];
}
