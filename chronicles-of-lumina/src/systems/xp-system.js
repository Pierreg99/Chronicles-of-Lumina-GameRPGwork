// systems/xp-system.js — XP curve + level-ups.
// Phase R1: takes `game`.

import { state } from '../core/state.js';
import { EVENTS } from '../core/constants.js';
import { CONFIG } from '../core/config.js';

/**
 * @typedef {import('../core/game.js').Game} Game
 */

/**
 * XP curve, level-ups, stat scaling.
 * @see EVENTS.XP_GAIN
 * @see EVENTS.XP_LEVELUP
 */
export class XpSystem {
  /**
   * @param {Game} game
   */
  constructor(game) {
    this.game = game;
    this.bus = game.bus;
    this.player = game.player;
    /** @type {number} current XP within the current level. */
    this.xp = 0;
    /** @type {number} */
    this.level = 1;
    /** @type {number} XP needed to reach the next level. */
    this.next = CONFIG.xp.baseNext;
  }

  /**
   * Add XP, level up zero or more times, and re-derive player stats.
   * @param {number} n
   * @returns {void}
   */
  gain(n) {
    this.xp += n;
    while (this.xp >= this.next) {
      this.xp -= this.next;
      this.level++;
      this.next = Math.round(this.next * CONFIG.xp.growth);
      this.player.maxHp += CONFIG.xp.hpPerLevel;
      this.player.hp = this.player.maxHp;
      this.player.atkDmg = 1 + Math.floor(this.level / CONFIG.xp.damageEveryNLevels);
      this.bus.emit(EVENTS.XP_LEVELUP, { level: this.level });
    }
    this.bus.emit(EVENTS.XP_GAIN, { xp: this.xp, next: this.next, level: this.level });
  }
}
