// systems/enemy-system.js — owns all enemy instances + their lifecycle.
// Phase R1: takes a `game` reference instead of separate engine fields.

import { EVENTS } from '../core/constants.js';
import { SlimeBlue }   from '../entities/slime-blue.js';
import { SlimeGreen }  from '../entities/slime-green.js';
import { SlimePurple } from '../entities/slime-purple.js';

const INITIAL_SPAWNS = [
  [0,  8,  -6], [0, 14,  -14], [0,  16, 8],
  [1,  8,   8], [1, -14, 10], [1, 18,  18],
  [2, -4,  22], [2, 12,  24], [2, 20,  -4], [2, -18, -6],
];

export class EnemySystem {
  constructor(game) {
    this.game = game;
    this.scene = game.scene;
    this.materials = game.materials;
    this.projectiles = game.projectiles;
    this.bus = game.bus;
    this.enemies = [];
    this.spawnSystem = null;
  }

  attachSpawnSystem(spawnSystem) { this.spawnSystem = spawnSystem; }

  spawnInitial() {
    if (this.spawnSystem && typeof this.spawnSystem.applyDailySeed === 'function') {
      const placements = this.spawnSystem.applyDailySeed();
      if (placements) {
        for (const p of placements) this._spawn(p.type, p.x, p.z);
        return;
      }
    }
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

  // R2: emit ENEMY_DIED here instead of from a main.js monkey-patch.
  kill(e) {
    if (e.dead) return;
    e.dead = true;
    this.scene.remove(e.group);
    this.bus.emit(EVENTS.ENEMY_DIED, e);
  }

  update(dt, player) {
    for (const e of this.enemies) {
      if (e.dead) continue;
      e.update(dt, player, (from, dir) => this.projectiles.fire(from, dir));
      if (e.position.distanceTo(player.position) < 1.3) {
        player.takeDamage(1, e.position);
      }
    }
  }

  getMarkers() {
    return this.enemies.filter((e) => !e.dead).map((e) => ({
      x: e.position.x, z: e.position.z, color: '#' + e.spec.col.toString(16).padStart(6, '0'),
    }));
  }
}
