import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { QueueApiService, QueueEntry } from './services/queue-api.service';
import { QueueSocketService, ConnectionState } from '../../core/services/queue-socket.service';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationToastComponent } from '../../core/components/notification-toast/notification-toast.component';

@Component({
  standalone: true,
  selector: 'tt-live-tracker-page',
  imports: [CommonModule, IonicModule, NotificationToastComponent],
  templateUrl: './live-tracker.page.html',
  styleUrls: ['./live-tracker.page.scss'],
})
export class LiveTrackerPage implements OnInit, OnDestroy {
  entryId: string | null = null;
  entry?: QueueEntry;
  loading  = true;
  error    = '';

  // ── Passed from join-queue page (for served summary) ────────
  shopName  = '';
  barberName = '';

  // ── Connection ───────────────────────────────────────────────
  socketConnected = false;
  connectionState: ConnectionState = {
    status: 'disconnected', attempt: 0, since: new Date(), lastError: null,
  };

  // ── Animation state ──────────────────────────────────────────
  /** True while the position stat is playing its highlight animation. */
  positionChanging   = false;
  /** True while the Now Serving stat is playing its flip animation. */
  nowServingChanging = false;
  /** True while the progress bar is playing its glow animation. */
  progressFlashing   = false;
  /**
   * Starts false so the progress fill enters from 0% on first render,
   * then transitions smoothly to the real width.
   */
  progressReady = false;
  /**
   * Notification-driven card animation.
   * 'next'   — NEXT_IN_LINE: amber ring + gentle shake (you're #1)
   * 'called' — NOW_SERVING:  green burst + scale pop (your turn!)
   * null     — no active notification animation
   */
  notifAnim: 'next' | 'called' | null = null;

  // ── Now Serving tracking ─────────────────────────────────────
  /**
   * Actual ticket display of the currently-serving customer.
   * Derived from the QUEUE_UPDATED broadcast (status === 'SERVING').
   * More accurate than the position-1 estimate.
   */
  nowServingTicket: string | null = null;

  private prevPosition: number | null = null;
  private prevNowServingTicket: string | null = null;
  private subs: Subscription[] = [];

  constructor(
    private readonly route:        ActivatedRoute,
    private readonly router:       Router,
    private readonly queueApi:     QueueApiService,
    private readonly queueSocket:  QueueSocketService,
    private readonly notifService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.entryId   = this.route.snapshot.paramMap.get('entryId');
    this.shopName  = this.route.snapshot.queryParamMap.get('shopName')  || '';
    this.barberName = this.route.snapshot.queryParamMap.get('barberName') || '';
    if (!this.entryId) {
      this.error   = 'Invalid queue entry';
      this.loading = false;
      return;
    }

    this.queueApi.getQueueEntry(this.entryId).subscribe({
      next: (entry) => {
        this.entry          = entry;
        this.prevPosition   = entry.position;
        this.loading        = false;
        this.watchUpdates(entry.shopId);

        // One frame delay lets Angular render the bar at 0% first,
        // then the CSS transition animates it to the real width.
        setTimeout(() => { this.progressReady = true; }, 60);
      },
      error: (err) => {
        this.error   = err.message || 'Could not load queue entry';
        this.loading = false;
      },
    });
  }

  private watchUpdates(shopId: string): void {
    this.queueSocket.connect(shopId);

    if (this.entryId) {
      this.notifService.watchEntry(this.entryId);
    }

    this.subs.push(
      // ── NOTIFICATION: direct push to this entry ──────────────
      // Drive the token card animation independently of QUEUE_UPDATED timing.
      this.notifService.notification$.subscribe((notif) => {
        const anim = notif.type === 'NOW_SERVING' ? 'called' : 'next';
        this.notifAnim = anim;
        setTimeout(() => { this.notifAnim = null; },
          anim === 'called' ? 1_400 : 1_000);
      }),

      // ── Connection state ────────────────────────────────────
      this.queueSocket.connectionState$.subscribe((state) => {
        this.connectionState = state;
        this.socketConnected = state.status === 'connected';
      }),

      // ── QUEUE_UPDATED: full queue snapshot ──────────────────
      // Extract the now-serving ticket from the broadcast, then
      // patch this customer's own entry if it appears in the list.
      this.queueSocket.queueUpdated$.subscribe((evt) => {
        // Track who is actually being served right now
        const servingEntry = evt.data.find(e => e.status === 'SERVING');
        this.applyNowServingFromQueue(
          servingEntry?.ticketDisplay ?? null,
        );

        // Patch this customer's entry
        const updated = evt.data.find(e => e.id === this.entryId);
        if (updated) {
          this.applyEntryUpdate(updated as unknown as QueueEntry);
          if (this.entry?.status === 'SERVED') {
            this.router.navigate(['/queue', this.entryId, 'done'], {
  queryParams: {
    shopName:      this.shopName,
    barberName:    this.barberName,
    ticket:        this.entry?.ticketDisplay || '',
  },
});
          }
        }
      }),

      // ── NOW_SERVING_CHANGED: fast-path ──────────────────────
      // Immediately updates the Now Serving stat and, if this is
      // the customer's own entry, patches it right away.
      this.queueSocket.nowServing$.subscribe((evt) => {
        const serving = evt.data as unknown as QueueEntry;
        // Always update the now-serving display
        this.applyNowServingFromQueue(serving?.ticketDisplay ?? null);

        // If this is my own entry, apply the full update
        if (serving?.id === this.entryId) {
          this.applyEntryUpdate(serving);
        }
      }),

      // ── GraphQL subscription (fallback) ─────────────────────
      this.queueApi.queueUpdated$(shopId).subscribe({
        next: (evt) => {
          if (!this.queueSocket.isConnected && evt.entry?.id === this.entryId) {
            this.applyEntryUpdate({ ...this.entry!, ...evt.entry });
            if (this.entry?.status === 'SERVED') {
              this.router.navigate(['/queue', this.entryId, 'done'], {
  queryParams: {
    shopName:      this.shopName,
    barberName:    this.barberName,
    ticket:        this.entry?.ticketDisplay || '',
  },
});
            }
          }
        },
        error: () => {},
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    if (this.entryId) {
      this.notifService.stopWatching(this.entryId);
    }
    this.queueSocket.disconnect();
  }

  // ── Private helpers ──────────────────────────────────────────

  /**
   * Merges an incoming entry update into `this.entry`.
   * Detects position changes and triggers the appropriate animations.
   */
  private applyEntryUpdate(updated: QueueEntry): void {
    const prevPos = this.prevPosition;
    const newPos  = updated.position;

    this.entry        = { ...this.entry!, ...updated };
    this.prevPosition = newPos;

    // Position moved forward (queue advanced) → highlight the stat
    if (prevPos !== null && newPos < prevPos) {
      this.positionChanging = true;
      setTimeout(() => { this.positionChanging = false; }, 850);

      // Also flash the progress bar as it grows
      this.progressFlashing = true;
      setTimeout(() => { this.progressFlashing = false; }, 1000);
    }
  }

  /**
   * Updates the displayed now-serving ticket and triggers
   * the flip animation when it actually changes.
   */
  private applyNowServingFromQueue(ticket: string | null): void {
    if (ticket === this.nowServingTicket) return;

    const wasNull = this.prevNowServingTicket === null;
    this.nowServingTicket      = ticket;
    this.prevNowServingTicket  = ticket;

    // Don't animate the very first value — only subsequent changes
    if (!wasNull) {
      this.nowServingChanging = true;
      setTimeout(() => { this.nowServingChanging = false; }, 800);
    }
  }

  // ── Template getters ─────────────────────────────────────────

  get statusLabel(): string {
    const map: Record<string, string> = {
      WAITING: 'Waiting',
      CALLED:  'You\'ve been called!',
      SERVING: 'Now Serving',
      SERVED:  'Service Complete',
      NO_SHOW: 'Marked No-show',
    };
    return map[this.entry?.status ?? ''] ?? this.entry?.status ?? '';
  }

  get statusIcon(): string {
    const map: Record<string, string> = {
      WAITING: 'time-outline',
      CALLED:  'megaphone-outline',
      SERVING: 'cut-outline',
      SERVED:  'checkmark-circle-outline',
      NO_SHOW: 'close-circle-outline',
    };
    return map[this.entry?.status ?? ''] ?? 'help-outline';
  }

  get statusColor(): string {
    const map: Record<string, string> = {
      WAITING: 'waiting',
      CALLED:  'called',
      SERVING: 'serving',
      SERVED:  'served',
      NO_SHOW: 'noshow',
    };
    return map[this.entry?.status ?? ''] ?? 'waiting';
  }

  get progressWidth(): number {
    if (!this.entry) return 0;
    const pos   = this.entry.position ?? 10;
    const total = Math.max(pos, 1);
    return Math.round(((total - pos) / total) * 100);
  }

  /**
   * Returns 0 until `progressReady` flips true (after initial render),
   * allowing the CSS transition to animate the bar from 0% to the real width.
   */
  get progressDisplayWidth(): number {
    return this.progressReady ? this.progressWidth : 0;
  }

  get waitDisplay(): string {
    const mins = this.entry?.estimatedWaitMins;
    if (mins == null) return '—';
    if (mins < 1)     return 'Soon';
    return `${mins}`;
  }

  /**
   * Displayed in the "Now Serving" stat.
   * Shows the actual ticket being served when known (from QUEUE_UPDATED),
   * falls back to the position-1 approximation.
   */
  get nowServingDisplay(): string {
    if (this.nowServingTicket) return this.nowServingTicket;
    const pos = this.entry?.position ?? 1;
    return `#${Math.max(1, pos - 1)}`;
  }

  goToScan(): void {
    this.router.navigate(['/tabs/scan']);
  }

  retryConnection(): void {
    this.queueSocket.forceReconnect();
  }
}
