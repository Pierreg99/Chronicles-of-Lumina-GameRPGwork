// ui/era-indicator.js — small HUD widget showing the current era and the
// progress to the next one. Subtle top-right corner, era-themed styling.

import { ERA_INFO, currentEra, allEras, ERAS, advanceEra } from '../core/era.js';
import { t } from '../core/i18n.js';

export class EraIndicator {
  /**
   * @param {import('../core/event-bus.js').EventBus} bus
   */
  constructor(bus) {
    this.bus = bus;
    this.el = document.createElement('div');
    this.el.id = 'era-indicator';
    Object.assign(this.el.style, {
      position: 'fixed', top: '10px', right: '10px', zIndex: '200',
      padding: '6px 10px', borderRadius: '6px',
      background: 'rgba(0,0,0,0.55)', color: '#9eff9e',
      font: '11px/1.3 ui-monospace, Menlo, Consolas, monospace',
      pointerEvents: 'none', userSelect: 'none',
      border: '1px solid #1d4d8a', minWidth: '160px',
    });
    document.body.appendChild(this.el);
    this._render();
    bus.on('era:changed', () => this._render());
  }

  _render() {
    const era = currentEra();
    const info = ERA_INFO[era];
    const idx = allEras().indexOf(era);
    const total = allEras().length;
    const dots = allEras().map((e, i) => i <= idx ? '\u25cf' : '\u25cb').join(' ');
    this.el.innerHTML = `
      <div style="font-size:10px;opacity:.6;letter-spacing:1px">\u00c4RA</div>
      <div style="font-size:14px;font-weight:600;margin:1px 0 2px">${info.title}</div>
      <div style="font-size:10px;opacity:.75;line-height:1.3">${info.subtitle}</div>
      <div style="margin-top:4px;font-size:13px;letter-spacing:4px">${dots}</div>
    `;
  }

  destroy() { this.el.remove(); }
}
