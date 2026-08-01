// systems/inventory-system.js — tracks item counts. Crystals are quest items
// (also counted by QuestSystem), berries are consumed on pickup.
// Phase R1: takes `game`.

import { state } from '../core/state.js';
import { EVENTS } from '../core/constants.js';

/**
 * @typedef {import('../core/game.js').Game} Game
 */

/**
 * Tracks item counts. Crystals are quest items (also counted by QuestSystem),
 * berries heal the player on pickup.
 * @see EVENTS.INVENTORY_CHANGE
 */
export class InventorySystem {
  /**
   * @param {Game} game
   */
  constructor(game) {
    this.game = game;
    this.bus = game.bus;
    this.player = game.player;
    /** @type {{crystal:number, berry:number}} */
    this.items = { crystal: 0, berry: 0 };
  }

  /**
   * Pick up an item by kind. Berries trigger immediate healing.
   * @param {'crystal'|'berry'} kind
   * @returns {void}
   */
  add(kind) {
    this.items[kind] = (this.items[kind] || 0) + 1;
    if (kind === 'berry') {
      this.player.heal(2);
      state.berriesUsed = (state.berriesUsed || 0) + 1;
    }
    this.bus.emit(EVENTS.INVENTORY_CHANGE, { ...this.items });
  }
}
