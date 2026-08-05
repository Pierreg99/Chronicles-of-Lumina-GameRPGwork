// ui/equipment-panel.js — character equipment + stats screen.
// Toggled with U key. Shows the 6 armor slots + weapon + computed
// stats (with +x bonuses) + a stats panel. Self-contained DOM, no
// shared CSS dependencies beyond the global tokens.

import { screenBus, SCREEN } from '../core/screen-state.js';
import { ICONS } from './icons.js';
import { state } from '../core/state.js';
import {
  EQUIPMENT_SLOTS, RARITY, STATS, STAT_LABELS,
  getAllStatBonuses, deriveStats, listTemplatesBySlot,
} from '../systems/equipment.js';

const VISIBLE_SCREENS = new Set([SCREEN.INVENTORY]); // reuses inventory screen

const SLOT_LABELS = {
  weapon: 'Waffe',
  helm:   'Helm',
  chest:  'Brust',
  legs:   'Beine',
  boots:  'Stiefel',
  gloves: 'Hände',
  ring:   'Ring',
};

const SLOT_ICONS = {
  weapon: 'sword',
  helm:   'shield',
  chest:  'shield',
  legs:   'shield',
  boots:  'shield',
  gloves: 'shield',
  ring:   'crystal',
};

export class EquipmentPanel {
  constructor() {
    this._build();
    this._render();
    screenBus.on('change', ({ to }) => this._apply(to));
    this._apply(SCREEN.START);
  }

  _build() {
    this.host = document.createElement('div');
    this.host.id = 'equipment-panel';
    this.host.className = 'panel';
    Object.assign(this.host.style, {
      top: '160px', left: '320px',
      minWidth: '420px',
      display: 'none',
    });
    document.body.appendChild(this.host);
  }

  _apply(screen) {
    if (!this.host) return;
    this.host.style.display = (screen === SCREEN.INVENTORY) ? 'block' : 'none';
    if (screen === SCREEN.INVENTORY) this._render();
  }

  _render() {
    if (!this.host) return;
    const equipment = state.equipment || {};
    const bonuses = getAllStatBonuses(Object.values(equipment).filter(Boolean));
    const derived = deriveStats(state.baseStats, bonuses);

    const slotsHtml = Object.values(EQUIPMENT_SLOTS).map((slot) => {
      const item = equipment[slot];
      const rarity = item ? RARITY[item.tier.toUpperCase()] : null;
      const color = rarity ? rarity.color : 'var(--muted)';
      const iconName = SLOT_ICONS[slot] || 'crystal';
      const name = item ? item.name : '—';
      return `
        <div class="equip-slot" data-slot="${slot}">
          <span class="icon" data-icon="${iconName}"></span>
          <div class="equip-slot-info">
            <div class="equip-slot-name" style="color:${color}">${SLOT_LABELS[slot]}: ${name}</div>
            ${item ? `<div class="equip-slot-stats">${this._statsLine(item.stats)}</div>` : '<div class="equip-slot-empty">Leer</div>'}
          </div>
        </div>
      `;
    }).join('');

    const statsHtml = ['str', 'dex', 'int', 'vit', 'wis'].map((s) => {
      const bonus = bonuses[s];
      const bonusStr = bonus > 0 ? ` <span class="stat-bonus">+${bonus}</span>` : '';
      return `<div class="stat-row"><span class="stat-name">${STAT_LABELS[s]}</span><span class="stat-val">${bonus}${bonusStr}</span></div>`;
    }).join('');

    const derivedHtml = `
      <div class="derived-row">Max HP: <strong>${derived.maxHp}</strong></div>
      <div class="derived-row">Max Mana: <strong>${derived.maxMana}</strong></div>
      <div class="derived-row">Schaden: <strong>${derived.attackDamage}</strong></div>
      <div class="derived-row">Tempo: <strong>${derived.attackSpeed.toFixed(3)}</strong></div>
      <div class="derived-row">Crit: <strong>${(derived.critChance * 100).toFixed(1)}%</strong></div>
    `;

    this.host.innerHTML = `
      <div class="title">
        <span class="icon" data-icon="shield"></span>
        <span>AUSRÜSTUNG</span>
      </div>
      <div class="equip-grid">${slotsHtml}</div>
      <div class="stats-panel">
        <div class="stats-title">Attribute</div>
        ${statsHtml}
        <div class="stats-title" style="margin-top:8px">Abgeleitet</div>
        ${derivedHtml}
      </div>
    `;
    for (const el of this.host.querySelectorAll('[data-icon]')) {
      const name = el.getAttribute('data-icon');
      const svg = ICONS[name];
      if (svg) el.innerHTML = svg;
    }
  }

  _statsLine(stats) {
    return Object.entries(stats)
      .filter(([, v]) => v !== 0)
      .map(([k, v]) => `${STAT_LABELS[k] || k} ${v > 0 ? '+' : ''}${v}`)
      .join('  ·  ');
  }

  /** Public API: open the panel. */
  show() { this._render(); this.host.style.display = 'block'; }
  hide() { this.host.style.display = 'none'; }
}
