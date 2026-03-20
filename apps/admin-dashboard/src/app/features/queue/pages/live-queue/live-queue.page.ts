import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { QueueService, QueueEntry } from '../../../../core/services/queue.service';
import { QueueSocketService, NowServingPayload, ConnectionState } from '../../../../core/services/queue-socket.service';
import { ShopService } from '../../../../core/services/shop.service';
import { TenantContextService } from '../../../../core/services/tenant-context.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth/auth.service';

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
  socketConnected = false;
  connectionState: ConnectionState = {
    status: 'disconnected', attempt: 0, since: new Date(), lastError: null,
  };

  // ── Animation state ──────────────────────────────────────────────────────────
  /** IDs of rows that just changed status (generic) — subtle outline pulse. */
  flashingIds     = new Set<string>();
  /** IDs of rows whose status just changed to CALLED — amber burst. */
  calledFlashIds  = new Set<string>();
  /** IDs of rows whose status just changed to SERVING — blue burst. */
  servingFlashIds = new Set<string>();
  /** IDs of rows that just joined the queue — green slide-in. */
  newEntryIds     = new Set<string>();
  /** True while the Now Serving block is playing its change animation. */
  servingChanging = false;
  /** True while the ticket token is playing its flip animation. */
  tokenFlashing   = false;

  private subs: Subscription[] = [];

  constructor(
    private readonly auth: AuthService,
    private readonly queueService: QueueService,
    private readonly queueSocket: QueueSocketService,
    private readonly shopService: ShopService,
    private readonly tenant: TenantContextService,
    private readonly notify: NotificationService,
  ) {}

  ngOnInit(): void {
    const contextShopId = this.tenant.getShopId() ?? this.auth.getShopId();

    if (contextShopId) {
      this.tenant.setShopId(contextShopId);
      this.shopId = contextShopId;
      this.initQueue();
    } else {
      this.subs.push(
        this.shopService.getMyShop().subscribe({
          next: (shop) => {
            this.shopId = shop.id;
            this.initQueue();
          },
          error: () => {
            this.notify.error('Connection failed', 'Could not identify your shop. Please log in again.');
          },
        }),
      );
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    this.queueSocket.disconnect();
  }

  private initQueue(): void {
    this.reload();
    this.queueSocket.connect(this.shopId!);

    this.subs.push(
      // ── Socket connection state ──────────────────────────────────────────────
      this.queueSocket.connectionState$.subscribe((state) => {
        this.connectionState = state;
        this.socketConnected = state.status === 'connected';
      }),

      // ── QUEUE_UPDATED: authoritative full-queue refresh ──────────────────────
      // Detects new arrivals (slide-in) and status changes (flash) before
      // replacing the entries array.
      this.queueSocket.queueUpdated$.subscribe((evt) => {
        this.applyQueueUpdate(evt.data as QueueEntry[]);
      }),

      // ── NOW_SERVING_CHANGED: fast-path update ────────────────────────────────
      // Updates the Now Serving block immediately and animates the transition.
      this.queueSocket.nowServing$.subscribe((evt) => {
        this.applyNowServing(evt);
      }),

      // ── GraphQL subscription fallback (offline mode) ─────────────────────────
      this.queueService.queueUpdated$(this.shopId!, this.barberId).subscribe((evt) => {
        if (!this.socketConnected) {
          this.applyQueueUpdate(evt.activeEntries);
        }
      }),
    );
  }

  reload(): void {
    if (!this.shopId) return;
    this.loading = true;
    this.subs.push(
      this.queueService.getActiveQueue(this.shopId, this.barberId).subscribe({
        next: (entries) => {
          this.entries = entries;
          this.loading = false;
          this.updateCurrentServing();
        },
        error: () => {
          this.loading = false;
          this.notify.error('Load failed', 'Could not fetch queue entries.');
        },
      }),
    );
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  /**
   * Applies a full queue snapshot from QUEUE_UPDATED.
   * Tracks new arrivals and status changes so the template can play
   * per-row animations without requiring Angular Animations module.
   */
  private applyQueueUpdate(incoming: QueueEntry[]): void {
    const existingMap = new Map(this.entries.map(e => [e.id, e]));

    // New entries: ID not in current list → green slide-in
    const freshIds = incoming
      .filter(e => !existingMap.has(e.id))
      .map(e => e.id);

    if (freshIds.length) {
      freshIds.forEach(id => this.newEntryIds.add(id));
      setTimeout(() => freshIds.forEach(id => this.newEntryIds.delete(id)), 600);
    }

    // Changed entries: split by new status so each gets its own animation
    const toCalledIds:   string[] = [];
    const toServingIds:  string[] = [];
    const toOtherIds:    string[] = [];

    incoming.forEach(e => {
      const prev = existingMap.get(e.id);
      if (!prev || prev.status === e.status) return;
      if (e.status === 'CALLED')        toCalledIds.push(e.id);
      else if (e.status === 'SERVING')  toServingIds.push(e.id);
      else                              toOtherIds.push(e.id);
    });

    if (toCalledIds.length) {
      toCalledIds.forEach(id => this.calledFlashIds.add(id));
      setTimeout(() => toCalledIds.forEach(id => this.calledFlashIds.delete(id)), 1_000);
    }
    if (toServingIds.length) {
      toServingIds.forEach(id => this.servingFlashIds.add(id));
      setTimeout(() => toServingIds.forEach(id => this.servingFlashIds.delete(id)), 1_000);
    }
    if (toOtherIds.length) {
      toOtherIds.forEach(id => this.flashingIds.add(id));
      setTimeout(() => toOtherIds.forEach(id => this.flashingIds.delete(id)), 700);
    }

    this.entries = incoming;
    this.updateCurrentServing();
  }

  /**
   * Handles NOW_SERVING_CHANGED.
   * Immediately updates currentServing for the status bar and flashes
   * the corresponding table row. The table data is corrected authoritatively
   * by the QUEUE_UPDATED event that always follows.
   */
  private applyNowServing(evt: NowServingPayload): void {
    const serving = evt.data as QueueEntry | null;
    const changed  = serving?.id !== this.currentServing?.id;

    this.currentServing = serving ?? undefined;

    if (changed && serving) {
      // Animate the Now Serving block + ticket token
      this.servingChanging = true;
      this.tokenFlashing   = true;
      setTimeout(() => { this.servingChanging = false; }, 750);
      setTimeout(() => { this.tokenFlashing   = false; }, 500);

      // Flash the corresponding row in the table
      this.flashingIds.add(serving.id);
      setTimeout(() => this.flashingIds.delete(serving.id), 700);
    }

    if (!serving) return;

    // Patch the row in-place so the table highlight transitions immediately
    const idx = this.entries.findIndex(e => e.id === serving.id);
    if (idx !== -1) {
      this.entries = [
        ...this.entries.slice(0, idx),
        { ...this.entries[idx], ...serving },
        ...this.entries.slice(idx + 1),
      ];
    }
  }

  private updateCurrentServing(): void {
    this.currentServing = this.entries.find(e => e.status === 'SERVING');
  }

  // ── Template helpers ─────────────────────────────────────────────────────────

  get nextWaiting(): QueueEntry | undefined {
    return this.entries
      .filter(e => e.status === 'WAITING')
      .sort((a, b) => a.position - b.position)[0];
  }

  countByStatus(status: string): number {
    return this.entries.filter(e => e.status === status).length;
  }

  getCustomerName(entry: QueueEntry): string {
    return entry.guestName || entry.guestPhone || 'Guest';
  }

  getInitial(entry: QueueEntry): string {
    return this.getCustomerName(entry).charAt(0).toUpperCase();
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      WAITING: 'Waiting',
      CALLED:  'Called',
      SERVING: 'Serving',
      SERVED:  'Done',
      NO_SHOW: 'No Show',
    };
    return map[status] ?? status;
  }

  // ── Queue actions ────────────────────────────────────────────────────────────

  callNext(): void {
    const next = this.nextWaiting;
    if (!next || this.actionLoading) return;
    this.actionLoading = true;
    this.queueService.updateQueueStatus(next.id, 'CALLED').subscribe({
      next: () => { this.actionLoading = false; },
      error: () => {
        this.actionLoading = false;
        this.notify.error('Action failed', 'Could not call next customer.');
      },
    });
  }

  skipToken(entry: QueueEntry): void {
    if (this.actionLoading) return;
    this.actionLoading = true;
    this.queueService.updateQueueStatus(entry.id, 'NO_SHOW').subscribe({
      next: () => { this.actionLoading = false; },
      error: () => {
        this.actionLoading = false;
        this.notify.error('Action failed', 'Could not skip this customer.');
      },
    });
  }

  startServing(entry: QueueEntry): void {
    if (this.actionLoading) return;
    this.actionLoading = true;
    this.queueService.updateQueueStatus(entry.id, 'SERVING').subscribe({
      next: () => { this.actionLoading = false; },
      error: () => {
        this.actionLoading = false;
        this.notify.error('Action failed', 'Could not start serving.');
      },
    });
  }

  completeCurrent(): void {
    if (!this.currentServing || this.actionLoading) return;
    this.actionLoading = true;
    this.queueService.updateQueueStatus(this.currentServing.id, 'SERVED').subscribe({
      next: () => {
        this.actionLoading = false;
        this.notify.success('Done', 'Customer marked as served.');
      },
      error: () => {
        this.actionLoading = false;
        this.notify.error('Action failed', 'Could not complete service.');
      },
    });
  }
}
