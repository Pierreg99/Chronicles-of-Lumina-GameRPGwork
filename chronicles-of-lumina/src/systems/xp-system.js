// systems/xp-system.js — XP curve + level-ups.

import { state } from '../core/state.js';
import { EVENTS } from '../core/constants.js';
import { CONFIG } from '../core/config.js';

export class XpSystem {
  constructor(bus, player) {
    this.bus = bus;
    this.player = player;
    this.xp = 0;
    this.level = 1;
    this.next = CONFIG.xp.baseNext;
  }

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
