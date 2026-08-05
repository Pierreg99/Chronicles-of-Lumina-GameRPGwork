// tests/endgame.test.mjs — endless mode, hardcore, challenges,
// leaderboard.
import './_setup.mjs';
import {
  CHALLENGE_MODES, DIFFICULTY,
  applyChallenge, isAlive, endlessWaveState,
  loadLeaderboard, saveLeaderboard, addLeaderboardEntry,
  getTopScores, clearLeaderboard, computeRunScore,
  totalChallengeModes,
} from '../src/systems/endgame.js';
import { test, group, assert } from './_runner.mjs';

group('challenge modes', () => {
  test('has 10 challenge modes', () => {
    assert.truthy(totalChallengeModes() >= 10);
  });

  test('every challenge has id, name, desc, rules', () => {
    for (const [id, m] of Object.entries(CHALLENGE_MODES)) {
      assert.truthy(m.id, `${id} id`);
      assert.truthy(m.name, `${id} name`);
      assert.truthy(m.desc, `${id} desc`);
      assert.truthy(m.rules && typeof m.rules === 'object', `${id} rules`);
    }
  });

  test('has at least 3 difficulty levels', () => {
    assert.truthy(Object.keys(DIFFICULTY).length >= 3);
  });
});

group('applyChallenge', () => {
  test('returns state unchanged for unknown mode', () => {
    const state = { hp: 10 };
    const out = applyChallenge('not_a_mode', state);
    assert.equal(out, state);
  });

  test('glass_cannon sets hp to 1', () => {
    const state = { hp: 10 };
    const out = applyChallenge('glass_cannon', state);
    assert.equal(out.hp, 1);
  });

  test('speedrun sets time limit', () => {
    const state = { hp: 10 };
    const out = applyChallenge('speedrun', state);
    assert.equal(out.timeLimit, 600);
  });

  test('hardcore sets hardcore flag', () => {
    const state = { hp: 10 };
    const out = applyChallenge('hardcore', state);
    assert.equal(out.challenge, 'hardcore');
  });
});

group('isAlive', () => {
  test('true in normal mode with hp > 0', () => {
    assert.truthy(isAlive({ hp: 5 }, null));
  });

  test('false when hp <= 0', () => {
    assert.falsy(isAlive({ hp: 0 }));
  });

  test('hardcore: false after 1 death', () => {
    assert.falsy(isAlive({ hp: 5, deaths: 1 }, 'hardcore'));
  });

  test('hardcore: true with 0 deaths', () => {
    assert.truthy(isAlive({ hp: 5, deaths: 0 }, 'hardcore'));
  });
});

group('endlessWaveState', () => {
  test('wave 1 is base difficulty', () => {
    const s = endlessWaveState(1);
    assert.equal(s.enemyHpMul, 1);
    assert.equal(s.enemyDmgMul, 1);
  });

  test('wave 10 doubles difficulty', () => {
    const s = endlessWaveState(10);
    assert.equal(s.enemyHpMul, 1.9);
    assert.equal(s.enemyDmgMul, 1.72);
  });

  test('enemy count caps at 50', () => {
    const s = endlessWaveState(200);
    assert.equal(s.enemyCount, 50);
  });

  test('higher waves give more xp', () => {
    const s5 = endlessWaveState(5);
    const s50 = endlessWaveState(50);
    assert.truthy(s50.xpMul > s5.xpMul);
  });
});

group('leaderboard', () => {
  test('loadLeaderboard returns [] on no data', () => {
    clearLeaderboard();
    const entries = loadLeaderboard();
    assert.equal(entries.length, 0);
  });

  test('addLeaderboardEntry appends and persists', () => {
    clearLeaderboard();
    addLeaderboardEntry({ name: 'A', score: 100, mode: 'endless', wave: 5, level: 3, kills: 10 });
    const entries = loadLeaderboard();
    assert.equal(entries.length, 1);
    assert.equal(entries[0].name, 'A');
    assert.equal(entries[0].score, 100);
  });

  test('getTopScores sorts by score desc', () => {
    clearLeaderboard();
    addLeaderboardEntry({ name: 'A', score: 100 });
    addLeaderboardEntry({ name: 'B', score: 500 });
    addLeaderboardEntry({ name: 'C', score: 200 });
    const top = getTopScores();
    assert.equal(top[0].name, 'B');
    assert.equal(top[1].name, 'C');
    assert.equal(top[2].name, 'A');
  });

  test('getTopScores can filter by mode', () => {
    clearLeaderboard();
    addLeaderboardEntry({ name: 'A', score: 100, mode: 'endless' });
    addLeaderboardEntry({ name: 'B', score: 200, mode: 'hardcore' });
    addLeaderboardEntry({ name: 'C', score: 300, mode: 'endless' });
    const top = getTopScores(10, 'endless');
    assert.equal(top.length, 2);
    assert.equal(top[0].name, 'C');
  });

  test('clearLeaderboard empties the board', () => {
    addLeaderboardEntry({ name: 'X', score: 50 });
    clearLeaderboard();
    assert.equal(loadLeaderboard().length, 0);
  });
});

group('computeRunScore', () => {
  test('weights kills, wave, level, time', () => {
    const run = { kills: 5, wave: 3, time: 60, level: 2 };
    const score = computeRunScore(run);
    // 50 + 300 + 2700 + 100 = 3150
    assert.equal(score, 3150);
  });

  test('time bonus decays to 0 at 10 minutes', () => {
    const run = { kills: 0, wave: 0, time: 600, level: 0 };
    const score = computeRunScore(run);
    assert.equal(score, 0);
  });

  test('handles missing fields — time defaults to 0 (full time bonus)', () => {
    // With time=0 the player gets the full 3000 time bonus,
    // but no kills/wave/level score. So 3000.
    assert.equal(computeRunScore({}), 3000);
  });

  test('time=undefined is treated as instant = full bonus', () => {
    const s1 = computeRunScore({ time: undefined });
    const s2 = computeRunScore({ time: 0 });
    assert.equal(s1, s2);
  });
});
