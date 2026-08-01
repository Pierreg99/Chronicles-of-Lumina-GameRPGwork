// ui/boss-bar.js — top-center bar shown during the boss fight.

import { EVENTS } from '../core/constants.js';

export class BossBar {
  constructor(bus) {
    this.bus = bus;
    bus.on(EVENTS.BOSS_SPAWN, () => this.show());
    bus.on(EVENTS.BOSS_DIED,  () => this.hide());
    bus.on(EVENTS.BOSS_DAMAGE, (hp) => this.update(hp));
  }

  show() {
    const el = document.getElementById('boss-panel');
    if (el) el.style.display = 'block';
  }

  hide() {
    const el = document.getElementById('boss-panel');
    if (el) el.style.display = 'none';
  }

  update({ hp, maxHp }) {
    const bar = document.querySelector('#boss-bar>div');
    if (bar) bar.style.width = Math.max(0, hp / maxHp * 100) + '%';
  }
}
