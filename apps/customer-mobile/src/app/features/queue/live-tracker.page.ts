import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { QueueApiService, QueueEntry } from './services/queue-api.service';
import { QueueSocketService } from '../../core/services/queue-socket.service';
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

  private subs: Subscription[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly queueApi: QueueApiService,
    private readonly queueSocket: QueueSocketService,
    private readonly notifService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.entryId = this.route.snapshot.paramMap.get('entryId');
    if (!this.entryId) {
      this.error   = 'Invalid queue entry';
      this.loading = false;
      return;
    }

    this.queueApi.getQueueEntry(this.entryId).subscribe({
      next: (entry) => {
        this.entry   = entry;
        this.loading = false;
        this.watchUpdates(entry.shopId);
      },
      error: (err) => {
        this.error   = err.message || 'Could not load queue entry';
        this.loading = false;
      },
    });
  }

  private watchUpdates(shopId: string): void {
    // ── Socket.io (primary) ────────────────────────────────────
    this.queueSocket.connect(shopId);

    // Join the personal entry room and wire up the notification service.
    // NotificationService.watchEntry() calls joinEntry() internally and
    // sets up the toast + sound pipeline for NOTIFICATION socket events.
    if (this.entryId) {
      this.notifService.watchEntry(this.entryId);
    }

    this.subs.push(
      // Find this customer's entry in the broadcast list by ID
      this.queueSocket.queueUpdated$.subscribe((evt) => {
        const updated = evt.data.find((e) => e.id === this.entryId);
        if (updated) {
          this.entry = { ...this.entry!, ...(updated as unknown as QueueEntry) };
          if (this.entry.status === 'SERVED') {
            this.router.navigate(['/queue', this.entryId, 'done']);
          }
        }
      }),

      // Also watch NOW_SERVING_CHANGED to catch the exact "called" moment
      this.queueSocket.nowServing$.subscribe((evt) => {
        if (evt.data.id === this.entryId) {
          this.entry = { ...this.entry!, ...(evt.data as unknown as QueueEntry) };
        }
      }),

      // ── GraphQL subscription (fallback) ───────────────────────
      this.queueApi.queueUpdated$(shopId).subscribe({
        next: (evt) => {
          if (!this.queueSocket.isConnected && evt.entry?.id === this.entryId) {
            this.entry = { ...this.entry!, ...evt.entry };
            if (this.entry.status === 'SERVED') {
              this.router.navigate(['/queue', this.entryId, 'done']);
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
      this.notifService.stopWatching(this.entryId); // leaves room + unsubscribes
    }
    this.queueSocket.disconnect();
  }

  // ── Helpers ──────────────────────────────────────────────────

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

  get waitDisplay(): string {
    const mins = this.entry?.estimatedWaitMins;
    if (mins == null) return '—';
    if (mins < 1)     return 'Soon';
    return `${mins}`;
  }

  get currentServing(): number {
    const pos = this.entry?.position ?? 1;
    return Math.max(1, pos - 1);
  }

  goToScan(): void {
    this.router.navigate(['/tabs/scan']);
  }
}
