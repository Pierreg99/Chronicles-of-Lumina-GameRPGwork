// core/state.js — global game state. Plain object, mutations via small setters.

/**
 * @typedef {object} KillCounts
 * @property {number} slime_blue
 * @property {number} slime_green
 * @property {number} slime_purple
 * @property {number} boss
 */

/**
 * @typedef {object} GameState
 * @property {'start'|'playing'|'paused'|'dialog'|'inventory'|'codex'|'settings'|'endscreen'} screen
 * @property {'start'|'playing'|'paused'|'dialog'|'inventory'|'codex'|'settings'|'endscreen'} phase  — legacy alias of `screen`
 * @property {number} time
 * @property {number} crystals
 * @property {boolean} bossActive
 * @property {boolean} bossDefeated
 * @property {boolean} shrineClean
 * @property {number} startTime
 * @property {number} endTime
 * @property {KillCounts} killed
 * @property {number} damageDealt
 * @property {number} damageTaken
 * @property {number} cameraYaw
 * @property {Array<object>} inventory
 * @property {Set<string>} flags
 * @property {string|number|null} [dailySeed]
 * @property {number} [dailyIndex]
 * @property {number} [score]
 * @property {number} [berriesUsed]
 */

/** @type {GameState} */
export const state = {
  screen: 'start',
  phase:  'start',
  time: 0,
  crystals: 0,
  bossActive: false,
  bossDefeated: false,
  shrineClean: false,
  startTime: 0,
  endTime: 0,
  killed: { slime_blue: 0, slime_green: 0, slime_purple: 0, boss: 0 },
  damageDealt: 0,
  damageTaken: 0,
  cameraYaw: 0,
  inventory: [],
  flags: new Set(),
  dailySeed: null,
  dailyIndex: 0,
  score: 0,
  berriesUsed: 0,
  // Phase 19+: current zone + map share code
  currentZone: 'verdant',
  visitedZones: new Set(['verdant']),
  mapCode: null,
};

/** @returns {boolean} */
export const isPlaying = () => state.screen === 'playing';

/** @returns {boolean} */
export const isPaused  = () => state.screen === 'paused';

/**
 * Set both `phase` and `screen` to keep them in sync.
 * @param {GameState['screen']} p
 * @returns {void}
 */
export function setPhase(p) {
  state.phase = p;
  state.screen = p;
}
