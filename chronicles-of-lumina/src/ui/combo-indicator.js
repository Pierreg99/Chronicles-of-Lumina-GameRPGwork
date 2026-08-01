// ui/combo-indicator.js — small SVG arc above the player (or anchored in
// the HUD) that fills as the player chains hits.
//
//   ┌─○─────┐   step 0 (no combo)
//   ├─◐─────┤   step 1
//   ├─◑─────┤   step 2
//   └─◉─────┘   step 3 (max)
//
// Listens to COMBO_HIT and COMBO_BREAK on the bus.

import { EVENTS } from '../core/constants.js';
import { CONFIG } from '../core/config.js';
import { screenBus, SCREEN } from '../core/screen-state.js';

const VISIBLE_SCREENS = new Set([SCREEN.PLAYING, SCREEN.DIALOG]);

export class ComboIndicator {
  constructor(bus) {
    this.bus = bus;
    this.step = 0;
    this.lastHitAt = -Infinity;
    this.t = 0;

    this._build();
    bus.on(EVENTS.COMBO_HIT,   () => this._onHit());
    bus.on(EVENTS.COMBO_BREAK, () => this._onBreak());
    bus.on('tick', () => this._onTick());
    screenBus.on('change', ({ to }) => this._apply(to));
    this._apply(SCREEN.START);
  }

  _build() {
    this.el = document.createElement('div');
    this.el.id = 'combo-indicator';
    this.el.innerHTML = `
      <svg viewBox="0 0 60 60" width="60" height="60">
        <circle cx="30" cy="30" r="24" fill="rgba(0,0,0,0.45)" stroke="#3a3f45" stroke-width="2"/>
        <path id="combo-arc" d="" fill="none" stroke="#2f7bff" stroke-width="4" stroke-linecap="round"/>
        <text id="combo-text" x="30" y="36" text-anchor="middle" font-size="18" font-weight="700" fill="#e7ecf3" font-family="system-ui">·</text>
      </svg>`;
    Object.assign(this.el.style, {
      position: 'fixed',
      top: '180px',
      left: '16px',
      zIndex: 11,
      pointerEvents: 'none',
      display: 'none',
    });
    document.body.appendChild(this.el);
    this.arc = this.el.querySelector('#combo-arc');
    this.text = this.el.querySelector('#combo-text');
  }

  _apply(screen) {
    this.el.style.display = VISIBLE_SCREENS.has(screen) ? 'block' : 'none';
  }

  _onHit() {
    this.step = Math.min(CONFIG.combo.maxSteps, this.step + 1);
    this.lastHitAt = this.t;
    this._render();
  }

  _onBreak() {
    this.step = 0;
    this._render();
  }

  _onTick() {
    this.t += 1 / 60; // approx
    const sinceHit = this.t - this.lastHitAt;
    if (this.step > 0 && sinceHit > CONFIG.combo.windowSec) {
      this.step = Math.max(0, this.step - 1);
      this.lastHitAt = this.t; // re-arm decay timer for next step
      this._render();
    }
  }

  _render() {
    if (!this.arc) return;
    const max = CONFIG.combo.maxSteps;
    const filled = (this.step / max);
    // Arc from 12 o'clock (angle = -90°), sweeping clockwise.
    const start = -Math.PI / 2;
    const end = start + filled * Math.PI * 2;
    const r = 22, cx = 30, cy = 30;
    if (this.step === 0) {
      this.arc.setAttribute('d', '');
    } else if (filled >= 1) {
      // Full circle (drawn as two arcs)
      this.arc.setAttribute('d', `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r}`);
    } else {
      const x1 = cx + Math.cos(start) * r;
      const y1 = cy + Math.sin(start) * r;
      const x2 = cx + Math.cos(end) * r;
      const y2 = cy + Math.sin(end) * r;
      const large = filled > 0.5 ? 1 : 0;
      this.arc.setAttribute('d', `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`);
    }
    // Color escalates with combo level
    const colors = ['#2f7bff', '#5ad1ff', '#ffd23f', '#ff8a4a'];
    const c = colors[Math.min(colors.length - 1, this.step)];
    this.arc.setAttribute('stroke', c);
    this.text.textContent = this.step > 0 ? 'x' + this.step : '·';
    this.text.setAttribute('fill', c);
  }
}
