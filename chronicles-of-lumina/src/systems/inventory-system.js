// systems/inventory-system.js — tracks item counts. Crystals are quest items
// (also counted by QuestSystem), berries are consumed on pickup.

import { state } from '../core/state.js';
import { EVENTS } from '../core/constants.js';

export class InventorySystem {
  constructor(bus, player) {
    this.bus = bus;
    this.player = player;
    this.items = { crystal: 0, berry: 0 };
  }

  add(kind) {
    this.items[kind] = (this.items[kind] || 0) + 1;
    if (kind === 'berry') {
      this.player.heal(2);
      state.berriesUsed = (state.berriesUsed || 0) + 1;
    }
    this.bus.emit(EVENTS.INVENTORY_CHANGE, { ...this.items });
  }
}
