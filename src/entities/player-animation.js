// entities/player-animation.js — sword swing with anticipation + follow-through.
// Uses utils/tween.js for clean, cancellable, retargetable animation.
//
// The animation has three phases:
//   1. Anticipation (0–0.08s)   — sword pulls BACK so the hit reads as intentional
//   2. Strike       (0.08–0.20s) — sword whips FORWARD
//   3. Recovery     (0.20–0.32s) — sword returns to rest pose

import { Tween, tween } from '../utils/tween.js';

const SWORD_REST = { x: 0.65, y: 1.3, z: 0 };
const SWORD_REST_ROT = { z: -0.4 };

export class PlayerAnimation {
  constructor(player) {
    this.player = player;
    this.sword = player.sword;
    this.swingTween = null;
    this._driveTween = null;
  }

  // Call when player.startSwordSwing() returns true. Returns the hit-time in
  // seconds-from-now (so combat can schedule a damage event).
  startSwing() {
    if (this.swingTween) this.swingTween.cancel();
    this.swingTween = tween({
      from: 0, to: 1, duration: 0.32, ease: 'linear',
      onUpdate: (v) => this._applySwing(v),
      onComplete: () => { this.swingTween = null; this._resetSword(); },
    });
    return 0.12; // hit connects at 0.12s into the swing
  }

  _applySwing(v) {
    // Phase 1: 0.00–0.25  (anticipation + strike)
    // Phase 2: 0.25–1.00  (recovery)
    if (v < 0.25) {
      // Anticipation: pull back. Strike: whip forward.
      const t = v / 0.25;
      // Pull back at first, then snap forward
      const back = Math.sin(t * Math.PI) * 0.6;  // 0 → 0.6 → 0
      this.sword.rotation.z = SWORD_REST_ROT.z - 0.5 - back;
      this.sword.position.x = SWORD_REST.x - 0.25 - back * 0.3;
    } else {
      // Recovery
      const t = (v - 0.25) / 0.75;
      const e = 1 - Math.pow(1 - t, 2); // easeOutQuad
      this.sword.rotation.z = SWORD_REST_ROT.z - 0.5 * (1 - e) + 0.4 * e;
      this.sword.position.x = SWORD_REST.x - 0.25 * (1 - e);
    }
  }

  _resetSword() {
    this.sword.rotation.z = SWORD_REST_ROT.z;
    this.sword.position.set(SWORD_REST.x, SWORD_REST.y, SWORD_REST.z);
  }

  // Drive a tween externally (e.g., dodge spin). Optional extension point.
  drive(tweenObj) {
    if (this._driveTween) this._driveTween.cancel();
    this._driveTween = tweenObj;
  }

  update(dt) {
    if (this.swingTween) this.swingTween.step(dt);
    if (this._driveTween) {
      this._driveTween.step(dt);
      if (this._driveTween.done) this._driveTween = null;
    }
  }
}
