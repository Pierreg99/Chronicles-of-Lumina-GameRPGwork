// core/era.js — visual-era state machine for the Evoland-style demo.
//
// Three eras advance in order: 1 (8-bit) -> 2 (16-bit) -> 3 (3D).
// Each era is a presentation layer: it changes how the same world is rendered
// and what controls are available. Gameplay is identical across eras.

import { state } from './state.js';

/** @typedef {1|2|3} EraId */

export const ERAS = Object.freeze({
  EIGHT_BIT:  1,
  SIXTEEN_BIT: 2,
  THREE_D:     3,
});

/** Era metadata: id, title, palette, movement constraints, render hook name. */
export const ERA_INFO = Object.freeze({
  [ERAS.EIGHT_BIT]: {
    title: 'Acht Bit',
    subtitle: 'NES \u00c4ra (1985) \u2014 Pfeiltasten',
    palette: ['#000000', '#0a0a14', '#1d4d8a', '#9eff9e'],
    pixelSize: 4,
    movement: 'cardinal-4',     // NES: 4 cardinal directions only
    showSpriteOutlines: true,
  },
  [ERAS.SIXTEEN_BIT]: {
    title: 'Sechzehn Bit',
    subtitle: 'SNES \u00c4ra (1992) \u2014 WASD + Magie',
    palette: ['#1d1108', '#c0392b', '#e8d5b0', '#4ea43a', '#3a6fd8'],
    pixelSize: 2,
    movement: 'cardinal-8',     // SNES: 8 directions + magic key
    showSpriteOutlines: true,
  },
  [ERAS.THREE_D]: {
    title: 'Drei Dimensionen',
    subtitle: 'N64 \u00c4ra (1998) \u2014 freie 3D-Kamera',
    palette: ['#0e1116', '#1d4d8a', '#9eff9e', '#f5d04a'],
    pixelSize: 1,
    movement: 'free-3d',        // full analog stick + camera
    showSpriteOutlines: false,
  },
});

/** @returns {EraId} */
export function currentEra() { return /** @type {EraId} */ (state.era ?? 1); }

/** @returns {EraId[]} */
export function allEras() { return [ERAS.EIGHT_BIT, ERAS.SIXTEEN_BIT, ERAS.THREE_D]; }

/**
 * Advance to the next era. Wraps at the last era (no-op).
 * @returns {EraId|null} the new era, or null if already at the last
 */
export function advanceEra() {
  const cur = currentEra();
  if (cur >= ERAS.THREE_D) return null;
  const next = /** @type {EraId} */ (cur + 1);
  state.era = next;
  return next;
}

/** Set the era directly (for save/load + tests). */
export function setEra(e) {
  if (e < 1 || e > 3) throw new Error(`era must be 1, 2 or 3, got ${e}`);
  state.era = /** @type {EraId} */ (e);
}

/** @returns {object} the metadata for the current era */
export function currentEraInfo() { return ERA_INFO[currentEra()]; }
