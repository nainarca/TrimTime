import { Injectable, OnDestroy } from '@angular/core';
import { QueueSoundPlayer, QueueSoundEvent } from '@trimtime/shared-utils';

/**
 * Angular wrapper around QueueSoundPlayer for the queue-display kiosk app.
 *
 * The kiosk is a permanent display screen — a single AudioContext is created
 * once on first user interaction (admin setting up the kiosk) and reused for
 * the lifetime of the session.
 */
@Injectable({ providedIn: 'root' })
export class SoundService implements OnDestroy {
  private readonly player = new QueueSoundPlayer();

  play(event: QueueSoundEvent): void {
    this.player.play(event);
  }

  setEnabled(value: boolean): void {
    this.player.setEnabled(value);
  }

  get isEnabled(): boolean {
    return this.player.isEnabled;
  }

  ngOnDestroy(): void {
    this.player.destroy();
  }
}
