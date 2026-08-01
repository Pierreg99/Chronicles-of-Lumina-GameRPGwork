// loop.js — fixed-timestep game loop. Render is interpolated via three.js auto,
// but we tick gameplay in stable dt slices for determinism.

import { now } from '../utils/time.js';
import { state } from './state.js';

const FIXED_DT = 1 / 60;
const MAX_STEPS = 5;

export class Loop {
  constructor({ update, render, onPauseChange }) {
    this.update = update;          // (dt, t) => void
    this.render = render;          // (alpha) => void
    this.onPauseChange = onPauseChange || (() => {});
    this.last = 0;
    this.acc = 0;
    this.running = false;
    this.paused = false;
    this._tick = this._tick.bind(this);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = now();
    requestAnimationFrame(this._tick);
  }

  stop() {
    this.running = false;
  }

  setPaused(p) {
    if (this.paused === p) return;
    this.paused = p;
    this.onPauseChange(p);
    if (p) this.last = now();
  }

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

export const DT = FIXED_DT;
