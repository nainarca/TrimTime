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
import { QueueSocketService } from '../../core/services/queue-socket.service';
import type { QueueEntry } from '../../../../../../libs/shared/src';

@Component({
  standalone: true,
  selector: 'tt-queue-display-page',
  imports: [CommonModule],
  templateUrl: './queue-display.page.html',
  styleUrls: ['./queue-display.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueueDisplayPage implements OnInit, OnDestroy {
  // ── Route params ────────────────────────────────────────────
  shopId!: string;
  branchId: string | null = null;

  // ── Queue state ──────────────────────────────────────────────
  currentServing?: QueueEntry;
  nextEntry?: QueueEntry;
  upcomingList: QueueEntry[] = [];   // positions 3–7 (right panel)
  waitingTicker: QueueEntry[] = [];  // all remaining (bottom ticker)

  // ── UI state ─────────────────────────────────────────────────
  currentTime = '';
  currentDate = '';
  ticketAnimating = false;
  isConnected = false;
  lastUpdated = new Date();

  private subs: Subscription[] = [];
  private prevTicket = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly queueService: QueueService,
    private readonly queueSocket: QueueSocketService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.shopId   = this.route.snapshot.paramMap.get('shopId')   as string;
    this.branchId = this.route.snapshot.paramMap.get('branchId');

    // ── Initial data load (HTTP) ───────────────────────────────
    this.loadQueue();

    // ── Socket.io realtime (primary) ───────────────────────────
    this.queueSocket.connect(this.shopId);

    this.subs.push(
      this.queueSocket.connected$.subscribe((ok) => {
        this.isConnected = ok;
        this.cdr.markForCheck();
      }),

      // Full queue list push → re-render immediately
      this.queueSocket.queueUpdated$.subscribe((evt) => {
        this.applyQueue(evt.data);
        this.lastUpdated = new Date();
        this.cdr.markForCheck();
      }),

      // NOW_SERVING_CHANGED → trigger animation explicitly
      this.queueSocket.nowServing$.subscribe((evt) => {
        const nowServing = evt.data as unknown as QueueEntry;
        if (nowServing.ticketDisplay !== this.prevTicket) {
          this.currentServing = nowServing;
          this.playTicketAnimation();
          this.prevTicket = nowServing.ticketDisplay;
          this.cdr.markForCheck();
        }
      }),
    );

    // ── GraphQL subscription (fallback when socket is down) ────
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

    // ── Polling every 30 s (last-resort catch-all) ─────────────
    const pollSub = interval(30_000).subscribe(() => {
      if (!this.queueSocket.isConnected) this.loadQueue();
    });
    this.subs.push(pollSub);

    // ── Live clock ─────────────────────────────────────────────
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

    // Prefer a SERVING entry for the current display; else fall back to #1
    this.currentServing =
      sorted.find((e) => e.status === 'SERVING') ?? sorted[0];

    const remaining = sorted.filter((e) => e !== this.currentServing);

    this.nextEntry     = remaining[0];
    this.upcomingList  = remaining.slice(1, 6);   // up to 5 items
    this.waitingTicker = remaining;                // all for bottom ticker

    // Animate the big number when the current ticket changes
    const newTicket = this.currentServing?.ticketDisplay ?? '';
    if (newTicket && newTicket !== this.prevTicket && this.prevTicket !== '') {
      this.playTicketAnimation();
    }
    this.prevTicket = newTicket;
  }

  private playTicketAnimation(): void {
    this.ticketAnimating = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.ticketAnimating = false;
      this.cdr.markForCheck();
    }, 700);
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
    // Slower scroll for fewer items, faster for more
    const base = Math.max(18, this.waitingTicker.length * 2.5);
    return `${base}s`;
  }

  get showTicker(): boolean {
    return this.waitingTicker.length > 0;
  }
}
