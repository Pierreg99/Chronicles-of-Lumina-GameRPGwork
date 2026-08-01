// systems/enemy-system.js — owns all enemy instances + their lifecycle.

import { SlimeBlue } from '../entities/slime-blue.js';
import { SlimeGreen } from '../entities/slime-green.js';
import { SlimePurple } from '../entities/slime-purple.js';

const INITIAL_SPAWNS = [
  [0,  8,  -6], [0, 14,  -14], [0,  16, 8],
  [1,  8,   8], [1, -14, 10], [1, 18,  18],
  [2, -4,  22], [2, 12,  24], [2, 20,  -4], [2, -18, -6],
];

export class EnemySystem {
  constructor(scene, materials, projectileSystem) {
    this.scene = scene;
    this.materials = materials;
    this.projectiles = projectileSystem;
    this.enemies = [];
  }

  spawnInitial() {
    for (const [type, x, z] of INITIAL_SPAWNS) {
      this._spawn(type, x, z);
    }
  }

  _spawn(type, x, z) {
    let e;
    if (type === 0) e = new SlimeBlue(this.scene, this.materials, x, z);
    else if (type === 1) e = new SlimeGreen(this.scene, this.materials, x, z);
    else e = new SlimePurple(this.scene, this.materials, x, z);
    this.enemies.push(e);
    return e;
  }

  kill(e) {
    e.dead = true;
    this.scene.remove(e.group);
  }

  update(dt, player) {
    for (const e of this.enemies) {
      if (e.dead) continue;
      e.update(dt, player, (from, dir) => this.projectiles.fire(from, dir));
      if (e.position.distanceTo(player.position) < 1.3) {
        // Touch damage
        const took = player.takeDamage(1);
        if (took) {
          // tiny knockback
        }
      }
    }
  }

  getMarkers() {
    return this.enemies.filter((e) => !e.dead).map((e) => ({
      x: e.position.x, z: e.position.z, color: '#' + e.spec.col.toString(16).padStart(6, '0'),
    }));
  }
}
