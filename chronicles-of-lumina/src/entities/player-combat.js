// entities/player-combat.js — wraps invuln / damage / heal state.
//
// Invulnerability now uses a tween-driven blink on the player's body material
// instead of toggling `group.visible` in player.update. This gives a smoother,
// properly-damped fade that scales with the remaining i-frames.

import * as THREE from 'three';
import { tween } from '../utils/tween.js';

export class PlayerCombat {
  constructor(player) {
    this.player = player;
    this.body = player.group.children[0]; // first mesh = body capsule
    this._blinkTween = null;
  }

  setInvulnerable(duration = 1.0) {
    this.player.inv = duration;
    const body = this.body;
    if (!body.material.emissive) {
      body.material.emissive = new THREE.Color(0, 0, 0);
    }

    if (this._blinkTween) this._blinkTween.cancel();
    this._blinkTween = tween({
      from: 1, to: 0, duration, ease: 'easeOutQuad',
      onUpdate: (v) => {
        // Emissive intensity oscillates as the tween decays; creates a pulse.
        body.material.emissive.setRGB(1 * v, 0.4 * v, 0.4 * v);
        body.material.emissiveIntensity = 0.3 + v * 0.7;
      },
      onComplete: () => {
        body.material.emissive.setRGB(0, 0, 0);
        body.material.emissiveIntensity = 0;
        this._blinkTween = null;
      },
    });
  }

  takeDamage(dmg = 1) {
    if (this.player.inv > 0 || this.player.rolling > 0) return false;
    this.player.hp -= dmg;
    this.setInvulnerable(1.0);
    return true;
  }

  update(dt) {
    if (this._blinkTween) this._blinkTween.step(dt);
  }
}
