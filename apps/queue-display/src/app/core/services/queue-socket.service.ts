import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, map } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import type { QueueEntry } from '../../../../../../libs/shared/src';

// ── Payload types ─────────────────────────────────────────────────────────────

export interface QueueUpdatedPayload {
  type: 'QUEUE_UPDATED';
  shopId: string;
  data: QueueEntry[];
}

export interface NowServingPayload {
  type: 'NOW_SERVING_CHANGED';
  shopId: string;
  data: QueueEntry;
}

export interface NotificationPayload {
  id: string;
  type: 'POSITION_UPDATE' | 'NEXT_IN_LINE' | 'NOW_SERVING';
  title: string;
  message: string;
  entryId: string;
  queueId: string;
  shopId: string;
  priority: 'normal' | 'high';
  data?: Record<string, unknown>;
  timestamp: string;
}

// ── Connection state ──────────────────────────────────────────────────────────

/** Lifecycle phase of the WebSocket connection. */
export type SocketStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export interface ConnectionState {
  /** Current lifecycle phase. */
  status:    SocketStatus;
  /**
   * Current reconnect attempt number.
   * 0 while connected or on the very first connection attempt.
   */
  attempt:   number;
  /** Timestamp when this status was entered. */
  since:     Date;
  /** Last disconnect reason or error message, if any. */
  lastError: string | null;
}

// ── Backoff configuration ─────────────────────────────────────────────────────
//
// Socket.io built-in formula:
//   delay = min(base * 2^attempt * (1 + factor * rand), max)
//
// Resulting schedule (approx, ±50 % jitter):
//   attempt 1 →  1–3 s
//   attempt 2 →  2–6 s
//   attempt 3 →  4–12 s
//   attempt 4 →  8–24 s
//   attempt 5+ → 30 s  (cap)

const RECONNECT_CONFIG = {
  reconnection:         true,
  reconnectionDelay:    1_000,   // base: 1 s
  reconnectionDelayMax: 30_000,  // cap: 30 s
  reconnectionAttempts: Infinity,
  randomizationFactor:  0.5,     // ±50 % jitter — prevents thundering herd
  timeout:              10_000,  // initial connection timeout: 10 s
} as const;

// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class QueueSocketService implements OnDestroy {
  private socket: Socket | null = null;
  private currentShopId: string | null = null;

  // ── Subjects ──────────────────────────────────────────────────────────────

  private readonly queueUpdated$$ = new Subject<QueueUpdatedPayload>();
  private readonly nowServing$$   = new Subject<NowServingPayload>();
  private readonly notification$$ = new Subject<NotificationPayload>();

  private readonly connectionState$$ = new BehaviorSubject<ConnectionState>({
    status:    'disconnected',
    attempt:   0,
    since:     new Date(),
    lastError: null,
  });

  // ── Public streams ────────────────────────────────────────────────────────

  /** Full queue list — emits every time the server broadcasts QUEUE_UPDATED. */
  readonly queueUpdated$ = this.queueUpdated$$.asObservable();

  /** Currently-serving entry — emits every time NOW_SERVING_CHANGED fires. */
  readonly nowServing$ = this.nowServing$$.asObservable();

  /** Push notifications targeted at an entry (NOTIFICATION socket event). */
  readonly notification$ = this.notification$$.asObservable();

  /** Rich connection state — replays current value to every new subscriber. */
  readonly connectionState$ = this.connectionState$$.asObservable();

  /**
   * Boolean convenience stream (backward-compatible).
   * Emits true while fully connected, false otherwise.
   */
  readonly connected$ = this.connectionState$.pipe(
    map(s => s.status === 'connected'),
  );

  constructor(private readonly zone: NgZone) {}

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Connect to the /queue namespace for a specific shop.
   * Safe to call multiple times — no-ops if already connected to the same shop.
   */
  connect(shopId: string): void {
    if (this.socket && this.currentShopId === shopId) return;

    this.teardown();

    this.currentShopId = shopId;
    this.setStatus({ status: 'connecting', attempt: 0, since: new Date(), lastError: null });

    this.socket = io(`${environment.apiUrl}/queue`, {
      query: { shopId },
      transports: ['websocket', 'polling'],
      ...RECONNECT_CONFIG,
    });

    this.bindEvents();
  }

  /** Permanently disconnect and clean up all listeners. */
  disconnect(): void {
    this.teardown();
    this.setStatus({ status: 'disconnected', attempt: 0, since: new Date(), lastError: null });
  }

  /**
   * Force an immediate reconnect attempt.
   * Useful when the display page regains visibility (Page Visibility API).
   */
  forceReconnect(): void {
    if (!this.currentShopId) return;

    if (this.socket) {
      this.socket.connect();
    } else {
      const shopId = this.currentShopId;
      this.teardown();
      this.connect(shopId);
    }
  }

  /** Synchronous connected check — used by GraphQL fallback guards. */
  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnDestroy(): void {
    this.teardown();
    this.queueUpdated$$.complete();
    this.nowServing$$.complete();
    this.notification$$.complete();
    this.connectionState$$.complete();
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private teardown(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.currentShopId = null;
    }
  }

  private setStatus(state: ConnectionState): void {
    this.connectionState$$.next(state);
  }

  private bindEvents(): void {
    const s = this.socket!;

    // ── Connection lifecycle ───────────────────────────────────────────────

    s.on('connect', () => {
      this.zone.run(() =>
        this.setStatus({ status: 'connected', attempt: 0, since: new Date(), lastError: null }),
      );
    });

    s.on('disconnect', (reason: string) => {
      this.zone.run(() => {
        // 'io client disconnect' is intentional — teardown handles state
        if (reason === 'io client disconnect') return;

        this.setStatus({
          status:    'disconnected',
          attempt:   0,
          since:     new Date(),
          lastError: reason,
        });
      });
    });

    s.on('connect_error', (err: Error) => {
      this.zone.run(() => {
        const cur = this.connectionState$$.getValue();
        if (cur.status === 'connecting') {
          // First connection attempt failed
          this.setStatus({
            status:    'disconnected',
            attempt:   0,
            since:     new Date(),
            lastError: err.message,
          });
        } else {
          // Preserve attempt count, update error text
          this.setStatus({ ...cur, lastError: err.message });
        }
      });
    });

    // ── Reconnection ────────────────────────────────────────────────────────

    s.on('reconnect_attempt', (attempt: number) => {
      this.zone.run(() => {
        const cur = this.connectionState$$.getValue();
        this.setStatus({
          status:    'reconnecting',
          attempt,
          since:     new Date(),
          lastError: cur.lastError,
        });
      });
    });

    s.on('reconnect_error', (err: Error) => {
      this.zone.run(() => {
        const cur = this.connectionState$$.getValue();
        this.setStatus({ ...cur, lastError: err.message });
      });
    });

    s.on('reconnect_failed', () => {
      // Only fires when reconnectionAttempts is finite — included for completeness.
      this.zone.run(() =>
        this.setStatus({
          status:    'disconnected',
          attempt:   0,
          since:     new Date(),
          lastError: 'Max reconnection attempts reached',
        }),
      );
    });

    // ── Queue events ─────────────────────────────────────────────────────────

    s.on('QUEUE_UPDATED', (payload: QueueUpdatedPayload) => {
      this.zone.run(() => this.queueUpdated$$.next(payload));
    });

    s.on('NOW_SERVING_CHANGED', (payload: NowServingPayload) => {
      this.zone.run(() => this.nowServing$$.next(payload));
    });

    s.on('NOTIFICATION', (payload: NotificationPayload) => {
      this.zone.run(() => this.notification$$.next(payload));
    });
  }
}
