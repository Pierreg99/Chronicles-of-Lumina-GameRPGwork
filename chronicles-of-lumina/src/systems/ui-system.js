// systems/ui-system.js — thin facade that updates the static HTML HUD/panels
// from authoritative state. Keeps the UI layer dumb.

import { EVENTS } from '../core/constants.js';

export class UiSystem {
  constructor(bus) {
    this.bus = bus;
    this._wire();
  }

  _wire() {
    this.bus.on(EVENTS.PLAYER_DAMAGE, () => this.refreshHearts());
    this.bus.on(EVENTS.PLAYER_HEAL,   () => this.refreshHearts());
    this.bus.on(EVENTS.QUEST_UPDATE,  ({ crystals, target }) => this.refreshQuest(crystals, target));
    this.bus.on(EVENTS.XP_GAIN,       ({ xp, next, level }) => this.refreshXp(xp, next, level));
    this.bus.on(EVENTS.BOSS_SPAWN,    () => this.showBoss(true));
    this.bus.on(EVENTS.BOSS_DIED,     () => this.showBoss(false));
  }

  refreshHearts() { /* implemented by HUD via state read */ }
  refreshQuest(c, t) {
    const el = document.getElementById('quest-count');
    if (el) el.textContent = `${c} / ${t}`;
    const bar = document.querySelector('#player-panel .bar>div');
    if (bar) bar.style.width = (c / t * 100) + '%';
  }
  refreshXp(xp, next, level) {
    const lvl = document.getElementById('xp-level');
    if (lvl) lvl.textContent = 'LVL ' + level;
    const bar = document.querySelector('#xp-bar>div');
    if (bar) bar.style.width = (xp / next * 100) + '%';
  }
  showBoss(show) {
    const p = document.getElementById('boss-panel');
    if (p) p.style.display = show ? 'block' : 'none';
  }
}
