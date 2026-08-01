// systems/spawn-system.js — Phase 7 + R1: takes `game`.
// Daily-seeded enemy placements.

import { makeRng, randInt, chance } from '../utils/random.js';
import { SlimeBlue } from '../entities/slime-blue.js';
import { SlimeGreen } from '../entities/slime-green.js';
import { SlimePurple } from '../entities/slime-purple.js';
import { state } from '../core/state.js';

const DEFAULT_RADIUS = 16;
const DEFAULT_COUNT = 12;

/**
 * @typedef {import('../core/game.js').Game} Game
 *
 * @typedef {{type:0|1|2, x:number, z:number}} Placement
 */

/**
 * Daily-seeded enemy placements. Returns a deterministic layout based on
 * `state.dailySeed`; returns `null` when no seed is set.
 */
export class SpawnSystem {
  /**
   * @param {Game} game
   */
  constructor(game) {
    this.game = game;
    this.scene = game.scene;
    this.materials = game.materials;
    this.projectiles = game.projectiles;
    this.enemySystem = game.enemySystem;
  }

  /**
   * Build `count` placements around the shrine area using the daily-seeded RNG.
   * @param {number} [count=12]
   * @param {number} [radius=16]
   * @returns {Placement[]|null} placements or `null` when no daily seed.
   */
  applyDailySeed(count = DEFAULT_COUNT, radius = DEFAULT_RADIUS) {
    if (!state.dailySeed) return null;
    const rng = makeRng(Number(state.dailySeed));
    const placements = [];
    for (let i = 0; i < count; i++) {
      const angle = rng() * Math.PI * 2;
      const r = Math.sqrt(rng()) * radius;
      const cx = 18 + Math.cos(angle) * r;
      const cz = -10 + Math.sin(angle) * r;
      /** @type {0|1|2} */
      let type = 0;
      const roll = rng();
      if (roll > 0.85) type = 2;
      else if (roll > 0.60) type = 1;
      placements.push({ type, x: cx, z: cz });
    }
    return placements;
  }

  /** @param {number} dt — reserved for future respawn-wave logic. */
  update(dt) { /* reserved for respawn waves */ }
}
