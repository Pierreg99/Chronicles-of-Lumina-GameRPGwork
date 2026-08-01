// core/hitstop.js — global hit-stop state. A short, intentional freeze of the
// game loop that makes impacts feel weighty. The renderer still runs (so the
// screen doesn't go black), but game-logic updates are skipped.
//
// API:
//   const hitstop = new HitStop();
//   hitstop.freeze(0.08);          // freeze for 80ms
//   if (hitstop.active) { ... }    // skip gameplay update
//   hitstop.update(dt);            // called from main loop every frame

export class HitStop {
  constructor() {
    this.remaining = 0;
  }

  freeze(seconds) {
    // Don't stack — take the max of the two so consecutive hits extend the freeze.
    this.remaining = Math.max(this.remaining, seconds);
  }

  get active() { return this.remaining > 0; }

  update(dt) {
    if (this.remaining > 0) this.remaining = Math.max(0, this.remaining - dt);
  }
}
