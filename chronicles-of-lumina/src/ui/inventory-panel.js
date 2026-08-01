// ui/inventory-panel.js — small grid panel toggled with I. Minimal v1: shows
// counts only. Renders into a single host element if present.

import { EVENTS } from '../core/constants.js';

export class InventoryPanel {
  constructor(bus, inventory) {
    this.bus = bus;
    this.inventory = inventory;
    this.visible = false;
    bus.on(EVENTS.INVENTORY_CHANGE, (items) => this.render(items));
  }

  toggle() {
    this.visible = !this.visible;
    const el = document.getElementById('inventory-panel');
    if (el) el.style.display = this.visible ? 'block' : 'none';
    if (this.visible) this.render(this.inventory.items);
  }

  render(items) {
    let host = document.getElementById('inventory-panel');
    if (!host) {
      host = document.createElement('div');
      host.id = 'inventory-panel';
      host.className = 'panel';
      host.style.cssText = 'top:160px;left:16px;min-width:220px;display:none';
      document.body.appendChild(host);
    }
    host.innerHTML = `
      <div style="font-size:.85rem;letter-spacing:.05em;color:var(--muted);margin-bottom:8px">INVENTAR</div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <div>Lichtkristalle: <strong>${items.crystal || 0}</strong></div>
        <div>Heilbeeren: <strong>${items.berry || 0}</strong></div>
      </div>`;
  }
}
