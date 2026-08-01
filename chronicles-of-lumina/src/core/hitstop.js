// core/hitstop.js — global hit-stop state. A short, intentional freeze of the
// game loop that makes impacts feel weighty. The renderer still runs (so the
// screen doesn't go black), but game-logic updates are skipped.
//
// API:
//   const hitstop = new HitStop();
//   hitstop.freeze(0.08);          // freeze for 80ms
//   if (hitstop.active) { ... }    // skip gameplay update
//   hitstop.update(dt);            // called from main loop every frame

/**
 * Global hit-stop state — a short intentional freeze for impact weight.
 * Skips gameplay updates while {@link HitStop#active} is true; the renderer
 * keeps drawing so the screen doesn't go black.
 */
export class HitStop {
  constructor() {
    /** @type {number} seconds remaining until the freeze ends. */
    this.remaining = 0;
  }

  /**
   * Extend the freeze to at least `seconds` more. Doesn't stack — if a longer
   * freeze is already active, the shorter request is ignored.
   * @param {number} seconds
   * @returns {void}
   */
  freeze(seconds) {
    this.remaining = Math.max(this.remaining, seconds);
  }

  /** @returns {boolean} true while gameplay updates should be skipped. */
  get active() { return this.remaining > 0; }

  /**
   * Tick the timer down. Call once per fixed-step from the game loop.
   * @param {number} dt — delta-time in seconds (typically 1/60).
   * @returns {void}
   */
  update(dt) {
    if (this.remaining > 0) this.remaining = Math.max(0, this.remaining - dt);
  }
}
