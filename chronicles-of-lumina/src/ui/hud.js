// ui/hud.js — heart display + HP bar.
//
// Phase 9 visual refresh: hearts are now inline SVG icons (filled / outline).
// The HP bar is driven by the player's actual hp/maxHp — previously it was
// incorrectly rendering the crystal count, which is already shown in the
// quest panel.
//
// Subscribes to UI_REFRESH + SCREEN change. Renders declaratively from
// render(player). main.js no longer needs to poke any DOM in the hearts path.

import { EVENTS } from '../core/constants.js';
import { screenBus, SCREEN } from '../core/screen-state.js';
import { ICONS } from './icons.js';

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
      const h = document.createElement('span');
      h.className = 'heart' + (i < p.hp ? '' : ' empty');
      h.setAttribute('aria-label', i < p.hp ? 'HP verbleibend' : 'HP verloren');
      h.innerHTML = i < p.hp ? ICONS.heart : ICONS.heartOutline;
      this.heartsEl.appendChild(h);
    }
    if (this.hpBarEl && p.maxHp > 0) {
      const pct = Math.max(0, Math.min(100, (p.hp / p.maxHp) * 100));
      this.hpBarEl.style.width = pct + '%';
      // Switch bar color to warning when low HP
      if (pct <= 30) {
        this.hpBarEl.style.background = 'linear-gradient(90deg, #B45309, #F59E0B)';
        this.hpBarEl.style.boxShadow = '0 0 8px rgba(245, 158, 11, 0.5)';
      } else {
        this.hpBarEl.style.background = '';
        this.hpBarEl.style.boxShadow = '';
      }
    }
  }
}
