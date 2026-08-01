// systems/combat-system.js — resolves player sword hits against enemies + boss.
// Phase R1: takes `game`.

import * as THREE from 'three';
import { playSfx } from '../engine/audio.js';
import { state } from '../core/state.js';
import { EVENTS } from '../core/constants.js';

const ATTACK_RANGE = 2.4;
const SWING_DELAY = 0.12; // seconds before the hit connects

export class CombatSystem {
  constructor(game) {
    this.game = game;
    this.player = game.player;
    this.enemySystem = game.enemySystem;
    this.bossSystem = game.bossSystem;
    this.particles = game.particles;
    this.feedback = game.feedback;
    this.bus = game.bus;
    this.pending = [];
  }

  tryAttack() {
    if (!this.player.startSwordSwing()) return;
    playSfx('swing');
    this.pending.push({ at: state.time + SWING_DELAY, damage: this.player.atkDmg });
  }

  update(dt) {
    const now = state.time;
    for (let i = this.pending.length - 1; i >= 0; i--) {
      const p = this.pending[i];
      if (p.at > now) continue;
      const hit = this._resolve(p.damage);
      if (hit) this.bus.emit(EVENTS.COMBO_HIT, { count: hit });
      else    this.bus.emit(EVENTS.COMBO_BREAK);
      this.pending.splice(i, 1);
    }
  }

  _resolve(damage) {
    const ppos = this.player.position;
    let hitCount = 0;
    let hitBoss = false;
    for (const e of this.enemySystem.enemies) {
      if (e.dead) continue;
      const d = e.position.distanceTo(ppos);
      if (d < ATTACK_RANGE) {
        const dead = e.damage(damage);
        playSfx('hit');
        e.kb.subVectors(e.position, ppos).setY(0).normalize().multiplyScalar(6);
        this.particles.burst(e.position, '#ffffff', 8);
        if (dead) this.enemySystem.kill(e);
        hitCount++;
      }
    }
    if (this.bossSystem.boss && this.bossSystem.boss.active && !this.bossSystem.boss.dead) {
      const d = this.bossSystem.boss.position.distanceTo(ppos);
      if (d < 3.2) {
        this.bossSystem.damage(damage);
        playSfx('hit');
        this.particles.burst(this.bossSystem.boss.position, '#d06fd6', 10);
        hitBoss = true;
        hitCount++;
      }
    }
    if (this.feedback) {
      if (hitBoss)           { this.feedback.hitstopBig();   this.feedback.shakeMedium(); }
      else if (hitCount > 0) { this.feedback.hitstopSmall(); this.feedback.shakeSmall(); }
    }
    return hitCount;
  }
}
