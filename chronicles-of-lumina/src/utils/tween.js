// utils/tween.js — micro tween library. No deps, single-file.
//
//   const t = tween({ from: 0, to: 1, duration: 0.4, ease: 'easeOutCubic', onUpdate: v => …, onComplete: () => … });
//   tweenManager.add(t);
//   tweenManager.update(dt);
//
// Easings: linear, easeInQuad, easeOutQuad, easeInOutQuad, easeOutCubic, easeOutBack, easeOutElastic.
// Use `tween.to(...)` to retarget.

const EASINGS = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeOutCubic: (t) => --t * t * t + 1,
  easeOutBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeOutElastic: (t) => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1;
  },
};

export class Tween {
  constructor({ from = 0, to = 1, duration = 0.4, ease = 'easeOutCubic', onUpdate, onComplete }) {
    this.from = from;
    this.to = to;
    this.duration = Math.max(0.0001, duration);
    this.ease = EASINGS[ease] || EASINGS.easeOutCubic;
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
    this.elapsed = 0;
    this.done = false;
  }

  retarget(to, duration) {
    this.from = this.value;
    this.to = to;
    if (duration != null) this.duration = Math.max(0.0001, duration);
    this.elapsed = 0;
    this.done = false;
    return this;
  }

  cancel() { this.done = true; }

  step(dt) {
    if (this.done) return;
    this.elapsed += dt;
    const t = Math.min(1, this.elapsed / this.duration);
    const eased = this.ease(t);
    this.value = this.from + (this.to - this.from) * eased;
    this.onUpdate && this.onUpdate(this.value, t);
    if (t >= 1) {
      this.done = true;
      this.onComplete && this.onComplete();
    }
  }
}

export class TweenManager {
  constructor() { this.tweens = []; }

  add(t) { this.tweens.push(t); return t; }
  remove(t) { this.tweens = this.tweens.filter((x) => x !== t); }

  update(dt) {
    for (let i = this.tweens.length - 1; i >= 0; i--) {
      const t = this.tweens[i];
      t.step(dt);
      if (t.done) this.tweens.splice(i, 1);
    }
  }

  clear() { this.tweens.length = 0; }
}

export { EASINGS };
export const tween = (opts) => new Tween(opts);
