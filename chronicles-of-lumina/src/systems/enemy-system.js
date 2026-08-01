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

/**
 * @typedef {import('../core/game.js').Game} Game
 * @typedef {import('./spawn-system.js').SpawnSystem} SpawnSystem
 * @typedef {{x:number, z:number, color:string}} EnemyMarker
 */

/**
 * Owns all live enemy instances, their update loop, and the kill event.
 * @see EVENTS.ENEMY_DIED
 */
export class EnemySystem {
  /**
   * @param {Game} game
   */
  constructor(game) {
    this.game = game;
    this.scene = game.scene;
    this.materials = game.materials;
    this.projectiles = game.projectiles;
    this.bus = game.bus;
    /** @type {Array<object>} */
    this.enemies = [];
    /** @type {SpawnSystem|null} */
    this.spawnSystem = null;
  }

  /**
   * Late-bind the spawn system. Called once after both systems are constructed.
   * @param {SpawnSystem} spawnSystem
   * @returns {void}
   */
  attachSpawnSystem(spawnSystem) { this.spawnSystem = spawnSystem; }

  /**
   * Spawn the initial wave — either via the daily-seed RNG or the hard-coded
   * `INITIAL_SPAWNS` table.
   * @returns {void}
   */
  spawnInitial() {
    if (this.spawnSystem && typeof this.spawnSystem.applyDailySeed === 'function') {
      const placements = this.spawnSystem.applyDailySeed();
      if (placements) {
        for (const p of placements) this._spawn(/** @type {0|1|2} */ (p.type), p.x, p.z);
        return;
      }
    }
    for (const [type, x, z] of INITIAL_SPAWNS) {
      this._spawn(/** @type {0|1|2} */ (type), x, z);
    }
  }

  /**
   * @private spawn a single enemy of the given type at (x, z).
   * @param {0|1|2} type — 0=blue, 1=green, 2=purple
   * @param {number} x
   * @param {number} z
   * @returns {object} the new enemy instance
   */
  _spawn(type, x, z) {
    let e;
    if (type === 0) e = new SlimeBlue(this.scene, this.materials, x, z);
    else if (type === 1) e = new SlimeGreen(this.scene, this.materials, x, z);
    else e = new SlimePurple(this.scene, this.materials, x, z);
    this.enemies.push(e);
    return e;
  }

  /**
   * Remove all enemies from the world. Phase 19+: used when transitioning
   * to a new zone so the old biome's mobs don't linger.
   * @returns {void}
   */
  clear() {
    for (const e of this.enemies) {
      if (e && !e.dead && e.dispose) e.dispose();
    }
    this.enemies.length = 0;
  }

  /**
   * Mark `e` as dead, remove from scene, emit `ENEMY_DIED`. Idempotent.
   * @param {object} e
   * @returns {void}
   */
  kill(e) {
    if (e.dead) return;
    e.dead = true;
    this.scene.remove(e.group);
    this.bus.emit(EVENTS.ENEMY_DIED, e);
  }

  /**
   * Per-frame: tick every alive enemy, deal contact damage to player.
   * @param {number} dt
   * @param {object} player
   * @returns {void}
   */
  update(dt, player) {
    for (const e of this.enemies) {
      if (e.dead) continue;
      e.update(dt, player, (from, dir) => this.projectiles.fire(from, dir));
      if (e.position.distanceTo(player.position) < 1.3) {
        player.takeDamage(1, e.position);
      }
    }
  }

  /** @returns {EnemyMarker[]} minimap markers for all alive enemies. */
  getMarkers() {
    return this.enemies.filter((e) => !e.dead).map((e) => ({
      x: e.position.x, z: e.position.z, color: '#' + e.spec.col.toString(16).padStart(6, '0'),
    }));
  }
}
