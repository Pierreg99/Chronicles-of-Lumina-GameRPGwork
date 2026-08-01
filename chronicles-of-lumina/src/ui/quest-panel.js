// ui/quest-panel.js — top-right panel: quest title + crystal counter.

import { EVENTS } from '../core/constants.js';

export class QuestPanel {
  constructor(bus) {
    this.bus = bus;
    bus.on(EVENTS.QUEST_UPDATE, ({ crystals, target }) => this.update(crystals, target));
  }

  update(crystals, target) {
    const c = document.getElementById('quest-count');
    if (c) c.textContent = `${crystals} / ${target}`;
    const bar = document.querySelector('#player-panel .bar>div');
    if (bar) bar.style.width = (crystals / target * 100) + '%';
  }
}
