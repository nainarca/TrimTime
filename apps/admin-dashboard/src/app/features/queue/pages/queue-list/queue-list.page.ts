import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { QueueService, QueueEntry } from '../../../../core/services/queue.service';
import { TenantContextService } from '../../../../core/services/tenant-context.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'tt-queue-list-page',
  templateUrl: './queue-list.page.html',
  styleUrls: ['./queue-list.page.scss'],
})
export class QueueListPageComponent implements OnInit, OnDestroy {
  shopId:   string | null = null;
  barberId: string | null = null;

  entries:      QueueEntry[] = [];
  stats:        any;
  loading       = false;
  actionLoading = false;

  private subs: Subscription[] = [];

  constructor(
    private readonly queueService: QueueService,
    private readonly tenant:       TenantContextService,
    private readonly auth:         AuthService,
    private readonly notify:       NotificationService,
  ) {}

  ngOnInit(): void {
    this.shopId = this.tenant.getShopId() ?? this.auth.getShopId();
    if (!this.shopId) return;

    this.loadData();

    // Real-time updates via GraphQL subscription
    this.subs.push(
      this.queueService
        .queueUpdated$(this.shopId, this.barberId)
        .subscribe((evt) => {
          this.entries = evt.activeEntries;
          this.loadStats();          // refresh stat pills too
        }),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  loadData(): void {
    if (!this.shopId) return;
    this.loading = true;
    this.subs.push(
      this.queueService.getActiveQueue(this.shopId, this.barberId).subscribe({
        next: (entries) => {
          this.entries = entries;
          this.loading = false;
        },
        error: () => { this.loading = false; },
      }),
    );
    this.loadStats();
  }

  loadStats(): void {
    if (!this.shopId) return;
    this.subs.push(
      this.queueService.getQueueStats(this.shopId, this.barberId).subscribe({
        next: (s) => { this.stats = s; },
        error: () => {},
      }),
    );
  }

  // ── Queue actions — mirror logic from live-queue.page.ts ─────────────────

  get nextWaiting(): QueueEntry | undefined {
    return this.entries
      .filter(e => e.status === 'WAITING')
      .sort((a, b) => a.position - b.position)[0];
  }

  get currentServing(): QueueEntry | undefined {
    return this.entries.find(e => e.status === 'SERVING');
  }

  callNext(): void {
    const next = this.nextWaiting;
    if (!next || this.actionLoading) return;
    this.actionLoading = true;

    this.queueService.updateQueueStatus(next.id, 'CALLED').subscribe({
      next: () => {
        this.actionLoading = false;
        this.notify.success('Called', `Ticket ${next.ticketDisplay} has been called.`);
      },
      error: () => {
        this.actionLoading = false;
        this.notify.error('Action failed', 'Could not call next customer.');
      },
    });
  }

  startServing(entry: QueueEntry): void {
    if (this.actionLoading) return;
    this.actionLoading = true;

    this.queueService.updateQueueStatus(entry.id, 'SERVING').subscribe({
      next: () => {
        this.actionLoading = false;
        this.notify.success('Serving', `Now serving ${entry.ticketDisplay}.`);
      },
      error: () => {
        this.actionLoading = false;
        this.notify.error('Action failed', 'Could not start serving.');
      },
    });
  }

  markServed(entry: QueueEntry): void {
    if (this.actionLoading) return;
    this.actionLoading = true;

    this.queueService.updateQueueStatus(entry.id, 'SERVED').subscribe({
      next: () => {
        this.actionLoading = false;
        this.notify.success('Done', `Ticket ${entry.ticketDisplay} marked as served.`);
      },
      error: () => {
        this.actionLoading = false;
        this.notify.error('Action failed', 'Could not mark as served.');
      },
    });
  }

  skipEntry(entry: QueueEntry): void {
    if (this.actionLoading) return;
    this.actionLoading = true;

    this.queueService.updateQueueStatus(entry.id, 'NO_SHOW').subscribe({
      next: () => {
        this.actionLoading = false;
        this.notify.warn('Skipped', `Ticket ${entry.ticketDisplay} marked as no-show.`);
      },
      error: () => {
        this.actionLoading = false;
        this.notify.error('Action failed', 'Could not skip entry.');
      },
    });
  }

  // ── Template helpers ─────────────────────────────────────────────────────

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      WAITING: 'Waiting', CALLED: 'Called', SERVING: 'Serving',
      SERVED: 'Done', NO_SHOW: 'No Show', LEFT: 'Left',
    };
    return map[status] ?? status;
  }

  statusSeverity(status: string): string {
    const map: Record<string, string> = {
      WAITING: 'info', CALLED: 'warning', SERVING: 'success',
      SERVED: 'secondary', NO_SHOW: 'danger', LEFT: 'secondary',
    };
    return map[status] ?? 'info';
  }

  customerName(entry: QueueEntry): string {
    return entry.guestName || entry.guestPhone || 'Guest';
  }
}
