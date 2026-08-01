// systems/quest-system.js — tracks crystal count + triggers boss spawn.
// Phase R1: takes `game`.

import { state } from '../core/state.js';
import { EVENTS } from '../core/constants.js';
import { CONFIG } from '../core/config.js';

export class QuestSystem {
  constructor(game) {
    this.game = game;
    this.bus = game.bus;
    this.bossSystem = game.bossSystem;
    this.crystals = 0;
    this.target = CONFIG.quest.crystalTarget;
    this.bus.on(EVENTS.LOOT_PICKUP_CRYSTAL, () => this.addCrystal());
  }

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

  isReady() { return this.crystals >= this.target; }
}
