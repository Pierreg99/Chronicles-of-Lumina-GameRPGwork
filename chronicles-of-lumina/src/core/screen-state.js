// core/screen-state.js — explicit UI state machine with transition rules.
//
//   import { screenState, SCREEN, transition } from './core/screen-state.js';
//   transition(SCREEN.PLAYING);
//
// The old `state.phase` string is replaced by an enum. Listeners subscribe
// to SCREEN_CHANGE and read the new screen from the payload. This makes
// "what's on screen right now" a single source of truth and keeps transitions
// from getting out of sync (e.g., showing the pause menu while playing).

import { state } from './state.js';
import { EventBus } from './event-bus.js';

export const SCREEN = Object.freeze({
  START:     'start',
  PLAYING:   'playing',
  PAUSED:    'paused',
  DIALOG:    'dialog',
  INVENTORY: 'inventory',
  ENDScreen: 'endscreen',
});

const VALID_TRANSITIONS = {
  start:     ['playing', 'endscreen'],
  playing:   ['paused', 'dialog', 'inventory', 'endscreen'],
  paused:    ['playing', 'endscreen'],
  dialog:    ['playing', 'endscreen'],
  inventory: ['playing', 'endscreen'],
  endscreen: ['start', 'playing'],
};

export const screenBus = new EventBus();

export function transition(to) {
  const from = state.screen;
  if (from === to) return false;
  if (!VALID_TRANSITIONS[from] || !VALID_TRANSITIONS[from].includes(to)) {
    console.warn(`[screen-state] invalid transition ${from} → ${to}`);
    return false;
  }
  state.screen = to;
  screenBus.emit('change', { from, to });
  return true;
}

// Initialize
state.screen = SCREEN.START;

export function currentScreen() { return state.screen; }
