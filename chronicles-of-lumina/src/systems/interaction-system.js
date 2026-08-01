// systems/interaction-system.js — handles E key for shrine and elder.
// Phase R1: takes `game`.

import { EVENTS } from '../core/constants.js';
import { state } from '../core/state.js';

/**
 * @typedef {import('../core/game.js').Game} Game
 *
 * @typedef {'shrine'|'elder'|null} Interactable
 */

/**
 * Resolves the E-key interaction: shrine-cleanse and elder-dialog.
 * @see EVENTS.SHRINE_CLEANSE
 */
export class InteractionSystem {
  /**
   * @param {Game} game
   */
  constructor(game) {
    this.game = game;
    this.bus = game.bus;
    this.player = game.player;
    this.shrine = game.world.shrine;
    this.elder = game.elder;
    this.dialogueSystem = game.dialogueSystem;
    this.questSystem = game.questSystem;
  }

  /**
   * @returns {Interactable} the closest interactable within reach, or `null`.
   */
  nearestInteractable() {
    if (!this.player) return null;
    const pp = this.player.position;
    if (this.shrine && this.shrine.group) {
      if (pp.distanceTo(this.shrine.group.position) < 4.5) return 'shrine';
    }
    if (this.elder) {
      if (pp.distanceTo(this.elder.position) < 3) return 'elder';
    }
    return null;
  }

  /**
   * Trigger the appropriate interaction. No-op if no target is in range.
   * @returns {void}
   */
  interact() {
    const target = this.nearestInteractable();
    if (!target) return;
    if (target === 'shrine') return this._onShrine();
    if (target === 'elder') return this._onElder();
  }

  _onShrine() {
    if (!this.questSystem.isReady()) {
      this.dialogueSystem.say('Schrein', `Der Schrein ist noch verdorben. Ihm fehlen ${this.questSystem.target - this.questSystem.crystals} Lichtkristalle.`);
      return;
    }
    if (state.bossActive && !this.bossDefeated()) {
      this.dialogueSystem.say('Schrein', 'Der Nebel-Koloss blockiert den Schrein! Besiege ihn zuerst.');
      return;
    }
    this.bus.emit(EVENTS.SHRINE_CLEANSE);
  }

  _onElder() {
    this.dialogueSystem.startIntro();
  }

  bossDefeated() { return state.bossDefeated; }
}
