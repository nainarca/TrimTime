import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject, Subscription } from 'rxjs';
import { QueueSoundPlayer } from '@trimtime/shared-utils';
import { QueueSocketService } from './queue-socket.service';

// ── Notification types (mirror backend) ──────────────────────────────────────

export type NotificationType =
  | 'POSITION_UPDATE'
  | 'NEXT_IN_LINE'
  | 'NOW_SERVING';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: 'normal' | 'high';
  timestamp: string;
  /** Whether the toast is actively shown */
  visible: boolean;
}

const TOAST_DURATION_MS: Record<'normal' | 'high', number> = {
  normal: 3_500,
  high:   6_000,
};

// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  /** Live toast stack — components bind to this */
  readonly toasts$ = new BehaviorSubject<AppNotification[]>([]);

  /** Raw stream — subscribe for any side-effect outside this service */
  readonly notification$ = new Subject<AppNotification>();

  private readonly player = new QueueSoundPlayer();
  private notifSub: Subscription | null = null;

  constructor(
    private readonly zone:        NgZone,
    private readonly queueSocket: QueueSocketService,
  ) {}

  // ── Entry room subscription ───────────────────────────────────────────────

  /**
   * Call this after loading a queue entry so the socket joins the
   * personal entry room and begins receiving targeted notifications.
   */
  watchEntry(entryId: string): void {
    // Tell the server to add this socket to entry:{entryId} room
    this.queueSocket.joinEntry(entryId);

    // Guard: tear down any previous subscription before creating a new one
    this.notifSub?.unsubscribe();

    // Subscribe to NOTIFICATION events from the socket
    this.notifSub = this.queueSocket.notification$.subscribe((payload) => {
      this.zone.run(() => this.handle(payload as unknown as AppNotification));
    });
  }

  stopWatching(entryId: string): void {
    this.queueSocket.leaveEntry(entryId);
    this.notifSub?.unsubscribe();
    this.notifSub = null;
  }

  // ── Public controls ───────────────────────────────────────────────────────

  setSoundEnabled(enabled: boolean): void {
    this.player.setEnabled(enabled);
  }

  dismiss(notificationId: string): void {
    const current = this.toasts$.value;
    this.toasts$.next(
      current.map((n) =>
        n.id === notificationId ? { ...n, visible: false } : n,
      ),
    );
    // Remove from array after CSS transition completes
    setTimeout(() => {
      this.toasts$.next(this.toasts$.value.filter((n) => n.id !== notificationId));
    }, 350);
  }

  // ── Internal ──────────────────────────────────────────────────────────────

  private handle(raw: AppNotification): void {
    const notif: AppNotification = { ...raw, visible: true };

    // Prepend (newest first) and cap at 3 visible toasts
    const next = [notif, ...this.toasts$.value].slice(0, 3);
    this.toasts$.next(next);
    this.notification$.next(notif);

    // Auto-dismiss
    setTimeout(() => this.dismiss(notif.id), TOAST_DURATION_MS[notif.priority]);

    // Sound — QueueSoundPlayer handles cooldown, user-gesture unlock, and
    // graceful no-op if AudioContext is blocked
    this.player.play(notif.type);
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnDestroy(): void {
    this.notifSub?.unsubscribe();
    this.toasts$.complete();
    this.notification$.complete();
    this.player.destroy();
  }
}
