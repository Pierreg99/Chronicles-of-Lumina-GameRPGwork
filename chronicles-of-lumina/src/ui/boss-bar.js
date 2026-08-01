// ui/boss-bar.js — top-center bar shown during the boss fight.

import { EVENTS } from '../core/constants.js';

export class BossBar {
  constructor(bus) {
    this.bus = bus;
    this.panel = document.getElementById('boss-panel');
    this.barEl = this.panel && this.panel.querySelector('#boss-bar>div');

    bus.on(EVENTS.BOSS_SPAWN, () => this.show());
    bus.on(EVENTS.BOSS_DIED,  () => this.hide());
    bus.on(EVENTS.BOSS_DAMAGE, (hp) => this.update(hp));
  }

  show() { if (this.panel) this.panel.style.display = 'block'; }
  hide() { if (this.panel) this.panel.style.display = 'none'; }

  update({ hp, maxHp }) {
    if (this.barEl) this.barEl.style.width = Math.max(0, hp / maxHp * 100) + '%';
  }
}
