import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject, Subscription } from 'rxjs';
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

// ── Sound config ──────────────────────────────────────────────────────────────

interface ToneConfig {
  frequency: number;
  duration: number;   // ms
  volume: number;     // 0–1
  type: OscillatorType;
}

const SOUND_PROFILE: Record<NotificationType, ToneConfig[]> = {
  // Soft single blip — queue moved
  POSITION_UPDATE: [
    { frequency: 660, duration: 120, volume: 0.25, type: 'sine' },
  ],
  // Double chime — you're next!
  NEXT_IN_LINE: [
    { frequency: 880, duration: 150, volume: 0.45, type: 'sine' },
    { frequency: 1100, duration: 200, volume: 0.45, type: 'sine' },
  ],
  // Triple ascending chime — now serving
  NOW_SERVING: [
    { frequency: 784, duration: 130, volume: 0.6, type: 'sine' },
    { frequency: 988, duration: 130, volume: 0.6, type: 'sine' },
    { frequency: 1175, duration: 260, volume: 0.6, type: 'sine' },
  ],
};

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

  private audioCtx: AudioContext | null = null;
  private soundEnabled = true;
  private notifSub: Subscription | null = null;

  constructor(
    private readonly zone: NgZone,
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
    this.soundEnabled = enabled;
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

    // Sound
    if (this.soundEnabled) {
      this.playSound(notif.type).catch(() => {
        // AudioContext may be blocked until a user gesture — silently ignore
      });
    }
  }

  // ── Web Audio ─────────────────────────────────────────────────────────────

  private async playSound(type: NotificationType): Promise<void> {
    const tones = SOUND_PROFILE[type];
    if (!tones?.length) return;

    if (!this.audioCtx) {
      // AudioContext must be created after a user gesture in browsers
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    let startTime = this.audioCtx.currentTime;

    for (const tone of tones) {
      const osc    = this.audioCtx.createOscillator();
      const gain   = this.audioCtx.createGain();

      osc.type      = tone.type;
      osc.frequency.setValueAtTime(tone.frequency, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(tone.volume, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + tone.duration / 1000);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + tone.duration / 1000 + 0.05);

      startTime += (tone.duration / 1000) + 0.04; // slight gap between tones
    }
  }

  ngOnDestroy(): void {
    this.notifSub?.unsubscribe();
    this.toasts$.complete();
    this.notification$.complete();
    if (this.audioCtx) {
      void this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}
