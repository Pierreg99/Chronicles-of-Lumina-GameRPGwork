// systems/interaction-system.js — handles E key for shrine, elder, and
// zone portals. Phase 19+: portals are a third interaction target.

import { EVENTS } from '../core/constants.js';
import { state } from '../core/state.js';
import { findPortalAt } from '../world/zone-portal.js';

/**
 * @typedef {import('../core/game.js').Game} Game
 *
 * @typedef {'shrine'|'elder'|'portal'|null} Interactable
 */

/**
 * Resolves the E-key interaction: shrine-cleanse, elder-dialog, and
 * zone-portal-teleport.
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
    this.portals = (game.world && game.world.portals) || [];
    this.zonePicker = game.zonePicker;
  }

  /**
   * @returns {Interactable} the closest interactable within reach, or `null`.
   */
  nearestInteractable() {
    if (!this.player) return null;
    const pp = this.player.position;
    // Portals take priority (player intent is usually "step through")
    if (this.portals.length) {
      const p = findPortalAt(this.portals, pp, 1.8);
      if (p) return 'portal';
    }
    if (this.shrine && this.shrine.group) {
      if (pp.distanceTo(this.shrine.group.position) < 4.5) return 'shrine';
    }
    if (this.elder) {
      if (pp.distanceTo(this.elder.position) < 3) return 'elder';
    }
    return null;
  }

  /**
   * @returns {{ type: Interactable, target: any } | null} the nearest
   *   interactable with its payload, or null. Used by InteractionHint
   *   to show the right label.
   */
  nearestWithPayload() {
    if (!this.player) return null;
    const pp = this.player.position;
    if (this.portals.length) {
      const p = findPortalAt(this.portals, pp, 1.8);
      if (p) return { type: 'portal', target: p };
    }
    if (this.shrine && this.shrine.group) {
      if (pp.distanceTo(this.shrine.group.position) < 4.5) return { type: 'shrine', target: this.shrine };
    }
    if (this.elder) {
      if (pp.distanceTo(this.elder.position) < 3) return { type: 'elder', target: this.elder };
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
    if (target === 'portal') return this._onPortal();
  }

  _onPortal() {
    const result = this.nearestWithPayload();
    if (!result || result.type !== 'portal') return;
    const targetZoneId = result.target.targetZone;
    this.bus.emit(EVENTS.ZONE_CHANGE, { zoneId: targetZoneId, source: 'portal' });
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
