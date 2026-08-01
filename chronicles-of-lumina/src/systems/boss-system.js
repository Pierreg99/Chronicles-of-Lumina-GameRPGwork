// systems/boss-system.js — wraps BossNebelkoloss with spawn, AI tick, and death.
// Phase R1: takes `game`. R2: emits BOSS_DAMAGE / BOSS_DIED directly.

import * as THREE from 'three';
import { EVENTS } from '../core/constants.js';
import { BossNebelkoloss } from '../entities/boss-nebelkoloss.js';
import { playSfx } from '../engine/audio.js';

const BOSS_SPAWN_POS = new THREE.Vector3(4, 0, 20);

export class BossSystem {
  constructor(game) {
    this.game = game;
    this.scene = game.scene;
    this.materials = game.materials;
    this.bus = game.bus;
    this.boss = new BossNebelkoloss(game.scene, game.materials);
    this.projectiles = game.projectiles;
    this.particles = game.particles;
    this.feedback = game.feedback;
  }

  spawn() {
    this.boss.group.position.copy(BOSS_SPAWN_POS);
    this.boss.hp = this.boss.maxHp;
    this.boss.dead = false;
    this.boss.active = true;
    this.scene.add(this.boss.group);
    playSfx('shrine');
  }

  // R2: emit BOSS_DAMAGE / BOSS_DIED here instead of from a main.js monkey-patch.
  damage(n) {
    const dead = this.boss.damage(n);
    if (dead) {
      this.bus.emit(EVENTS.BOSS_DIED);
    } else {
      this.bus.emit(EVENTS.BOSS_DAMAGE, { hp: this.boss.hp, maxHp: this.boss.maxHp });
    }
    return dead;
  }

  update(dt, player) {
    if (!this.boss.active || this.boss.dead) return;
    const result = this.boss.update(dt, player);
    if (result && result.shots) {
      this.projectiles.fireFan(this.boss.position, player.position);
      this.feedback && this.feedback.shakeSmall();
    }
    if (result && result.slam) {
      this.projectiles.spawnSlamRing(this.boss.position);
      this.particles.burst(this.boss.position, '#b06fd6', 20);
      if (this.boss.position.distanceTo(player.position) < 4) {
        player.takeDamage(1, this.boss.position);
      }
      if (this.feedback) {
        this.feedback.shakeBig();
        this.feedback.slowmoSlam();
        this.feedback.hitstopBig();
        const dir = new THREE.Vector3()
          .subVectors(player.position, this.boss.position)
          .setY(0)
          .normalize()
          .multiplyScalar(0.7)
          .add(new THREE.Vector3(0, 0.4, 0));
        this.feedback.cameraKick(dir, 0.8, 0.35);
      }
    }
    if (result && result.melee) {
      player.takeDamage(1, this.boss.position);
      this.feedback && this.feedback.shakeMedium();
    }
  }
}
