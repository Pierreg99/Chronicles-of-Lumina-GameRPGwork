// systems/combat-system.js — resolves player sword hits against enemies + boss.

import * as THREE from 'three';
import { playSfx } from '../engine/audio.js';
import { state } from '../core/state.js';

const ATTACK_RANGE = 2.4;
const SWING_DELAY = 0.12; // seconds before the hit connects

export class CombatSystem {
  constructor({ player, enemySystem, bossSystem, particleSystem, feedback }) {
    this.player = player;
    this.enemySystem = enemySystem;
    this.bossSystem = bossSystem;
    this.particles = particleSystem;
    this.feedback = feedback; // optional; if present we trigger hit-stop + shake
    this.pending = []; // { at: time, damage: number }
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
      this._resolve(p.damage);
      this.pending.splice(i, 1);
    }
  }

  _resolve(damage) {
    const ppos = this.player.position;
    let hitSomething = false;
    let hitBoss = false;
    // Enemies
    for (const e of this.enemySystem.enemies) {
      if (e.dead) continue;
      const d = e.position.distanceTo(ppos);
      if (d < ATTACK_RANGE) {
        const dead = e.damage(damage);
        playSfx('hit');
        e.kb.subVectors(e.position, ppos).setY(0).normalize().multiplyScalar(6);
        this.particles.burst(e.position, '#ffffff', 8);
        if (dead) this.enemySystem.kill(e);
        hitSomething = true;
      }
    }
    // Boss
    if (this.bossSystem.boss && this.bossSystem.boss.active && !this.bossSystem.boss.dead) {
      const d = this.bossSystem.boss.position.distanceTo(ppos);
      if (d < 3.2) {
        this.bossSystem.damage(damage);
        playSfx('hit');
        this.particles.burst(this.bossSystem.boss.position, '#d06fd6', 10);
        hitBoss = true;
      }
    }
    // Feedback (Phase 1)
    if (this.feedback) {
      if (hitBoss)      { this.feedback.hitstopBig();   this.feedback.shakeMedium(); }
      else if (hitSomething) { this.feedback.hitstopSmall(); this.feedback.shakeSmall(); }
    }
  }
}
