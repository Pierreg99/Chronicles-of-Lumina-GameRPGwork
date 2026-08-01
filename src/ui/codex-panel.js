// ui/codex-panel.js — Tabs for Gegner / Items / Orte. Renders all entries
// from the CodexSystem; unlocked entries are highlighted, locked ones greyed
// out with "???" instead of a name.

import { screenBus, SCREEN } from '../core/screen-state.js';
import { EVENTS } from '../core/constants.js';

const TABS = ['Gegner', 'Items', 'Orte', 'Boss'];

const VISIBLE_SCREENS = new Set([SCREEN.INVENTORY]); // codex shares the inventory screen

export class CodexPanel {
  constructor(bus, codex) {
    this.bus = bus;
    this.codex = codex;
    this.activeTab = 'Gegner';
    this._build();
    this._render();

    bus.on(EVENTS.CODEX_UNLOCK, () => this._flash());
    bus.on('codex:tab', (tab) => { this.activeTab = tab; this._render(); });
    screenBus.on('change', ({ to }) => this._apply(to));
    this._apply(SCREEN.START);
  }

  _build() {
    this.host = document.createElement('div');
    this.host.id = 'codex-panel';
    Object.assign(this.host.style, {
      position: 'fixed',
      top: '160px',
      right: '16px',
      minWidth: '320px',
      maxWidth: '360px',
      maxHeight: '60vh',
      overflowY: 'auto',
      padding: '16px 20px',
      background: 'var(--surface)',
      border: 'var(--line)',
      borderRadius: 'var(--radius)',
      zIndex: 10,
      display: 'none',
    });

    this.header = document.createElement('div');
    Object.assign(this.header.style, {
      fontSize: '.85rem',
      letterSpacing: '.05em',
      color: 'var(--muted)',
      marginBottom: '10px',
      display: 'flex',
      justifyContent: 'space-between',
    });

    this.tabs = document.createElement('div');
    Object.assign(this.tabs.style, {
      display: 'flex',
      gap: '4px',
      marginBottom: '12px',
      flexWrap: 'wrap',
    });

    this.list = document.createElement('div');
    Object.assign(this.list.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    });

    this.host.appendChild(this.header);
    this.host.appendChild(this.tabs);
    this.host.appendChild(this.list);
    document.body.appendChild(this.host);
  }

  _apply(screen) {
    this.host.style.display = VISIBLE_SCREENS.has(screen) ? 'block' : 'none';
  }

  _render() {
    const progress = this.codex.progress();
    this.header.innerHTML = `
      <span>CODEX <span style="color:var(--accent)">[C]</span></span>
      <span>${progress.unlocked} / ${progress.total}</span>`;

    this.tabs.innerHTML = '';
    const cats = ['Gegner', 'Items', 'Orte', 'Boss'];
    for (const c of cats) {
      const b = document.createElement('button');
      b.className = 'btn';
      b.textContent = c;
      b.style.cssText = c === this.activeTab
        ? 'padding:4px 10px;font-size:.75rem;min-height:0;background:var(--accent);border-color:var(--accent)'
        : 'padding:4px 10px;font-size:.75rem;min-height:0';
      b.onclick = () => { this.activeTab = c; this._render(); };
      this.tabs.appendChild(b);
    }

    const entries = this.codex.getAll().filter((e) => e.category === this.activeTab);
    this.list.innerHTML = '';
    for (const e of entries) {
      const row = document.createElement('div');
      const style = e.unlocked
        ? 'background:var(--surface2);border:var(--line);border-radius:8px;padding:8px 12px'
        : 'background:rgba(0,0,0,0.3);border:1px dashed var(--border);border-radius:8px;padding:8px 12px;opacity:.6';
      row.style.cssText = style;
      row.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:${e.unlocked ? '4px' : '0'}">
          <strong style="font-size:.9rem;color:${e.unlocked ? 'var(--text)' : 'var(--muted)'}">${e.unlocked ? e.name : '???'}</strong>
          <span style="font-size:.7rem;color:var(--muted)">${e.category}</span>
        </div>
        ${e.unlocked ? `<div style="font-size:.8rem;color:var(--muted);line-height:1.4">${e.desc}</div>` : ''}`;
      this.list.appendChild(row);
    }
  }

  _flash() {
    this._render();
    if (this.host.style.display === 'none') return;
    this.host.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.04)' }, { transform: 'scale(1)' }],
      { duration: 500, easing: 'ease-out' }
    );
  }
}
