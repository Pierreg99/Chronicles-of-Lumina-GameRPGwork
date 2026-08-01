// systems/quest-system.js — tracks crystal count + triggers boss spawn.
// Phase R1: takes `game`.

import { state } from '../core/state.js';
import { EVENTS } from '../core/constants.js';
import { CONFIG } from '../core/config.js';

/**
 * @typedef {import('../core/game.js').Game} Game
 */

/**
 * Tracks crystal count toward the quest target; spawns the boss when reached.
 * @see EVENTS.QUEST_UPDATE
 * @see EVENTS.BOSS_SPAWN
 */
export class QuestSystem {
  /**
   * @param {Game} game
   */
  constructor(game) {
    this.game = game;
    this.bus = game.bus;
    this.bossSystem = game.bossSystem;
    /** @type {number} */
    this.crystals = 0;
    /** @type {number} target from {@link CONFIG.quest.crystalTarget} */
    this.target = CONFIG.quest.crystalTarget;
    this.bus.on(EVENTS.LOOT_PICKUP_CRYSTAL, () => this.addCrystal());
  }

  /**
   * Increment crystal count (capped at target) and spawn the boss if reached.
   * @returns {void}
   */
  addCrystal() {
    this.crystals = Math.min(this.target, this.crystals + 1);
    state.crystals = this.crystals;
    this.bus.emit(EVENTS.QUEST_UPDATE, { crystals: this.crystals, target: this.target });
    if (this.crystals >= this.target && !state.bossActive && !this.bossSystem.boss.dead) {
      state.bossActive = true;
      this.bossSystem.spawn();
      this.bus.emit(EVENTS.BOSS_SPAWN);
    }
  }

  /** @returns {boolean} true if crystal count has reached the target. */
  isReady() { return this.crystals >= this.target; }
}
