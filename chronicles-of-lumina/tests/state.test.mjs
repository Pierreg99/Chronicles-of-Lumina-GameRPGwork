// tests/state.test.mjs — global game state.
import './_setup.mjs';
import { state, isPlaying, isPaused, setPhase } from '../src/core/state.js';
import { test, group, assert, done } from './_runner.mjs';

// Reset all mutable state fields to known defaults before each test.
// `state` is shared across all test files in the runner process, so earlier
// tests (especially loop.test.mjs) can have advanced state.time.
function resetState() {
  state.screen = 'start';
  state.phase = 'start';
  state.time = 0;
  state.crystals = 0;
  state.bossActive = false;
  state.bossDefeated = false;
  state.shrineClean = false;
  state.startTime = 0;
  state.endTime = 0;
  state.killed = { slime_blue: 0, slime_green: 0, slime_purple: 0, boss: 0 };
  state.damageDealt = 0;
  state.damageTaken = 0;
  state.inventory = [];
  state.flags = new Set();
}

group('state', () => {
  test('initial shape has all expected keys', () => {
    const keys = ['screen', 'phase', 'time', 'crystals', 'bossActive', 'bossDefeated',
                  'shrineClean', 'startTime', 'endTime', 'killed', 'damageDealt',
                  'damageTaken', 'cameraYaw', 'inventory', 'flags', 'dailySeed',
                  'dailyIndex', 'score', 'berriesUsed'];
    for (const k of keys) assert.truthy(k in state, `missing key: ${k}`);
  });

  test('initial values are zero/false/empty', () => {
    resetState();
    assert.equal(state.time, 0);
    assert.equal(state.crystals, 0);
    assert.equal(state.bossActive, false);
    assert.equal(state.bossDefeated, false);
    assert.equal(state.shrineClean, false);
    assert.equal(state.damageDealt, 0);
    assert.equal(state.damageTaken, 0);
    assert.equal(state.inventory.length, 0);
    assert.equal(state.flags.size, 0);
  });

  test('isPlaying() and isPaused() reflect screen', () => {
    resetState();
    state.screen = 'playing';
    assert.equal(isPlaying(), true);
    assert.equal(isPaused(), false);
    state.screen = 'paused';
    assert.equal(isPlaying(), false);
    assert.equal(isPaused(), true);
    state.screen = 'start';
    assert.equal(isPlaying(), false);
    assert.equal(isPaused(), false);
  });

  test('setPhase() updates both phase and screen in sync', () => {
    resetState();
    setPhase('playing');
    assert.equal(state.screen, 'playing');
    assert.equal(state.phase, 'playing');
    setPhase('endscreen');
    assert.equal(state.screen, 'endscreen');
    assert.equal(state.phase, 'endscreen');
  });

  test('killed counts start at 0 for all enemy types', () => {
    resetState();
    assert.equal(state.killed.slime_blue, 0);
    assert.equal(state.killed.slime_green, 0);
    assert.equal(state.killed.slime_purple, 0);
    assert.equal(state.killed.boss, 0);
  });
});

done();
