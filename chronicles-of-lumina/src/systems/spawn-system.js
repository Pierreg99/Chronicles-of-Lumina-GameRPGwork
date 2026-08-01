// systems/spawn-system.js — Phase 7 + R1: takes `game`.
// Daily-seeded enemy placements.

import { makeRng, randInt, chance } from '../utils/random.js';
import { SlimeBlue } from '../entities/slime-blue.js';
import { SlimeGreen } from '../entities/slime-green.js';
import { SlimePurple } from '../entities/slime-purple.js';
import { state } from '../core/state.js';

const DEFAULT_RADIUS = 16;
const DEFAULT_COUNT = 12;

export class SpawnSystem {
  constructor(game) {
    this.game = game;
    this.scene = game.scene;
    this.materials = game.materials;
    this.projectiles = game.projectiles;
    this.enemySystem = game.enemySystem;
  }

  applyDailySeed(count = DEFAULT_COUNT, radius = DEFAULT_RADIUS) {
    if (!state.dailySeed) return null;
    const rng = makeRng(state.dailySeed);
    const placements = [];
    for (let i = 0; i < count; i++) {
      const angle = rng() * Math.PI * 2;
      const r = Math.sqrt(rng()) * radius;
      const cx = 18 + Math.cos(angle) * r;
      const cz = -10 + Math.sin(angle) * r;
      let type = 0;
      const roll = rng();
      if (roll > 0.85) type = 2;
      else if (roll > 0.60) type = 1;
      placements.push({ type, x: cx, z: cz });
    }
    return placements;
  }

  update(dt) { /* reserved for respawn waves */ }
}
