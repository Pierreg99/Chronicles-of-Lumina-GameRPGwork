// ui/hud.js — heart display + HP bar; subscribes to player state changes.

import { EVENTS } from '../core/constants.js';

export class HUD {
  constructor(bus) {
    this.bus = bus;
    bus.on(EVENTS.UI_REFRESH, () => this.refresh());
    bus.on(EVENTS.PLAYER_DAMAGE, () => this.refresh());
    bus.on(EVENTS.PLAYER_HEAL, () => this.refresh());
  }

  refresh(player) {
    if (!player) return;
    const el = document.getElementById('hearts');
    if (!el) return;
    el.innerHTML = '';
    for (let i = 0; i < player.maxHp; i++) {
      const h = document.createElement('div');
      h.className = 'heart' + (i < player.hp ? '' : ' empty');
      el.appendChild(h);
    }
  }
}
