// ui/settings-panel.js — modal with sliders for all persisted settings.
// Phase 8: shown from the Pause screen 'Einstellungen' button. Writes
// through core/settings.js and applies accessibility flags to the document.
//
// Phase 9: the panel is now a *modal* — it stays hidden until show() is
// called explicitly from the Pause menu. Previously it auto-showed whenever
// the screen was PAUSED, which made Escape dump the user into settings
// instead of the pause menu.

import { settings, SETTINGS_KEYS } from '../core/settings.js';
import { screenBus, SCREEN } from '../core/screen-state.js';
import { ICONS } from './icons.js';

const ALLOWED_SCREENS = new Set([SCREEN.PAUSED]); // modal only valid during pause

export class SettingsPanel {
  constructor() {
    this._build();
    // Auto-hide if the user leaves PAUSED while the modal is open.
    screenBus.on('change', ({ to }) => {
      if (this._isOpen && !ALLOWED_SCREENS.has(to)) this.hide();
    });
  }

  _build() {
    this.host = document.createElement('div');
    this.host.id = 'settings-panel';
    this.host.className = 'overlay';
    Object.assign(this.host.style, { display: 'none', gap: '12px' });

    this.host.innerHTML = `
      <h1 style="font-size:1.5rem">
        <span class="icon" data-icon="gear"></span>
        Einstellungen
      </h1>
      <div id="settings-rows" style="display:flex;flex-direction:column;gap:14px;min-width:min(420px,80vw)"></div>
      <button class="btn primary" id="settings-done">
        <span class="icon" data-icon="play"></span>
        Schließen
      </button>
      <button class="btn" id="settings-reset">
        <span class="icon" data-icon="refresh"></span>
        Auf Standard zurücksetzen
      </button>
    `;
    // Hydrate the new data-icon elements (this panel is built dynamically)
    for (const el of this.host.querySelectorAll('[data-icon]')) {
      const name = el.getAttribute('data-icon');
      const svg = ICONS[name];
      if (svg) el.innerHTML = svg;
    }
    document.body.appendChild(this.host);

    document.getElementById('settings-done').onclick = () => this.hide();
    document.getElementById('settings-reset').onclick = () => {
      settings.reset();
      this._render();
      this._applyFlags();
    };
    this._render();
  }

  _apply(screen) {
    // Legacy hook kept for compatibility. The modal is now driven by
    // show() / hide() explicitly; screen changes auto-hide via the
    // constructor listener.
    if (screen && ALLOWED_SCREENS.has(screen) && this._isOpen) {
      this._applyFlags();
    }
  }

  show() {
    this._isOpen = true;
    this.host.style.display = 'flex';
    this._render();
    this._applyFlags();
  }

  hide() {
    this._isOpen = false;
    this.host.style.display = 'none';
  }

  _render() {
    const rows = document.getElementById('settings-rows');
    if (!rows) return;
    const all = settings.all();
    rows.innerHTML = '';
    const items = [
      { key: 'masterVolume',      label: 'Gesamtlautstärke',  min: 0, max: 1,   step: 0.05 },
      { key: 'sfxVolume',         label: 'SFX-Lautstärke',    min: 0, max: 1,   step: 0.05 },
      { key: 'musicVolume',       label: 'Musik-Lautstärke',  min: 0, max: 1,   step: 0.05 },
      { key: 'cameraSensitivity', label: 'Kamera-Empfindlichkeit', min: 0.25, max: 2.5, step: 0.05 },
    ];
    for (const item of items) {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:12px';
      row.innerHTML = `
        <span style="font-size:.9rem">${item.label}</span>
        <input type="range" min="${item.min}" max="${item.max}" step="${item.step}" value="${all[item.key]}" data-key="${item.key}" style="flex:1"/>
        <span style="font-size:.8rem;color:var(--muted);min-width:36px;text-align:right" data-display="${item.key}">${(all[item.key] * 100).toFixed(0)}%</span>
      `;
      rows.appendChild(row);
    }
    // Toggles
    const toggles = [
      { key: 'reduceMotion', label: 'Reduzierte Bewegung (kein Shake/Slowmo)' },
      { key: 'colorblind',   label: 'Farbenblinden-Modus' },
      { key: 'showFPS',      label: 'FPS-Anzeige' },
    ];
    for (const t of toggles) {
      const row = document.createElement('label');
      row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:12px;cursor:pointer';
      row.innerHTML = `
        <span style="font-size:.9rem">${t.label}</span>
        <input type="checkbox" data-key="${t.key}" ${all[t.key] ? 'checked' : ''} />
      `;
      rows.appendChild(row);
    }
    // Wire inputs
    rows.querySelectorAll('input[type=range]').forEach((inp) => {
      inp.oninput = (e) => {
        const v = Number(e.target.value);
        settings.set(inp.dataset.key, v);
        const disp = rows.querySelector(`[data-display="${inp.dataset.key}"]`);
        if (disp) disp.textContent = (v * 100).toFixed(0) + '%';
      };
    });
    rows.querySelectorAll('input[type=checkbox]').forEach((inp) => {
      inp.onchange = (e) => {
        settings.set(inp.dataset.key, e.target.checked);
        this._applyFlags();
      };
    });
  }

  _applyFlags() {
    const all = settings.all();
    document.documentElement.dataset.colorblind = all.colorblind ? '1' : '0';
    document.documentElement.dataset.reduceMotion = all.reduceMotion ? '1' : '0';
    document.documentElement.dataset.showFps = all.showFPS ? '1' : '0';
  }
}
