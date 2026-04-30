import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../database/prisma.service';
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
import { NOTIFICATION_EVENTS } from '../notifications/types/notification.types';

const DEFAULT_AVG_DURATION = 20; // minutes fallback

const TERMINAL_STATUSES = new Set(['SERVED', 'LEFT', 'NO_SHOW']);

/** Staff/owner tokens carry shop IDs; customers often have [] — only enforce tenant when non-empty. */
function isTenantScoped(allowedShopIds?: string[]): boolean {
  return Array.isArray(allowedShopIds) && allowedShopIds.length > 0;
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  /** In-memory dedup for NEXT_IN_LINE notifications: entryId -> expiresAt ms */
  private readonly nextInLineNotifSent = new Map<string, number>();

  constructor(
    private readonly prisma:       PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ── Join queue ─────────────────────────────────────────────────────────────

  async joinQueue(input: JoinQueueInput, customerId?: string, allowedShopIds?: string[]) {
    if (isTenantScoped(allowedShopIds) && !allowedShopIds!.includes(input.shopId)) {
      throw new ForbiddenException('Cannot join queue for another shop');
    }

    const branch = await this.prisma.shopBranch.findFirst({
      where: { id: input.branchId, shopId: input.shopId, isActive: true },
    });
    if (!branch) throw new NotFoundException('Branch not found');

    if (input.barberId) {
      const barber = await this.prisma.barber.findFirst({
        where: { id: input.barberId, shopId: input.shopId, isActive: true },
      });
      if (!barber) throw new NotFoundException('Barber not found');
      if (!barber.queueAccepting) {
        throw new BadRequestException('This barber is not accepting queue entries right now');
      }
    }

    // Generate ticket number from DB: max ticketNumber for this shop today + 1
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const lastEntry = await this.prisma.queueEntry.findFirst({
      where: {
        shopId: input.shopId,
        joinedAt: { gte: todayStart },
      },
      orderBy: { ticketNumber: 'desc' },
      select: { ticketNumber: true },
    });
    const ticketNumber = (lastEntry?.ticketNumber ?? 0) + 1;
    const ticketDisplay = formatTicket(ticketNumber);

    const entry = await this.prisma.queueEntry.create({
      data: {
        shopId:        input.shopId,
        branchId:      input.branchId,
        barberId:      input.barberId,
        customerId,
        ticketNumber,
        ticketDisplay,
        entryType:     input.entryType,
        priority:      input.priority,
        status:        'WAITING',
        position:      0,
        guestName:     input.guestName,
        guestPhone:    input.guestPhone,
        appointmentId: input.appointmentId,
      },
    });

    await this.recalculateQueue(input.shopId, input.barberId);

    return entry;
  }

  // ── Get active queue ───────────────────────────────────────────────────────

  async getActiveQueue(shopId: string, barberId?: string) {
    return this.prisma.queueEntry.findMany({
      where: {
        shopId,
        ...(barberId && { barberId }),
        status: { in: ['WAITING', 'CALLED', 'SERVING'] },
      },
      orderBy: [{ priority: 'desc' }, { joinedAt: 'asc' }],
    });
  }

  async getEntryById(entryId: string, allowedShopIds?: string[]) {
    const entry = await this.prisma.queueEntry.findUnique({ where: { id: entryId } });
    if (!entry) throw new NotFoundException(`Queue entry ${entryId} not found`);
    if (isTenantScoped(allowedShopIds) && !allowedShopIds!.includes(entry.shopId)) {
      throw new ForbiddenException('Cannot access queue entry from another shop');
    }
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

  async updateStatus(input: UpdateQueueStatusInput, actorId: string, allowedShopIds?: string[]) {
    const entry = await this.getEntryById(input.entryId, allowedShopIds);

    if (!isValidTransition(entry.status as QueueStatus, input.newStatus)) {
      throw new BadRequestException(
        `Invalid transition: ${entry.status} → ${input.newStatus}`,
      );
    }

    const now = new Date();
    const timestampUpdate: Record<string, Date> = {};
    if (input.newStatus === 'CALLED')   timestampUpdate.calledAt   = now;
    if (input.newStatus === 'SERVING')  timestampUpdate.servingAt  = now;
    if (input.newStatus === 'SERVED')   timestampUpdate.servedAt   = now;
    if (input.newStatus === 'LEFT')     timestampUpdate.leftAt     = now;
    if (input.newStatus === 'NO_SHOW')  timestampUpdate.noShowAt   = now;

    const updated = await this.prisma.queueEntry.update({
      where: { id: input.entryId },
      data:  { status: input.newStatus, ...timestampUpdate },
    });

    await this.recalculateQueue(entry.shopId, entry.barberId ?? undefined);

    if (input.newStatus === 'CALLED') {
      this.clearNextInLineNotif(updated.id);

      this.logger.log(
        `[NOTIF] QUEUE_CALLED → entry:${updated.id} ticket:${updated.ticketDisplay} shop:${updated.shopId}`,
      );

      this.eventEmitter.emit(NOTIFICATION_EVENTS.QUEUE_CALLED, {
        queueId:       updated.id,
        entryId:       updated.id,
        shopId:        updated.shopId,
        ticketDisplay: updated.ticketDisplay,
        guestPhone:    updated.guestPhone,
        guestName:     updated.guestName,
      });
    }

    if (TERMINAL_STATUSES.has(input.newStatus)) {
      this.clearNextInLineNotif(updated.id);
    }

    return updated;
  }

  // ── Customer leaves queue ─────────────────────────────────────────────────

  async leaveQueue(entryId: string, customerId: string, allowedShopIds?: string[]) {
    const entry = await this.getEntryById(entryId, allowedShopIds);

    if (entry.customerId !== customerId) {
      throw new BadRequestException('Not your queue entry');
    }
    if (isTerminalStatus(entry.status as QueueStatus)) {
      throw new BadRequestException('Entry already completed');
    }

    return this.updateStatus({ entryId, newStatus: QueueStatus.LEFT }, customerId);
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

    const positionSnapshot = new Map(rawEntries.map((e) => [e.id, e.position]));

    const sortable = rawEntries.map((e) => ({
      id:              e.id,
      priority:        e.priority,
      joinedAt:        e.joinedAt,
      entryType:       e.entryType as 'WALK_IN' | 'APPOINTMENT',
      appointmentTime: undefined,
    }));
    const sorted    = sortQueueEntries(sortable);
    const positions = assignPositions(sorted);

    const barberRecord = barberId
      ? await this.prisma.barber.findUnique({
          where: { id: barberId },
          select: { avgServiceDurationMins: true },
        })
      : null;
    const avgDuration = barberRecord?.avgServiceDurationMins ?? DEFAULT_AVG_DURATION;

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

    interface NotifCandidate {
      entryId:           string;
      ticketDisplay:     string;
      guestPhone:        string | null;
      guestName:         string | null;
      oldPosition:       number;
      newPosition:       number;
      estimatedWaitMins: number | null;
    }
    const notifCandidates: NotifCandidate[] = [];

    await Promise.all(
      rawEntries.map((entry) => {
        const newPos    = positions.get(entry.id) ?? 0;
        const ewtResult = calculateEwt({
          position:                    newPos,
          avgServiceDurationMins:      avgDuration,
          currentlyServing:            !!servingEntry,
          currentServiceElapsedMins:   currentElapsedMins,
          bufferPercent:               15,
        });

        const oldPos = positionSnapshot.get(entry.id) ?? 0;

        if (oldPos !== 0 && oldPos !== newPos) {
          notifCandidates.push({
            entryId:           entry.id,
            ticketDisplay:     entry.ticketDisplay,
            guestPhone:        entry.guestPhone,
            guestName:         entry.guestName,
            oldPosition:       oldPos,
            newPosition:       newPos,
            estimatedWaitMins: ewtResult.estimatedMins,
          });
        }

        return this.prisma.queueEntry.update({
          where: { id: entry.id },
          data:  { position: newPos, estimatedWaitMins: ewtResult.estimatedMins },
        });
      }),
    );

    const updatedEntries = await this.getActiveQueue(shopId, barberId);
    await this.publishUpdate(shopId, barberId, 'POSITION_UPDATE', null, updatedEntries);

    for (const c of notifCandidates) {
      this.logger.debug(
        `[NOTIF] POSITION_CHANGED → entry:${c.entryId} ` +
        `${c.oldPosition}→${c.newPosition} shop:${shopId}`,
      );

      this.eventEmitter.emit(NOTIFICATION_EVENTS.POSITION_CHANGED, {
        queueId:           c.entryId,
        entryId:           c.entryId,
        shopId,
        ticketDisplay:     c.ticketDisplay,
        guestPhone:        c.guestPhone,
        guestName:         c.guestName,
        oldPosition:       c.oldPosition,
        newPosition:       c.newPosition,
        estimatedWaitMins: c.estimatedWaitMins,
      });

      if (c.newPosition === 1) {
        const claimed = this.claimNextInLineNotif(c.entryId);

        if (claimed) {
          this.logger.log(
            `[NOTIF] NEXT_IN_LINE → entry:${c.entryId} ticket:${c.ticketDisplay} shop:${shopId}`,
          );

          this.eventEmitter.emit(NOTIFICATION_EVENTS.NEXT_IN_LINE, {
            queueId:           c.entryId,
            entryId:           c.entryId,
            shopId,
            ticketDisplay:     c.ticketDisplay,
            guestPhone:        c.guestPhone,
            guestName:         c.guestName,
            estimatedWaitMins: c.estimatedWaitMins,
          });
        } else {
          this.logger.debug(
            `[NOTIF] NEXT_IN_LINE skipped (dedup) → entry:${c.entryId}`,
          );
        }
      }
    }
  }

  // ── PubSub publish ────────────────────────────────────────────────────────

  private async publishUpdate(
    shopId:        string,
    barberId:      string | undefined,
    type:          string,
    entry:         unknown,
    activeEntries: unknown[],
  ) {
    const payload = {
      shopId,
      barberId:     barberId ?? null,
      type,
      entry,
      activeEntries,
    };

    await pubSub.publish(QUEUE_EVENTS.QUEUE_UPDATED, {
      queueUpdated: payload,
    });

    this.eventEmitter.emit('queue.updated', payload);

    this.logger.debug(
      `[BROADCAST] QUEUE_UPDATED → shop:${shopId} entries:${(activeEntries as unknown[]).length}`,
    );
  }

  // ── NEXT_IN_LINE dedup (in-memory) ────────────────────────────────────────

  private claimNextInLineNotif(entryId: string, ttlSeconds = 600): boolean {
    const existing = this.nextInLineNotifSent.get(entryId);
    if (existing && Date.now() < existing) return false;
    this.nextInLineNotifSent.set(entryId, Date.now() + ttlSeconds * 1000);
    return true;
  }

  private clearNextInLineNotif(entryId: string): void {
    this.nextInLineNotifSent.delete(entryId);
  }
}
