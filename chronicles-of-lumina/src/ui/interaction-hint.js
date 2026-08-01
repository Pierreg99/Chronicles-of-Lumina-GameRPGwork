// ui/interaction-hint.js — bottom-center "[E] Schrein reinigen"-style hint.
// Reads from the InteractionSystem on every render and updates the DOM itself,
// so main.js doesn't have to know about #hint.

import { screenBus, SCREEN } from '../core/screen-state.js';

const HINTS = {
  shrine: '[E] Schrein reinigen',
  elder:  '[E] Mit der Dorfältesten sprechen',
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
    if (this.el) this.el.style.display = VISIBLE_SCREENS.has(screen) ? 'block' : 'none';
  }

  render() {
    if (!this.el) return;
    const target = this.system.nearestInteractable();
    const next = target ? HINTS[target] : null;
    if (next === this.current) return;
    this.current = next;
    if (next) {
      this.el.textContent = next;
      this.el.style.display = 'block';
    } else {
      this.el.style.display = 'none';
    }
  }
}
