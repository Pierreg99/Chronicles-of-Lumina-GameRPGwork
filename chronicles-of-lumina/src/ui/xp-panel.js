// ui/xp-panel.js — level number + XP progress bar.

import { EVENTS } from '../core/constants.js';

export class XpPanel {
  constructor(bus) {
    this.bus = bus;
    bus.on(EVENTS.XP_GAIN,    ({ xp, next, level }) => this.update(xp, next, level));
    bus.on(EVENTS.XP_LEVELUP, ({ level }) => this.flash());
  }

  update(xp, next, level) {
    const lvl = document.getElementById('xp-level');
    if (lvl) lvl.textContent = 'LVL ' + level;
    const bar = document.querySelector('#xp-bar>div');
    if (bar) bar.style.width = (xp / next * 100) + '%';
  }

  flash() {
    const el = document.getElementById('xp-panel');
    if (!el) return;
    el.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }],
      { duration: 380, easing: 'ease-out' }
    );
  }
}
