import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

// ── Shared types ──────────────────────────────────────────────────────────────

export interface QueueEntry {
  id: string;
  shopId: string;
  ticketDisplay: string;
  status: string;
  position: number;
  estimatedWaitMins?: number | null;
  joinedAt: string;
  guestName?: string | null;
  guestPhone?: string | null;
}

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
  shopId: string;
  priority: 'normal' | 'high';
  data?: Record<string, unknown>;
  timestamp: string;
}

// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class QueueSocketService implements OnDestroy {
  private socket: Socket | null = null;
  private currentShopId: string | null = null;

  private readonly queueUpdated$$  = new Subject<QueueUpdatedPayload>();
  private readonly nowServing$$    = new Subject<NowServingPayload>();
  private readonly notification$$  = new Subject<NotificationPayload>();
  private readonly connected$$     = new Subject<boolean>();

  readonly queueUpdated$  = this.queueUpdated$$.asObservable();
  readonly nowServing$    = this.nowServing$$.asObservable();
  readonly notification$  = this.notification$$.asObservable();
  readonly connected$     = this.connected$$.asObservable();

  constructor(private readonly zone: NgZone) {}

  connect(shopId: string): void {
    if (this.socket && this.currentShopId === shopId) return;
    this.disconnect();

    this.currentShopId = shopId;
    this.socket = io(`${environment.apiUrl}/queue`, {
      query:                { shopId },
      transports:           ['websocket', 'polling'],
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

    this.socket.on('QUEUE_UPDATED', (p: QueueUpdatedPayload) => {
      this.zone.run(() => this.queueUpdated$$.next(p));
    });

    this.socket.on('NOW_SERVING_CHANGED', (p: NowServingPayload) => {
      this.zone.run(() => this.nowServing$$.next(p));
    });

    this.socket.on('NOTIFICATION', (p: NotificationPayload) => {
      this.zone.run(() => this.notification$$.next(p));
    });

    // Re-join entry room after reconnect (socket re-assigns a new socket.id)
    this.socket.on('connect', () => {
      if (this.currentEntryId) {
        this.socket?.emit('JOIN_ENTRY', { entryId: this.currentEntryId });
      }
    });
  }

  // ── Personal entry room ─────────────────────────────────────────────────────

  private currentEntryId: string | null = null;

  joinEntry(entryId: string): void {
    this.currentEntryId = entryId;
    this.socket?.emit('JOIN_ENTRY', { entryId });
  }

  leaveEntry(entryId: string): void {
    if (this.currentEntryId === entryId) this.currentEntryId = null;
    this.socket?.emit('LEAVE_ENTRY', { entryId });
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
    this.notification$$.complete();
    this.connected$$.complete();
  }
}
