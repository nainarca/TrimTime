import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import {
  QueueSocketService,
  NowServingPayload,
  NotificationPayload,
} from '../../services/queue-socket.service';
import { SoundService } from '../../services/sound.service';

export interface ToastMessage {
  type:     'NOW_SERVING' | 'NEXT_IN_LINE' | 'POSITION_UPDATE';
  title:    string;
  body:     string;
  priority: 'normal' | 'high';
}

@Component({
  standalone: true,
  selector:   'tt-notification-toast',
  imports:    [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="tt-toast"
      [class.visible]="visible"
      [class.high-priority]="current?.priority === 'high'"
      [class.now-serving]="current?.type === 'NOW_SERVING'"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="tt-toast__icon" aria-hidden="true">
        <span *ngIf="current?.type === 'NOW_SERVING'">✂</span>
        <span *ngIf="current?.type === 'NEXT_IN_LINE'">⚡</span>
        <span *ngIf="current?.type === 'POSITION_UPDATE'">📋</span>
      </div>
      <div class="tt-toast__body">
        <div class="tt-toast__title">{{ current?.title }}</div>
        <div class="tt-toast__message">{{ current?.body }}</div>
      </div>
    </div>
  `,
  styleUrls: ['./notification-toast.component.scss'],
})
export class NotificationToastComponent implements OnInit, OnDestroy {
  visible  = false;
  current: ToastMessage | null = null;

  private subs: Subscription[] = [];
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly queueSocket: QueueSocketService,
    private readonly sound:       SoundService,
    private readonly cdr:         ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // NOW_SERVING_CHANGED → triple chime + banner
    this.subs.push(
      this.queueSocket.nowServing$.subscribe((payload: NowServingPayload) => {
        this.sound.play('NOW_SERVING');
        this.show({
          type:     'NOW_SERVING',
          title:    'Now Serving',
          body:     `Ticket ${payload.data?.ticketDisplay ?? '—'}`,
          priority: 'high',
        });
      }),
    );

    // NOTIFICATION (targeted — fires only if backend sends to this room)
    this.subs.push(
      this.queueSocket.notification$.subscribe((payload: NotificationPayload) => {
        this.sound.play(payload.type);
        this.show({
          type:     payload.type,
          title:    payload.title,
          body:     payload.message,
          priority: payload.priority,
        });
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    if (this.hideTimer) clearTimeout(this.hideTimer);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private show(msg: ToastMessage): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    this.current = msg;
    this.visible = true;
    this.cdr.markForCheck();

    // High-priority ("your turn!") stays visible longer
    const duration = msg.priority === 'high' ? 6_000 : 4_000;

    this.hideTimer = setTimeout(() => {
      this.visible  = false;
      this.cdr.markForCheck();
    }, duration);
  }
}
