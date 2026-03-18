import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

// ── Payload types (mirror backend WS_EVENTS payloads) ────────────────────────

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

export interface QueueEntry {
  id: string;
  ticketDisplay: string;
  status: string;
  position: number;
  estimatedWaitMins: number | null;
  entryType: string;
  joinedAt: string;
  barberId?: string | null;
  customerId?: string | null;
  guestName?: string | null;
  guestPhone?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class QueueSocketService implements OnDestroy {
  private socket: Socket | null = null;
  private currentShopId: string | null = null;

  private readonly queueUpdated$$ = new Subject<QueueUpdatedPayload>();
  private readonly nowServing$$    = new Subject<NowServingPayload>();
  private readonly connected$$     = new Subject<boolean>();

  /** Emits the full queue list whenever the server broadcasts QUEUE_UPDATED */
  readonly queueUpdated$  = this.queueUpdated$$.asObservable();

  /** Emits the currently-serving entry whenever NOW_SERVING_CHANGED fires */
  readonly nowServing$    = this.nowServing$$.asObservable();

  /** Emits true when connected, false when disconnected / error */
  readonly connected$     = this.connected$$.asObservable();

  constructor(private readonly zone: NgZone) {}

  // ── Connection lifecycle ────────────────────────────────────────────────────

  /**
   * Connect to the /queue namespace for a specific shop.
   * Safe to call multiple times — no-ops if already connected to the same shop.
   */
  connect(shopId: string): void {
    if (this.socket && this.currentShopId === shopId) return;

    // Tear down previous connection if switching shops
    this.disconnect();

    const url = `${environment.apiUrl}/queue`;
    this.currentShopId = shopId;

    this.socket = io(url, {
      query:      { shopId },
      transports: ['websocket', 'polling'],
      reconnection:         true,
      reconnectionDelay:    2_000,
      reconnectionAttempts: Infinity,
    });

    this.socket.on('connect', () => {
      this.zone.run(() => this.connected$$.next(true));
    });

    this.socket.on('disconnect', () => {
      this.zone.run(() => this.connected$$.next(false));
    });

    this.socket.on('connect_error', () => {
      this.zone.run(() => this.connected$$.next(false));
    });

    this.socket.on('QUEUE_UPDATED', (payload: QueueUpdatedPayload) => {
      this.zone.run(() => this.queueUpdated$$.next(payload));
    });

    this.socket.on('NOW_SERVING_CHANGED', (payload: NowServingPayload) => {
      this.zone.run(() => this.nowServing$$.next(payload));
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.currentShopId = null;
    }
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.queueUpdated$$.complete();
    this.nowServing$$.complete();
    this.connected$$.complete();
  }
}
