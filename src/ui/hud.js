// ui/hud.js — heart display + HP bar.
//
// Phase 3 refactor: subscribes to UI_REFRESH + SCREEN change. Renders
// declaratively from a render(player) call. main.js no longer needs to
// poke any DOM in the hearts path.

import { EVENTS } from '../core/constants.js';
import { screenBus, SCREEN } from '../core/screen-state.js';

const VISIBLE_SCREENS = new Set([SCREEN.PLAYING, SCREEN.DIALOG, SCREEN.INVENTORY]);

export class HUD {
  constructor(bus, playerRef) {
    this.bus = bus;
    this.player = playerRef;
    this.panel = document.getElementById('player-panel');
    this.heartsEl = document.getElementById('hearts');
    this.hpBarEl = this.panel && this.panel.querySelector('.bar>div');

    bus.on(EVENTS.UI_REFRESH, () => this.render());
    bus.on(EVENTS.PLAYER_DAMAGE, () => this.render());
    bus.on(EVENTS.PLAYER_HEAL,   () => this.render());

    screenBus.on('change', ({ to }) => this.applyVisibility(to));
    this.applyVisibility('start');
  }

  applyVisibility(screen) {
    if (!this.panel) return;
    this.panel.style.display = VISIBLE_SCREENS.has(screen) ? 'block' : 'none';
  }

  render() {
    if (!this.player || !this.heartsEl) return;
    const p = this.player;
    this.heartsEl.innerHTML = '';
    for (let i = 0; i < p.maxHp; i++) {
      const h = document.createElement('div');
      h.className = 'heart' + (i < p.hp ? '' : ' empty');
      this.heartsEl.appendChild(h);
    }
    if (this.hpBarEl) {
      this.hpBarEl.style.width = (p.crystals / 10 * 100) + '%';
    }
  }
}
