import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { JoinQueueInput } from './dto/join-queue.input';
import { UpdateQueueStatusInput } from './dto/update-queue-status.input';
import { pubSub, QUEUE_EVENTS } from './queue.pubsub';
import {
  sortQueueEntries,
  assignPositions,
  isValidTransition,
  isTerminalStatus,
} from '@trimtime/queue-engine';
import { formatTicket } from '@trimtime/queue-engine';
import { calculateEwt } from '@trimtime/queue-engine';
import { QueueStatus } from '@trimtime/shared-types';

const DEFAULT_AVG_DURATION = 20; // minutes fallback

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  // ── Join queue ─────────────────────────────────────────────────────────────

  async joinQueue(input: JoinQueueInput, customerId?: string) {
    // Validate shop & branch
    const branch = await this.prisma.shopBranch.findFirst({
      where: { id: input.branchId, shopId: input.shopId, isActive: true },
    });
    if (!branch) throw new NotFoundException('Branch not found');

    // Validate barber if specified
    if (input.barberId) {
      const barber = await this.prisma.barber.findFirst({
        where: { id: input.barberId, shopId: input.shopId, isActive: true },
      });
      if (!barber) throw new NotFoundException('Barber not found');
      if (!barber.queueAccepting) {
        throw new BadRequestException('This barber is not accepting queue entries right now');
      }
    }

    // Generate ticket number
    const today = new Date().toISOString().slice(0, 10);
    const counterKey = this.redis.ticketCounterKey(input.shopId, today);
    const ticketNumber = await this.redis.incr(counterKey);

    // Set TTL for ticket counter (2 days auto-expire)
    if (ticketNumber === 1) {
      await this.redis.expire(counterKey, 60 * 60 * 48);
    }

    const ticketDisplay = formatTicket(ticketNumber);

    // Create queue entry
    const entry = await this.prisma.queueEntry.create({
      data: {
        shopId: input.shopId,
        branchId: input.branchId,
        barberId: input.barberId,
        customerId,
        ticketNumber,
        ticketDisplay,
        entryType: input.entryType,
        priority: input.priority,
        status: 'WAITING',
        position: 0,         // will be recalculated
        guestName: input.guestName,
        guestPhone: input.guestPhone,
        appointmentId: input.appointmentId,
      },
    });

    // Recalculate positions and EWT for the queue
    await this.recalculateQueue(input.shopId, input.barberId);

    return entry;
  }

  // ── Get active queue ───────────────────────────────────────────────────────

  async getActiveQueue(shopId: string, barberId?: string) {
    const entries = await this.prisma.queueEntry.findMany({
      where: {
        shopId,
        ...(barberId && { barberId }),
        status: { in: ['WAITING', 'CALLED', 'SERVING'] },
      },
      orderBy: [{ priority: 'desc' }, { joinedAt: 'asc' }],
    });
    return entries;
  }

  async getEntryById(entryId: string) {
    const entry = await this.prisma.queueEntry.findUnique({ where: { id: entryId } });
    if (!entry) throw new NotFoundException(`Queue entry ${entryId} not found`);
    return entry;
  }

  async getQueueStats(shopId: string, barberId?: string) {
    const where = { shopId, ...(barberId && { barberId }) };
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [waitingCount, servingCount, servedTodayCount, recentServed] =
      await Promise.all([
        this.prisma.queueEntry.count({ where: { ...where, status: 'WAITING' } }),
        this.prisma.queueEntry.count({ where: { ...where, status: 'SERVING' } }),
        this.prisma.queueEntry.count({
          where: { ...where, status: 'SERVED', servedAt: { gte: today } },
        }),
        this.prisma.queueEntry.findMany({
          where: { ...where, status: 'SERVED', servedAt: { gte: today } },
          select: { servingAt: true, servedAt: true },
          take: 20,
        }),
      ]);

    // Calculate average service duration from today's data
    const durations = recentServed
      .filter((e) => e.servingAt && e.servedAt)
      .map((e) => (e.servedAt!.getTime() - e.servingAt!.getTime()) / 60000);

    const avgWaitMins =
      durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : null;

    return { waitingCount, servingCount, avgWaitMins, servedTodayCount };
  }

  // ── Status transitions ─────────────────────────────────────────────────────

  async updateStatus(input: UpdateQueueStatusInput, actorId: string) {
    const entry = await this.getEntryById(input.entryId);

    if (!isValidTransition(entry.status as QueueStatus, input.newStatus)) {
      throw new BadRequestException(
        `Invalid transition: ${entry.status} → ${input.newStatus}`,
      );
    }

    // Build timestamp updates based on new status
    const now = new Date();
    const timestampUpdate: Record<string, Date> = {};
    if (input.newStatus === 'CALLED') timestampUpdate.calledAt = now;
    if (input.newStatus === 'SERVING') timestampUpdate.servingAt = now;
    if (input.newStatus === 'SERVED') timestampUpdate.servedAt = now;
    if (input.newStatus === 'LEFT') timestampUpdate.leftAt = now;
    if (input.newStatus === 'NO_SHOW') timestampUpdate.noShowAt = now;

    const updated = await this.prisma.queueEntry.update({
      where: { id: input.entryId },
      data: { status: input.newStatus, ...timestampUpdate },
    });

    // Recalculate queue after status change
    if (!isTerminalStatus(input.newStatus)) {
      await this.recalculateQueue(entry.shopId, entry.barberId ?? undefined);
    } else {
      await this.recalculateQueue(entry.shopId, entry.barberId ?? undefined);
    }

    return updated;
  }

  // ── Customer leaves queue ─────────────────────────────────────────────────

  async leaveQueue(entryId: string, customerId: string) {
    const entry = await this.getEntryById(entryId);

    if (entry.customerId !== customerId) {
      throw new BadRequestException('Not your queue entry');
    }

    if (isTerminalStatus(entry.status as QueueStatus)) {
      throw new BadRequestException('Entry already completed');
    }

    return this.updateStatus(
      { entryId, newStatus: QueueStatus.LEFT },
      customerId,
    );
  }

  // ── Recalculate positions + EWT ───────────────────────────────────────────

  async recalculateQueue(shopId: string, barberId?: string) {
    const rawEntries = await this.prisma.queueEntry.findMany({
      where: {
        shopId,
        ...(barberId && { barberId }),
        status: { in: ['WAITING', 'CALLED'] },
      },
    });

    if (rawEntries.length === 0) {
      await this.publishUpdate(shopId, barberId, 'POSITION_UPDATE', null, []);
      return;
    }

    // Sort using queue-engine
    const sortableEntries = rawEntries.map((e) => ({
      id: e.id,
      priority: e.priority,
      joinedAt: e.joinedAt,
      entryType: e.entryType as 'WALK_IN' | 'APPOINTMENT',
      appointmentTime: undefined,
    }));
    const sorted = sortQueueEntries(sortableEntries);
    const positions = assignPositions(sorted);

    // Get average service duration
    const barberRecord = barberId
      ? await this.prisma.barber.findUnique({
          where: { id: barberId },
          select: { avgServiceDurationMins: true },
        })
      : null;
    const avgDuration =
      barberRecord?.avgServiceDurationMins ?? DEFAULT_AVG_DURATION;

    // Determine if a barber is currently serving
    const servingEntry = await this.prisma.queueEntry.findFirst({
      where: {
        shopId,
        ...(barberId && { barberId }),
        status: 'SERVING',
      },
      orderBy: { servingAt: 'desc' },
    });

    const currentElapsedMins = servingEntry?.servingAt
      ? (Date.now() - servingEntry.servingAt.getTime()) / 60000
      : 0;

    // Bulk update positions + EWT
    await Promise.all(
      rawEntries.map((entry) => {
        const position = positions.get(entry.id) ?? 0;
        const ewtResult = calculateEwt({
          position,
          avgServiceDurationMins: avgDuration,
          currentlyServing: !!servingEntry,
          currentServiceElapsedMins: currentElapsedMins,
          bufferPercent: 15,
        });
        return this.prisma.queueEntry.update({
          where: { id: entry.id },
          data: {
            position,
            estimatedWaitMins: ewtResult.estimatedMins,
          },
        });
      }),
    );

    // Fetch updated entries for subscription broadcast
    const updatedEntries = await this.getActiveQueue(shopId, barberId);
    await this.publishUpdate(shopId, barberId, 'POSITION_UPDATE', null, updatedEntries);
  }

  // ── PubSub publish ────────────────────────────────────────────────────────

  private async publishUpdate(
    shopId: string,
    barberId: string | undefined,
    type: string,
    entry: unknown,
    activeEntries: unknown[],
  ) {
    await pubSub.publish(QUEUE_EVENTS.QUEUE_UPDATED, {
      queueUpdated: {
        shopId,
        barberId: barberId ?? null,
        type,
        entry,
        activeEntries,
      },
    });
  }
}
