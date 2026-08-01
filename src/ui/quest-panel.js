// ui/quest-panel.js — top-right panel: quest title + crystal counter.

import { EVENTS } from '../core/constants.js';
import { screenBus, SCREEN } from '../core/screen-state.js';

const VISIBLE_SCREENS = new Set([SCREEN.PLAYING, SCREEN.DIALOG, SCREEN.INVENTORY]);

export class QuestPanel {
  constructor(bus) {
    this.bus = bus;
    this.panel = document.getElementById('quest-panel');
    this.countEl = document.getElementById('quest-count');

    bus.on(EVENTS.QUEST_UPDATE, ({ crystals, target }) => this.update(crystals, target));
    screenBus.on('change', ({ to }) => this.applyVisibility(to));
    this.applyVisibility('start');
  }

  applyVisibility(screen) {
    if (this.panel) this.panel.style.display = VISIBLE_SCREENS.has(screen) ? 'block' : 'none';
  }

  update(crystals, target) {
    if (this.countEl) this.countEl.textContent = `${crystals} / ${target}`;
  }
}
