export type QueueSoundEvent = 'POSITION_UPDATE' | 'NEXT_IN_LINE' | 'NOW_SERVING';
export declare class QueueSoundPlayer {
    private ctx;
    private enabled;
    /** Timestamp (ms since epoch) of the last play per event type. */
    private readonly lastPlayed;
    /** Bound reference kept so we can remove the listener in destroy(). */
    private unlockListener;
    constructor();
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
    play(event: QueueSoundEvent): void;
    /** Enable or disable all sound output (persists until changed again). */
    setEnabled(value: boolean): void;
    get isEnabled(): boolean;
    /**
     * Release AudioContext and remove DOM event listeners.
     * Call this in the Angular service's ngOnDestroy().
     */
    destroy(): void;
    private isCooldownExpired;
    /**
     * Register a one-shot listener on the first user gesture.
     *
     * Modern browsers require a user-initiated event before AudioContext can
     * produce sound.  We pre-warm (create + resume) the context as soon as the
     * user first interacts with the page, so that subsequent play() calls are
     * instant with no perceptible latency.
     */
    private attachUnlockListener;
    private ensureContext;
    private scheduleTones;
}
