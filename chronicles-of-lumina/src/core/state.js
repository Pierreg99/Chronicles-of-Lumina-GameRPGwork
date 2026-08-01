// core/state.js — global game state. Plain object, mutations via small setters.

export const state = {
  screen: 'start',                 // see core/screen-state.js for valid values
  phase:  'start',                 // legacy alias of screen, kept for back-compat
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
};

export const isPlaying = () => state.screen === 'playing';
export const isPaused  = () => state.screen === 'paused';

export function setPhase(p) {
  state.phase = p;
  state.screen = p;
}
