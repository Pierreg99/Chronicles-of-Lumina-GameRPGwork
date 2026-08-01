// systems/spawn-system.js — placeholder for respawn waves after the initial set.
// In this vertical slice we just keep the initial spawn count.

import { CONFIG } from '../core/config.js';

export class SpawnSystem {
  constructor(enemySystem) {
    this.enemySystem = enemySystem;
    this._respawnQueue = [];
  }

  update(dt) {
    // Reserved for respawn logic; the demo runs with the initial wave only.
  }
}
