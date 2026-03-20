import { Injectable, OnDestroy } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { QueueSocketService } from './queue-socket.service';
import { SoundService } from './sound.service';

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private readonly subs: Subscription[] = [];

  constructor(
    private readonly messageService: MessageService,
    private readonly queueSocket:    QueueSocketService,
    private readonly sound:          SoundService,
  ) {
    this.bindSocketEvents();
  }

  // ── Manual notification helpers ─────────────────────────────────────────────

  success(summary: string, detail?: string): void {
    this.messageService.add({ severity: 'success', summary, detail, life: 4_000 });
  }

  error(summary: string, detail?: string): void {
    this.messageService.add({ severity: 'error', summary, detail, life: 6_000 });
  }

  warn(summary: string, detail?: string): void {
    this.messageService.add({ severity: 'warn', summary, detail, life: 5_000 });
  }

  info(summary: string, detail?: string): void {
    this.messageService.add({ severity: 'info', summary, detail, life: 4_000 });
  }

  // ── Socket-driven toasts + sounds ──────────────────────────────────────────

  /**
   * Bind once (in constructor) to the socket streams.
   * Subscriptions are active for the life of the service (singleton).
   *
   * NOW_SERVING_CHANGED → triple chime + success toast (barber called a customer)
   * NOTIFICATION        → typed tone + typed toast (targeted entry notification)
   */
  private bindSocketEvents(): void {
    // ── Now serving ─────────────────────────────────────────────────────────
    this.subs.push(
      this.queueSocket.nowServing$.subscribe((payload) => {
        const ticket = payload.data?.ticketDisplay ?? '—';

        // Sound: triple ascending chime
        this.sound.play('NOW_SERVING');

        this.messageService.add({
          severity: 'success',
          summary:  'Now Serving',
          detail:   `Ticket ${ticket} is now being served`,
          life:     5_000,
          icon:     'pi pi-scissors',
        });
      }),
    );

    // ── Targeted entry notification ──────────────────────────────────────────
    this.subs.push(
      this.queueSocket.notification$.subscribe((payload) => {
        // Sound: map notification type → tone
        this.sound.play(payload.type);

        const severity = this.mapSeverity(payload.type, payload.priority);
        this.messageService.add({
          severity,
          summary: payload.title,
          detail:  payload.message,
          life:    payload.priority === 'high' ? 8_000 : 5_000,
        });
      }),
    );
  }

  private mapSeverity(
    type: 'POSITION_UPDATE' | 'NEXT_IN_LINE' | 'NOW_SERVING',
    priority: 'normal' | 'high',
  ): string {
    if (type === 'NOW_SERVING')   return 'success';
    if (type === 'NEXT_IN_LINE')  return 'warn';
    if (priority === 'high')      return 'warn';
    return 'info';
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
