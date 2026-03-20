import { Injectable, OnDestroy } from '@angular/core';
import { QueueSoundPlayer, QueueSoundEvent } from '@trimtime/shared-utils';

/**
 * Angular wrapper around QueueSoundPlayer.
 *
 * Provided at root so a single AudioContext is shared across the whole
 * admin-dashboard, and destroy() is called once when the app shuts down.
 *
 * Consumers call play(event) — all cooldown / unlock / spam-guard logic
 * lives in QueueSoundPlayer and does not need to be repeated here.
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
