import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { QueueService, QueueEntry } from '../../../../core/services/queue.service';
import { QueueSocketService } from '../../../../core/services/queue-socket.service';
import { TenantContextService } from '../../../../core/services/tenant-context.service';

@Component({
  selector: 'tt-live-queue-page',
  templateUrl: './live-queue.page.html',
  styleUrls: ['./live-queue.page.scss'],
})
export class LiveQueuePageComponent implements OnInit, OnDestroy {
  shopId: string | null = null;
  barberId: string | null = null;

  entries: QueueEntry[] = [];
  currentServing?: QueueEntry;
  loading = false;
  actionLoading = false;

  /** True while the socket transport is live */
  socketConnected = false;

  private subs: Subscription[] = [];

  constructor(
    private readonly queueService: QueueService,
    private readonly queueSocket: QueueSocketService,
    private readonly tenant: TenantContextService,
  ) {}

  ngOnInit(): void {
    this.shopId = this.tenant.getShopId();
    if (!this.shopId) return;

    // ── Initial load ───────────────────────────────────────────
    this.reload();

    // ── Socket.io realtime (primary) ───────────────────────────
    this.queueSocket.connect(this.shopId);

    this.subs.push(
      this.queueSocket.connected$.subscribe((ok) => {
        this.socketConnected = ok;
      }),
      this.queueSocket.queueUpdated$.subscribe((evt) => {
        this.entries = evt.data as unknown as QueueEntry[];
        this.updateCurrentServing();
      }),
    );

    // ── GraphQL subscription (fallback when socket is offline) ─
    this.subs.push(
      this.queueService
        .queueUpdated$(this.shopId, this.barberId)
        .subscribe((evt) => {
          // Only apply GraphQL update when socket transport is down
          if (!this.socketConnected) {
            this.entries = evt.activeEntries;
            this.updateCurrentServing();
          }
        }),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    this.queueSocket.disconnect();
  }

  reload(): void {
    if (!this.shopId) return;
    this.loading = true;
    this.queueService.getActiveQueue(this.shopId, this.barberId).subscribe((entries) => {
      this.entries = entries;
      this.loading = false;
      this.updateCurrentServing();
    });
  }

  private updateCurrentServing(): void {
    this.currentServing = this.entries.find((e) => e.status === 'SERVING');
  }

  get nextWaiting(): QueueEntry | undefined {
    return this.entries
      .filter((e) => e.status === 'WAITING')
      .sort((a, b) => a.position - b.position)[0];
  }

  countByStatus(status: string): number {
    return this.entries.filter((e) => e.status === status).length;
  }

  getCustomerName(entry: QueueEntry): string {
    return entry.guestName || entry.guestPhone || 'Guest';
  }

  getInitial(entry: QueueEntry): string {
    const name = this.getCustomerName(entry);
    return name.charAt(0).toUpperCase();
  }

  callNext(): void {
    const next = this.nextWaiting;
    if (!next || this.actionLoading) return;
    this.actionLoading = true;
    this.queueService.updateQueueStatus(next.id, 'CALLED').subscribe({
      next: () => { this.actionLoading = false; },
      error: () => { this.actionLoading = false; },
    });
  }

  skipToken(entry: QueueEntry): void {
    if (this.actionLoading) return;
    this.actionLoading = true;
    this.queueService.updateQueueStatus(entry.id, 'NO_SHOW').subscribe({
      next: () => { this.actionLoading = false; },
      error: () => { this.actionLoading = false; },
    });
  }

  startServing(entry: QueueEntry): void {
    if (this.actionLoading) return;
    this.actionLoading = true;
    this.queueService.updateQueueStatus(entry.id, 'SERVING').subscribe({
      next: () => { this.actionLoading = false; },
      error: () => { this.actionLoading = false; },
    });
  }

  completeCurrent(): void {
    if (!this.currentServing || this.actionLoading) return;
    this.actionLoading = true;
    this.queueService.updateQueueStatus(this.currentServing.id, 'SERVED').subscribe({
      next: () => { this.actionLoading = false; },
      error: () => { this.actionLoading = false; },
    });
  }
}
