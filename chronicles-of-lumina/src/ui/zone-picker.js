// ui/zone-picker.js — renders the biome cards on the start screen and
// handles the map-code input. Each card is a clickable preview with a
// swatch derived from the zone's accent color.
//
// Phase 19+: also drives the in-world zone indicator and portal-hint.

import { ZONES, getZone, listZones, decodeMapCode } from '../world/zones/index.js';
import { ICONS } from './icons.js';
import { state } from '../core/state.js';
import { EVENTS } from '../core/constants.js';
import { screenBus, SCREEN } from '../core/screen-state.js';

const ZONE_ICONS = {
  verdant: 'sparkle',
  dunes:   'crystal',
  peaks:   'shield',
  mire:    'book',
  ember:   'trophy',
};

const VISIBLE_SCREENS = new Set([SCREEN.START]);

export class ZonePicker {
  constructor(bus) {
    this.bus = bus;
    this.selectedZone = state.currentZone || 'verdant';
    this._buildCards();
    this._buildMapCodeInput();
    this._buildInWorldUI();
    screenBus.on('change', ({ to }) => this._apply(to));
    this._apply(SCREEN.START);
  }

  _buildCards() {
    const host = document.getElementById('zone-cards');
    if (!host) return;
    host.innerHTML = '';
    for (const zone of listZones()) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'zone-card';
      card.dataset.zone = zone.id;
      card.setAttribute('aria-label', `Biom: ${zone.name}`);

      const iconName = ZONE_ICONS[zone.id] || 'sparkle';
      const tier = zone.difficulty >= 1.8 ? 'epic' : zone.difficulty >= 1.3 ? 'hard' : 'normal';
      const filledPips = Math.max(1, Math.round(zone.difficulty * 2));
      const totalPips = 4;

      card.innerHTML = `
        <div class="zone-swatch" style="background:${zone.accent}">
          <span class="icon" data-icon="${iconName}"></span>
        </div>
        <div class="zone-body">
          <div class="zone-name">${zone.name}</div>
          <div class="zone-difficulty" data-tier="${tier}" aria-label="Schwierigkeit ${zone.difficulty}">
            ${Array.from({ length: totalPips }).map((_, i) =>
              `<span class="pip${i < filledPips ? ' filled' : ''}"></span>`
            ).join('')}
          </div>
        </div>
      `;
      card.onclick = () => this.select(zone.id);
      host.appendChild(card);
    }
    // Re-hydrate the data-icon attributes we just inserted
    for (const el of host.querySelectorAll('[data-icon]')) {
      const name = el.getAttribute('data-icon');
      const svg = ICONS[name];
      if (svg) el.innerHTML = svg;
    }
    this._refreshSelection();
  }

  _buildMapCodeInput() {
    const input = document.getElementById('map-code-input');
    const loadBtn = document.getElementById('map-code-load');
    if (!input || !loadBtn) return;

    const load = () => {
      const code = input.value.trim();
      const decoded = decodeMapCode(code);
      if (!decoded) {
        input.style.borderColor = 'var(--danger)';
        input.style.boxShadow = '0 0 0 3px var(--danger-soft)';
        setTimeout(() => {
          input.style.borderColor = '';
          input.style.boxShadow = '';
        }, 800);
        return;
      }
      this.select(decoded.zoneId, decoded.seed);
    };

    loadBtn.onclick = load;
    input.onkeydown = (e) => { if (e.key === 'Enter') load(); };
  }

  _buildInWorldUI() {
    // Reuse the static #zone-indicator and #portal-hint nodes from the
    // HTML. They were hydrated for data-icon already.
    this.indicator = document.getElementById('zone-indicator');
    this.swatchEl = document.getElementById('zone-swatch');
    this.nameEl = document.getElementById('zone-name');
    this.portalHint = document.getElementById('portal-hint');
    this.portalTargetEl = document.getElementById('portal-target-name');
  }

  _apply(screen) {
    if (this.indicator) {
      const visible = VISIBLE_SCREENS.has(screen) ? false : (state.currentZone ? true : false);
      // Indicator: hide on start screen (the picker covers it), show in-world
      this.indicator.style.display = visible ? 'flex' : 'none';
    }
    if (this.portalHint) this.portalHint.style.display = 'none';
  }

  select(zoneId, seed = null) {
    if (!ZONES[zoneId]) return;
    this.selectedZone = zoneId;
    state.currentZone = zoneId;
    state.mapCode = seed != null
      ? `${zoneId}:${(seed >>> 0).toString(36)}`
      : null;
    state.visitedZones = state.visitedZones || new Set();
    state.visitedZones.add(zoneId);
    this._refreshSelection();
    if (this.bus) this.bus.emit(EVENTS.UI_REFRESH);
    if (this.bus) this.bus.emit(EVENTS.ZONE_CHANGE, { zoneId, seed });
  }

  showPortalHint(zoneId) {
    if (!this.portalHint) return;
    const zone = getZone(zoneId);
    if (this.portalTargetEl) this.portalTargetEl.textContent = `→ ${zone.name}`;
    this.portalHint.style.display = 'flex';
  }

  hidePortalHint() {
    if (this.portalHint) this.portalHint.style.display = 'none';
  }

  showZoneIndicator(zoneId) {
    if (!this.indicator || !this.swatchEl || !this.nameEl) return;
    const zone = getZone(zoneId);
    this.swatchEl.style.background = zone.accent;
    this.nameEl.textContent = zone.name;
    this.indicator.style.display = 'flex';
  }

  _refreshSelection() {
    for (const card of document.querySelectorAll('.zone-card')) {
      card.dataset.selected = card.dataset.zone === this.selectedZone ? '1' : '0';
    }
  }
}
