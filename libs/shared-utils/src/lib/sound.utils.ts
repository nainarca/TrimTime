// ═══════════════════════════════════════════════════════════════════════════
//  QueueSoundPlayer — pure TypeScript, no Angular dependencies
//
//  Responsibilities:
//    • Build and schedule Web Audio API tones per sound event type
//    • Enforce per-event cooldowns to prevent notification spam
//    • Unlock AudioContext lazily on the first user gesture (browser policy)
//    • Gracefully no-op in SSR / restricted environments (no window/AudioContext)
//
//  Usage in Angular:
//    Wrap with a thin @Injectable that calls destroy() in ngOnDestroy().
//    See SoundService in each app's core/services/.
// ═══════════════════════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────────────────────

export type QueueSoundEvent =
  | 'POSITION_UPDATE'  // soft blip — someone's position moved
  | 'NEXT_IN_LINE'     // double chime — customer is #1, about to be called
  | 'NOW_SERVING';     // triple ascending chime — customer is now being served

interface ToneConfig {
  /** Oscillator frequency in Hz */
  frequency: number;
  /** Duration of this tone in milliseconds */
  duration: number;
  /** Peak amplitude 0–1 */
  volume: number;
  /** Oscillator waveform */
  type: OscillatorType;
}

// ── Sound profiles ───────────────────────────────────────────────────────────

const SOUND_PROFILE: Record<QueueSoundEvent, ToneConfig[]> = {
  /**
   * POSITION_UPDATE — a single, very soft blip.
   * Must be unobtrusive: customers move up constantly during busy sessions.
   */
  POSITION_UPDATE: [
    { frequency: 660, duration: 110, volume: 0.18, type: 'sine' },
  ],

  /**
   * NEXT_IN_LINE — two ascending tones.
   * Noticeable but not startling — "heads up, you're next".
   */
  NEXT_IN_LINE: [
    { frequency: 880,   duration: 140, volume: 0.40, type: 'sine' },
    { frequency: 1_100, duration: 190, volume: 0.40, type: 'sine' },
  ],

  /**
   * NOW_SERVING — three ascending tones, brightest sound.
   * Unambiguous: "your turn, walk up now".
   */
  NOW_SERVING: [
    { frequency: 784,   duration: 130, volume: 0.55, type: 'sine' },
    { frequency: 988,   duration: 130, volume: 0.55, type: 'sine' },
    { frequency: 1_175, duration: 260, volume: 0.55, type: 'sine' },
  ],
};

// ── Anti-spam cooldowns ───────────────────────────────────────────────────────
//
// Each event type is rate-limited independently.
// A sound is dropped (not queued) if the previous play of the same type
// completed less than COOLDOWN_MS[event] milliseconds ago.

const COOLDOWN_MS: Record<QueueSoundEvent, number> = {
  POSITION_UPDATE: 5_000, // no more than once per 5 s — position changes are frequent
  NEXT_IN_LINE:    3_000, // practical guard; backend Redis dedup already limits this
  NOW_SERVING:     2_000, // two rapid SERVING transitions are rare but possible
};

// Gap of silence inserted between sequential tones in a multi-tone sequence
const INTER_TONE_GAP_S = 0.04; // 40 ms

// ─────────────────────────────────────────────────────────────────────────────

export class QueueSoundPlayer {
  private ctx:     AudioContext | null = null;
  private enabled  = true;

  /** Timestamp (ms since epoch) of the last play per event type. */
  private readonly lastPlayed = new Map<QueueSoundEvent, number>();

  /** Bound reference kept so we can remove the listener in destroy(). */
  private unlockListener: (() => void) | null = null;

  constructor() {
    this.attachUnlockListener();
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Request playback of a sound event.
   *
   * The call is a no-op when:
   *   - Sound is disabled via setEnabled(false)
   *   - The same event fired within its cooldown window
   *   - AudioContext is unavailable (SSR, strict browser policy)
   *
   * The cooldown timestamp is recorded immediately to prevent a burst of
   * concurrent calls (e.g. rapid socket reconnect) from stacking up.
   */
  play(event: QueueSoundEvent): void {
    if (!this.enabled)      return;
    if (!this.isCooldownExpired(event)) return;

    // Record before async work to guard against concurrent calls
    this.lastPlayed.set(event, Date.now());

    this.scheduleTones(SOUND_PROFILE[event]).catch(() => {
      // AudioContext blocked before the first user gesture.
      // attachUnlockListener() will resume it on next pointer/key event.
    });
  }

  /** Enable or disable all sound output (persists until changed again). */
  setEnabled(value: boolean): void {
    this.enabled = value;
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Release AudioContext and remove DOM event listeners.
   * Call this in the Angular service's ngOnDestroy().
   */
  destroy(): void {
    if (this.unlockListener) {
      document.removeEventListener('pointerdown', this.unlockListener);
      document.removeEventListener('keydown',     this.unlockListener);
      this.unlockListener = null;
    }
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private isCooldownExpired(event: QueueSoundEvent): boolean {
    const last = this.lastPlayed.get(event) ?? 0;
    return Date.now() - last >= COOLDOWN_MS[event];
  }

  /**
   * Register a one-shot listener on the first user gesture.
   *
   * Modern browsers require a user-initiated event before AudioContext can
   * produce sound.  We pre-warm (create + resume) the context as soon as the
   * user first interacts with the page, so that subsequent play() calls are
   * instant with no perceptible latency.
   */
  private attachUnlockListener(): void {
    // Guard: non-browser environments (SSR, Node test runner)
    if (typeof document === 'undefined') return;

    this.unlockListener = () => {
      this.ensureContext();
      if (this.ctx?.state === 'suspended') {
        void this.ctx.resume();
      }
      // Self-removing after first fire
      document.removeEventListener('pointerdown', this.unlockListener!);
      document.removeEventListener('keydown',     this.unlockListener!);
      this.unlockListener = null;
    };

    document.addEventListener('pointerdown', this.unlockListener, { once: true });
    document.addEventListener('keydown',     this.unlockListener, { once: true });
  }

  private ensureContext(): boolean {
    if (this.ctx) return true;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.ctx = new (window.AudioContext ?? (window as any).webkitAudioContext)();
      return true;
    } catch {
      return false; // AudioContext not available in this environment
    }
  }

  private async scheduleTones(tones: ToneConfig[]): Promise<void> {
    if (!this.ensureContext()) return;
    const ctx = this.ctx!;

    if (ctx.state === 'suspended') {
      await ctx.resume(); // throws if user hasn't interacted yet
    }

    let t = ctx.currentTime;

    for (const tone of tones) {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = tone.type;
      osc.frequency.setValueAtTime(tone.frequency, t);

      // Attack: 10 ms linear ramp to peak volume
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(tone.volume, t + 0.01);
      // Decay: exponential ramp to near-silence by end of tone
      gain.gain.exponentialRampToValueAtTime(0.001, t + tone.duration / 1_000);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + tone.duration / 1_000 + 0.05);

      t += tone.duration / 1_000 + INTER_TONE_GAP_S;
    }
  }
}
