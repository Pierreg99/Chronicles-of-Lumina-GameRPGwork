// ui/inventory-panel.js — small grid panel toggled with I.
// Phase 5: each item shows a tooltip with name + effect on hover/tap.

import { EVENTS } from '../core/constants.js';
import { screenBus, SCREEN } from '../core/screen-state.js';

const ITEMS = {
  crystal: { name: 'Lichtkristall', desc: 'Quest-Item: 10 reinigen den Schrein.' },
  berry:   { name: 'Heilbeere',     desc: 'Stellt 2 HP sofort wieder her.' },
};

const VISIBLE_SCREENS = new Set([SCREEN.INVENTORY]);

export class InventoryPanel {
  constructor(bus, inventory) {
    this.bus = bus;
    this.inventory = inventory;
    this.visible = false;
    this._build();
    bus.on(EVENTS.INVENTORY_CHANGE, (items) => this._render(items));
    bus.on('inventory:toggle', () => this.toggle());
    screenBus.on('change', ({ to }) => this._apply(to));
    this._apply(SCREEN.START);
  }

  _build() {
    this.host = document.getElementById('inventory-panel');
    if (!this.host) {
      this.host = document.createElement('div');
      this.host.id = 'inventory-panel';
      this.host.className = 'panel';
      Object.assign(this.host.style, {
        top: '160px',
        left: '16px',
        minWidth: '260px',
        display: 'none',
      });
      document.body.appendChild(this.host);
    }
    this.tooltip = document.createElement('div');
    this.tooltip.id = 'item-tooltip';
    Object.assign(this.tooltip.style, {
      position: 'fixed',
      padding: '8px 12px',
      background: 'var(--surface2)',
      border: 'var(--line)',
      borderRadius: 'var(--radius)',
      fontSize: '.8rem',
      color: 'var(--text)',
      pointerEvents: 'none',
      display: 'none',
      zIndex: 20,
      maxWidth: '240px',
    });
    document.body.appendChild(this.tooltip);
  }

  _apply(screen) {
    this.host.style.display = VISIBLE_SCREENS.has(screen) ? 'block' : 'none';
    this.visible = VISIBLE_SCREENS.has(screen);
  }

  toggle() {
    this.bus.emit('inventory:toggle');
  }

  _render(items) {
    this.host.innerHTML = `
      <div style="font-size:.85rem;letter-spacing:.05em;color:var(--muted);margin-bottom:8px">INVENTAR [I zum Schließen]</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${Object.keys(ITEMS).map((id) => `
          <div class="inv-row" data-id="${id}" style="display:flex;justify-content:space-between;padding:8px 12px;background:var(--surface2);border:var(--line);border-radius:8px;cursor:help">
            <span>${ITEMS[id].name}</span>
            <strong>${items[id] || 0}</strong>
          </div>`).join('')}
      </div>`;
    // Attach tooltip handlers
    this.host.querySelectorAll('.inv-row').forEach((row) => {
      const id = row.getAttribute('data-id');
      const show = (e) => {
        this.tooltip.textContent = ITEMS[id].desc;
        this.tooltip.style.display = 'block';
        this.tooltip.style.left = (e.clientX + 14) + 'px';
        this.tooltip.style.top  = (e.clientY + 14) + 'px';
      };
      const hide = () => { this.tooltip.style.display = 'none'; };
      row.addEventListener('mouseenter', show);
      row.addEventListener('mousemove',  show);
      row.addEventListener('mouseleave', hide);
      row.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        this.tooltip.textContent = ITEMS[id].desc;
        this.tooltip.style.display = 'block';
        this.tooltip.style.left = (t.clientX + 14) + 'px';
        this.tooltip.style.top  = (t.clientY + 14) + 'px';
        setTimeout(hide, 2000);
      });
    });
  }
}
