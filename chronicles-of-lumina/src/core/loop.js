// loop.js — fixed-timestep game loop. Render is interpolated via three.js auto,
// but we tick gameplay in stable dt slices for determinism.

import { now } from '../utils/time.js';
import { state } from './state.js';

/** @type {number} fixed timestep in seconds (60 Hz). */
const FIXED_DT = 1 / 60;

/** @type {number} cap on catch-up steps per frame to avoid spiral-of-death. */
const MAX_STEPS = 5;

/**
 * @typedef {object} LoopHooks
 * @property {(dt: number, t: number) => void} update  called once per fixed step.
 * @property {(alpha: number) => void} render  called once per rAF with [0..1) interpolation.
 * @property {(paused: boolean) => void} [onPauseChange]  notified on every pause toggle.
 */

/**
 * Fixed-timestep game loop. Drives the simulation in stable dt slices
 * regardless of monitor refresh rate; rendering happens every rAF tick.
 */
export class Loop {
  /**
   * @param {LoopHooks} hooks
   */
  constructor({ update, render, onPauseChange }) {
    /** @type {(dt: number, t: number) => void} */
    this.update = update;
    /** @type {(alpha: number) => void} */
    this.render = render;
    /** @type {(paused: boolean) => void} */
    this.onPauseChange = onPauseChange || (() => {});
    this.last = 0;
    this.acc = 0;
    this.running = false;
    this.paused = false;
    this._tick = this._tick.bind(this);
  }

  /** Start the rAF loop. No-op if already running. */
  start() {
    if (this.running) return;
    this.running = true;
    this.last = now();
    requestAnimationFrame(this._tick);
  }

  /** Stop the rAF loop. */
  stop() {
    this.running = false;
  }

  /**
   * Toggle pause. While paused, the simulation doesn't advance but rendering
   * can still happen if you drive it elsewhere.
   * @param {boolean} p
   * @returns {void}
   */
  setPaused(p) {
    if (this.paused === p) return;
    this.paused = p;
    this.onPauseChange(p);
    if (p) this.last = now();
  }

  /** @private rAF callback — runs the fixed-step accumulator + render. */
  _tick(t) {
    if (!this.running) return;
    const frameTime = (t - this.last) / 1000;
    this.last = t;

    if (!this.paused) {
      this.acc += Math.min(frameTime, 0.1); // clamp huge frames
      let steps = 0;
      while (this.acc >= FIXED_DT && steps < MAX_STEPS) {
        state.time += FIXED_DT;
        this.update(FIXED_DT, state.time);
        this.acc -= FIXED_DT;
        steps++;
      }
      const alpha = this.acc / FIXED_DT;
      this.render(alpha);
    }

    requestAnimationFrame(this._tick);
  }
}

/** @type {number} exported fixed-dt constant for external consumers (1/60 s). */
export const DT = FIXED_DT;
