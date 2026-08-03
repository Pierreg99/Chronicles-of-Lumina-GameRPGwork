// utils/era-interaction.js — wires E-key near the EraPortal to advance era.
// Triggers the CryoMotion A08 era-transition animation, then advances state.

import { EraPortal } from '../entities/era-portal.js';
import { currentEra, ERAS, advanceEra } from '../core/era.js';
import { state } from '../core/state.js';
import { playEraTransition } from '../ui/era-transition.js';
import { playSfx } from '../engine/audio.js';

/**
 * @param {EraPortal} portal
 * @param {Input} input
 * @param {import('../core/event-bus.js').EventBus} [bus]
 */
export function tickEraInteraction(portal, input, bus) {
  if (!portal || !input) return;
  if (currentEra() >= ERAS.THREE_D) return;
  if (!portal.isPlayerNear(state.playerPos || { x: 0, y: 0, z: 0 })) return;
  if (input.consumeInteract()) {
    const from = currentEra();
    // Run the warp animation; advance state when the animation finishes
    // (about 1.4s in) so the renderer swap is in sync with the flash.
    // Play the era-advance SFX immediately (kicks off the warp)
    playSfx('era_advance');
    playEraTransition(from, from + 1, () => {
      const next = advanceEra();
      if (next !== null) {
        if (bus) bus.emit('era:changed', { from, to: next });
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('era:changed', { detail: { from, to: next } }));
        }
      }
    });
  }
}
