// ui/interaction-hint.js — bottom-center "[E] Schrein reinigen"-style hint.
// Reads from the InteractionSystem on every render and updates the DOM itself,
// so main.js doesn't have to know about #hint.
//
// Phase 19+: now icon-aware. Portals get a special target icon + zone name.

import { screenBus, SCREEN } from '../core/screen-state.js';
import { ICONS } from './icons.js';
import { getZone } from '../world/zones/index.js';

const HINTS = {
  shrine: { icon: 'book',       text: 'Schrein reinigen' },
  elder:  { icon: 'book',       text: 'Mit der Dorfältesten sprechen' },
  portal: { icon: 'target',     text: 'Portal betreten' }, // overridden dynamically
};

const VISIBLE_SCREENS = new Set([SCREEN.PLAYING, SCREEN.DIALOG]);

export class InteractionHint {
  constructor(bus, { player, interactionSystem }) {
    this.bus = bus;
    this.player = player;
    this.system = interactionSystem;
    this.el = document.getElementById('hint');
    this.current = null;

    bus.on('tick', () => this.render());
    screenBus.on('change', ({ to }) => this.applyVisibility(to));
    this.applyVisibility('start');
    this.render();
  }

  applyVisibility(screen) {
    if (!this.el) return;
    this.el.style.display = VISIBLE_SCREENS.has(screen) ? 'flex' : 'none';
  }

  render() {
    if (!this.el) return;
    const payload = this.system.nearestWithPayload();
    let label = null;
    if (payload) {
      const base = HINTS[payload.type];
      if (base) {
        let text = base.text;
        if (payload.type === 'portal') {
          const targetZone = getZone(payload.target.targetZone);
          text = `Portal: ${targetZone.name}`;
        }
        label = { icon: base.icon, text };
      }
    }

    if (label && this.current && this.current.text === label.text) return;
    this.current = label;

    if (label) {
      this.el.innerHTML = `
        <span class="icon icon-md" data-icon="${label.icon}"></span>
        <span><kbd>E</kbd> ${label.text}</span>
      `;
      const ic = this.el.querySelector('[data-icon]');
      if (ic) ic.innerHTML = ICONS[label.icon] || '';
      this.el.style.display = 'flex';
    } else {
      this.el.style.display = 'none';
    }
  }
}
