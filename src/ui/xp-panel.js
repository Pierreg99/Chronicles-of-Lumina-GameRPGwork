// ui/xp-panel.js — level number + XP progress bar.

import { EVENTS } from '../core/constants.js';
import { screenBus, SCREEN } from '../core/screen-state.js';

const VISIBLE_SCREENS = new Set([SCREEN.PLAYING, SCREEN.DIALOG, SCREEN.INVENTORY]);

export class XpPanel {
  constructor(bus) {
    this.bus = bus;
    this.panel = document.getElementById('xp-panel');
    this.lvlEl = document.getElementById('xp-level');
    this.barEl = this.panel && this.panel.querySelector('#xp-bar>div');

    bus.on(EVENTS.XP_GAIN,    ({ xp, next, level }) => this.update(xp, next, level));
    bus.on(EVENTS.XP_LEVELUP, ({ level }) => this.flash());
    screenBus.on('change', ({ to }) => this.applyVisibility(to));
    this.applyVisibility('start');
  }

  applyVisibility(screen) {
    if (this.panel) this.panel.style.display = VISIBLE_SCREENS.has(screen) ? 'block' : 'none';
  }

  update(xp, next, level) {
    if (this.lvlEl) this.lvlEl.textContent = 'LVL ' + level;
    if (this.barEl) this.barEl.style.width = (xp / next * 100) + '%';
  }

  flash() {
    if (!this.panel) return;
    this.panel.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }],
      { duration: 380, easing: 'ease-out' }
    );
  }
}
