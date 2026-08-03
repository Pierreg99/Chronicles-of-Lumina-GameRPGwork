// utils/era-interaction.js — wires E-key near the EraPortal to advance era.
// Lives outside the main interaction system so it doesn't fight with shrine/elder.

import { EraPortal } from '../entities/era-portal.js';
import { currentEra, ERAS } from '../core/era.js';
import { state } from '../core/state.js';
import { settings } from '../core/settings.js';
import { t } from '../core/i18n.js';

/**
 * @param {EraPortal} portal
 * @param {Input} input
 */
export function tickEraInteraction(portal, input) {
  if (!portal || !input) return;
  if (currentEra() >= ERAS.THREE_D) return;
  if (!portal.isPlayerNear(state.playerPos || { x: 0, y: 0, z: 0 })) return;
  if (input.consumeInteract()) {
    portal.interact();
  }
}
