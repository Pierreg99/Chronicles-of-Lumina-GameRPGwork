// ui/spell-bar.js — bottom-center spell quick-bar.
//
// Shows the 4 equipped spells with mana cost, cooldown indicator,
// and key bindings 1-4. Auto-hides when not playing.

import { screenBus, SCREEN } from '../core/screen-state.js';
import { state } from '../core/state.js';
import { SPELL_SCHOOLS, getSpell, listSpells } from '../systems/magic.js';
import { ICONS } from './icons.js';

const VISIBLE_SCREENS = new Set([SCREEN.PLAYING, SCREEN.DIALOG]);

const SPELL_ICONS = {
  fireball:      'sparkle',
  ignite:        'sparkle',
  firewall:      'shield',
  meteor:        'trophy',
  frostbolt:     'crystal',
  iceshield:     'shield',
  blizzard:      'crystal',
  frozentomb:    'crystal',
  spark:         'sparkle',
  heal:          'book',
  lightningbolt: 'sparkle',
  timewarp:      'book',
};

const DEFAULT_SLOTS = ['fireball', 'frostbolt', 'spark', 'heal'];

export class SpellBar {
  constructor() {
    this.slots = (state.equippedSpells && state.equippedSpells.length === 4)
      ? state.equippedSpells
      : DEFAULT_SLOTS;
    this._build();
    this._render();
    screenBus.on('change', ({ to }) => this._apply(to));
    this._apply(SCREEN.START);
  }

  _build() {
    this.host = document.createElement('div');
    this.host.id = 'spell-bar';
    Object.assign(this.host.style, {
      position: 'fixed',
      bottom: '160px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'none',
      gap: '6px',
      padding: '8px 12px',
      background: 'var(--surface)',
      backdropFilter: 'blur(14px)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      zIndex: '10',
      boxShadow: 'var(--shadow-md)',
      alignItems: 'center',
    });
    document.body.appendChild(this.host);
  }

  _apply(screen) {
    if (!this.host) return;
    this.host.style.display = VISIBLE_SCREENS.has(screen) ? 'flex' : 'none';
    if (VISIBLE_SCREENS.has(screen)) this._render();
  }

  _render() {
    if (!this.host) return;
    state.spellCooldowns = state.spellCooldowns || {};
    const mana = state.mana || 0;
    const maxMana = (state.baseStats?.maxMana) || 20;
    this.host.innerHTML = `
      <div class="spell-mana" title="Mana">
        <span class="icon" data-icon="sparkle"></span>
        <span>${Math.floor(mana)} / ${maxMana}</span>
      </div>
      <div class="spell-divider"></div>
      ${this.slots.map((id, i) => this._renderSlot(id, i + 1)).join('')}
    `;
    for (const el of this.host.querySelectorAll('[data-icon]')) {
      const name = el.getAttribute('data-icon');
      const svg = ICONS[name];
      if (svg) el.innerHTML = svg;
    }
  }

  _renderSlot(spellId, keyNum) {
    const spell = getSpell(spellId);
    if (!spell) return `<div class="spell-slot spell-empty">${keyNum} —</div>`;
    const school = SPELL_SCHOOLS[spell.school.toUpperCase()];
    const color = school ? school.color : 'var(--muted)';
    const iconName = SPELL_ICONS[spellId] || 'sparkle';
    const cdEnd = (state.spellCooldowns || {})[spellId] || 0;
    const now = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
    const onCd = now < cdEnd;
    const cdRemain = onCd ? Math.max(0, cdEnd - now) : 0;
    const tooExpensive = (state.mana || 0) < spell.manaCost;
    return `
      <div class="spell-slot ${onCd || tooExpensive ? 'spell-disabled' : ''}" title="${spell.desc}">
        <span class="spell-key">${keyNum}</span>
        <span class="icon" data-icon="${iconName}" style="color:${color}"></span>
        <span class="spell-cost" style="color:${color}">${spell.manaCost}</span>
        ${onCd ? `<div class="spell-cd" style="width:${(cdRemain / spell.cooldownSec) * 100}%"></div>` : ''}
      </div>
    `;
  }
}
