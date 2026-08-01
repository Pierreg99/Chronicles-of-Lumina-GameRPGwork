// tests/screen-state.test.mjs — UI state-machine + transitions.
import './_setup.mjs';
import { state } from '../src/core/state.js';
import { SCREEN, transition, currentScreen, screenBus } from '../src/core/screen-state.js';
import { test, group, assert, done } from './_runner.mjs';

// Helper: force a known starting screen (state.screen is shared across tests).
const resetTo = (s) => { state.screen = s; };

group('screen-state', () => {
  test('SCREEN is a frozen enum of valid screen names', () => {
    assert.equal(typeof SCREEN, 'object');
    assert.equal(Object.isFrozen(SCREEN), true);
    assert.equal(SCREEN.START, 'start');
    assert.equal(SCREEN.PLAYING, 'playing');
    assert.equal(SCREEN.PAUSED, 'paused');
    assert.equal(SCREEN.ENDSCREEN, 'endscreen');
  });

  test('transition() emits change event with from/to', () => {
    resetTo(SCREEN.START);
    let captured = null;
    screenBus.on('change', (e) => { captured = e; });
    const ok = transition(SCREEN.PLAYING);
    assert.equal(ok, true);
    assert.equal(captured.from, 'start');
    assert.equal(captured.to, 'playing');
  });

  test('transition() rejects invalid moves and returns false', () => {
    resetTo(SCREEN.START);
    // start → inventory is not a legal edge
    const ok = transition(SCREEN.INVENTORY);
    assert.equal(ok, false);
    assert.equal(currentScreen(), 'start');
  });

  test('transition() no-op when from === to', () => {
    resetTo(SCREEN.START);
    let n = 0;
    screenBus.on('change', () => n++);
    const ok = transition(SCREEN.START);
    assert.equal(ok, false);
    assert.equal(n, 0);
  });
});

done();
