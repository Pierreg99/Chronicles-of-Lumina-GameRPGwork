// systems/boss-system.js — wraps BossNebelkoloss with spawn, AI tick, and death.

import * as THREE from 'three';
import { BossNebelkoloss } from '../entities/boss-nebelkoloss.js';
import { playSfx } from '../engine/audio.js';

const BOSS_SPAWN_POS = new THREE.Vector3(4, 0, 20);

export class BossSystem {
  constructor(scene, materials, projectileSystem, particleSystem, feedback) {
    this.scene = scene;
    this.boss = new BossNebelkoloss(scene, materials);
    this.projectiles = projectileSystem;
    this.particles = particleSystem;
    this.feedback = feedback;
  }

  spawn() {
    this.boss.group.position.copy(BOSS_SPAWN_POS);
    this.boss.hp = this.boss.maxHp;
    this.boss.dead = false;
    this.boss.active = true;
    this.scene.add(this.boss.group);
    playSfx('shrine');
  }

  damage(n) {
    return this.boss.damage(n);
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
      // damage if close
      if (this.boss.position.distanceTo(player.position) < 4) {
        player.takeDamage(1);
      }
      // Phase 1 feedback: bigger shake, slowmo, hit-stop
      if (this.feedback) {
        this.feedback.shakeBig();
        this.feedback.slowmoSlam();
        this.feedback.hitstopBig();
      }
    }
    if (result && result.melee) {
      player.takeDamage(1);
      this.feedback && this.feedback.shakeMedium();
    }
  }
}
