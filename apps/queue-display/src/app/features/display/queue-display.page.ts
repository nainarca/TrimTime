import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { QueueService } from '../../core/services/queue.service';
import { QueueSocketService, ConnectionState } from '../../core/services/queue-socket.service';
import { NotificationToastComponent } from '../../core/components/notification-toast/notification-toast.component';
import type { QueueEntry } from '../../../../../../libs/shared/src';

@Component({
  standalone: true,
  selector: 'tt-queue-display-page',
  imports: [CommonModule, NotificationToastComponent],
  templateUrl: './queue-display.page.html',
  styleUrls: ['./queue-display.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueueDisplayPage implements OnInit, OnDestroy {
  // ── Route params ─────────────────────────────────────────────
  shopId!: string;
  branchId:   string | null = null;
  shopName   = 'QueueCut';
  branchName = '';

  // ── Queue state ──────────────────────────────────────────────
  currentServing?: QueueEntry;
  nextEntry?: QueueEntry;
  upcomingList: QueueEntry[] = [];   // positions 3–7 (right panel)
  waitingTicker: QueueEntry[] = [];  // all remaining (bottom ticker)

  // ── UI state ─────────────────────────────────────────────────
  currentTime = '';
  currentDate = '';
  isConnected = false;
  connectionState: ConnectionState = {
    status: 'disconnected', attempt: 0, since: new Date(), lastError: null,
  };
  lastUpdated = new Date();

  // ── Animation state ──────────────────────────────────────────
  /** True while the hero number is playing its ticket-change animation. */
  ticketAnimating = false;
  /** True while the serving section is playing its glow-burst animation. */
  servingGlowing  = false;
  /** True while the UP NEXT number is playing its change animation. */
  nextChanging    = false;
  /** True while the stat pills are playing their pop animation. */
  statsPopping    = false;
  /**
   * True while the full-screen ambient glow overlay is playing.
   * Triggered when the serving ticket changes — briefly floods the display
   * with a cyan radial glow so the change is visible from across the room.
   */
  screenGlowing   = false;

  private subs: Subscription[] = [];
  private prevTicket     = '';
  private prevNextTicket = '';

  constructor(
    private readonly route:       ActivatedRoute,
    private readonly queueService: QueueService,
    private readonly queueSocket:  QueueSocketService,
    private readonly cdr:          ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.shopId   = this.route.snapshot.paramMap.get('shopId')   as string;
    this.branchId = this.route.snapshot.paramMap.get('branchId');

    const qp = this.route.snapshot.queryParamMap;
    if (qp.get('shopName'))   this.shopName   = qp.get('shopName')!;
    if (qp.get('branchName')) this.branchName = qp.get('branchName')!;

    // ── Initial data load (HTTP) ──────────────────────────────
    this.loadQueue();

    // ── Socket.io realtime (primary) ─────────────────────────
    this.queueSocket.connect(this.shopId);

    this.subs.push(
      this.queueSocket.connectionState$.subscribe((state) => {
        this.connectionState = state;
        this.isConnected     = state.status === 'connected';
        this.cdr.markForCheck();
      }),

      // Full queue list push → re-render table + ticker
      this.queueSocket.queueUpdated$.subscribe((evt) => {
        this.applyQueue(evt.data);
        this.lastUpdated = new Date();
        this.cdr.markForCheck();
      }),

      // NOW_SERVING_CHANGED → animate the hero number + ambient screen glow
      this.queueSocket.nowServing$.subscribe((evt) => {
        const nowServing = evt.data as unknown as QueueEntry;
        if (nowServing?.ticketDisplay !== this.prevTicket) {
          this.currentServing = nowServing;
          this.playTicketAnimation();
          this.playServingGlow();
          this.playScreenGlow();
          this.prevTicket = nowServing.ticketDisplay;
          this.cdr.markForCheck();
        }
      }),
    );

    // ── GraphQL subscription (fallback when socket is down) ───
    const gqlSub = this.queueService
      .queueUpdated$(this.shopId, null)
      .subscribe((evt: { activeEntries: QueueEntry[] }) => {
        if (!this.queueSocket.isConnected) {
          this.applyQueue(evt.activeEntries);
          this.lastUpdated = new Date();
          this.cdr.markForCheck();
        }
      });
    this.subs.push(gqlSub);

    // ── Polling every 30 s (last-resort catch-all) ────────────
    const pollSub = interval(30_000).subscribe(() => {
      if (!this.queueSocket.isConnected) this.loadQueue();
    });
    this.subs.push(pollSub);

    // ── Live clock ────────────────────────────────────────────
    const clockSub = interval(1_000).subscribe(() => {
      this.updateClock();
      this.cdr.markForCheck();
    });
    this.subs.push(clockSub);

    this.updateClock();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    this.queueSocket.disconnect();
  }

  // ── Private helpers ──────────────────────────────────────────

  private loadQueue(): void {
    this.queueService.getActiveQueue(this.shopId).subscribe({
      next: (entries: QueueEntry[]) => {
        this.applyQueue(entries);
        this.isConnected = true;
        this.lastUpdated = new Date();
        this.cdr.markForCheck();
      },
      error: () => {
        this.isConnected = false;
        this.cdr.markForCheck();
      },
    });
  }

  private applyQueue(entries: QueueEntry[]): void {
    const sorted = [...entries].sort((a, b) => a.position - b.position);

    this.currentServing =
      sorted.find(e => e.status === 'SERVING') ?? sorted[0];

    const remaining = sorted.filter(e => e !== this.currentServing);

    const newNext = remaining[0];

    // Animate UP NEXT number when it changes
    const newNextTicket = newNext?.ticketDisplay ?? '';
    if (newNextTicket && newNextTicket !== this.prevNextTicket && this.prevNextTicket !== '') {
      this.playNextAnimation();
    }
    this.prevNextTicket = newNextTicket;

    this.nextEntry     = newNext;
    this.upcomingList  = remaining.slice(1, 6);
    this.waitingTicker = remaining;

    // Pop stats on every queue change (count, est. wait, position)
    this.playStatsPop();

    // Animate when the served ticket changes (catches QUEUE_UPDATED path)
    const newTicket = this.currentServing?.ticketDisplay ?? '';
    if (newTicket && newTicket !== this.prevTicket && this.prevTicket !== '') {
      this.playTicketAnimation();
      this.playServingGlow();
      this.playScreenGlow();
    }
    this.prevTicket = newTicket;
  }

  /**
   * Triggers the hero-number change animation.
   * Sets ticketAnimating → true, then false after the keyframe duration (700ms).
   */
  private playTicketAnimation(): void {
    this.ticketAnimating = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.ticketAnimating = false;
      this.cdr.markForCheck();
    }, 700);
  }

  /**
   * Triggers the radial glow burst on the serving section.
   * Sets servingGlowing → true, then false after the keyframe duration (900ms).
   */
  private playServingGlow(): void {
    this.servingGlowing = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.servingGlowing = false;
      this.cdr.markForCheck();
    }, 900);
  }

  /**
   * Triggers the full-screen ambient glow overlay (1 800 ms).
   * Runs in parallel with playServingGlow() — the section glow
   * is localised; this one illuminates the entire background.
   */
  private playScreenGlow(): void {
    this.screenGlowing = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.screenGlowing = false;
      this.cdr.markForCheck();
    }, 1_800);
  }

  /**
   * Triggers the UP NEXT number change animation (600ms).
   */
  private playNextAnimation(): void {
    this.nextChanging = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.nextChanging = false;
      this.cdr.markForCheck();
    }, 600);
  }

  /**
   * Briefly sets statsPopping → true to re-trigger the stat pill pop.
   * Resets after 500ms (keyframe duration).
   */
  private playStatsPop(): void {
    // Reset first so Angular sees the class removed, then added again
    this.statsPopping = false;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.statsPopping = true;
      this.cdr.markForCheck();
      setTimeout(() => {
        this.statsPopping = false;
        this.cdr.markForCheck();
      }, 500);
    }, 20);
  }

  private updateClock(): void {
    const now = new Date();
    const h   = String(now.getHours()).padStart(2, '0');
    const m   = String(now.getMinutes()).padStart(2, '0');
    const s   = String(now.getSeconds()).padStart(2, '0');
    this.currentTime = `${h}:${m}:${s}`;
    this.currentDate = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month:   'short',
      day:     'numeric',
    });
  }

  // ── Public getters ────────────────────────────────────────────

  get totalWaiting(): number {
    return (this.nextEntry ? 1 : 0) + this.upcomingList.length;
  }

  get tickerDuration(): string {
    const base = Math.max(18, this.waitingTicker.length * 2.5);
    return `${base}s`;
  }

  get showTicker(): boolean {
    return this.waitingTicker.length > 0;
  }

  /**
   * trackBy for *ngFor loops.
   * Prevents Angular from destroying and recreating existing DOM nodes when
   * the array is replaced — only genuinely new entries get the enter animation.
   */
  trackById(_: number, entry: QueueEntry): string {
    return entry.id;
  }
}
