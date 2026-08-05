// tests/daily-challenge.test.mjs — daily challenge system.
import './_setup.mjs';
import {
  getDailyChallenge, getDailySeed,
  listDailyChallenges, totalDailyChallenges,
  dailyProgress, applyDailyBonus,
  loadDailyCompletions, saveDailyCompletions, markDailyComplete, isDailyComplete,
  dailyStreak,
} from '../src/systems/daily-challenge.js';
import { test, group, assert } from './_runner.mjs';

group('daily challenge pool', () => {
  test('has 10+ daily challenges', () => {
    assert.truthy(totalDailyChallenges() >= 10, `only ${totalDailyChallenges()}`);
  });

  test('every challenge has id, name, desc, target, bonus', () => {
    for (const c of listDailyChallenges()) {
      assert.truthy(c.id);
      assert.truthy(c.name);
      assert.truthy(c.desc);
      assert.truthy(c.target);
      assert.truthy(c.target.type);
      assert.truthy(c.target.count > 0);
      assert.truthy(c.bonus);
    }
  });
});

group('getDailyChallenge', () => {
  test('returns same challenge for same date', () => {
    const d = new Date('2026-08-05T00:00:00Z');
    const c1 = getDailyChallenge(d);
    const c2 = getDailyChallenge(d);
    assert.equal(c1.id, c2.id);
  });

  test('returns different challenges for different dates (probabilistic)', () => {
    const ids = new Set();
    for (let i = 0; i < 30; i++) {
      const d = new Date('2026-08-01T00:00:00Z');
      d.setUTCDate(d.getUTCDate() + i);
      ids.add(getDailyChallenge(d).id);
    }
    // With 10 challenges and 30 days, we should see at least 5 distinct
    assert.truthy(ids.size >= 5, `only ${ids.size} unique in 30 days`);
  });

  test('result has dayKey, date, and challenge fields', () => {
    const c = getDailyChallenge(new Date('2026-08-05T00:00:00Z'));
    assert.truthy(c.dayKey);
    assert.truthy(c.date);
  });
});

group('getDailySeed', () => {
  test('returns same seed for same date', () => {
    const d = new Date('2026-08-05T00:00:00Z');
    const s1 = getDailySeed(d);
    const s2 = getDailySeed(d);
    assert.equal(s1, s2);
  });

  test('returns different seeds for different dates', () => {
    const d1 = new Date('2026-08-05T00:00:00Z');
    const d2 = new Date('2026-08-06T00:00:00Z');
    assert.truthy(getDailySeed(d1) !== getDailySeed(d2));
  });
});

group('dailyProgress', () => {
  test('returns 0 for empty state', () => {
    const c = listDailyChallenges()[0];
    const p = dailyProgress(c, {});
    assert.equal(p.progress, 0);
    assert.falsy(p.done);
  });

  test('returns 1 when target met', () => {
    const c = listDailyChallenges().find((x) => x.target.type === 'kill');
    const state = { kills: c.target.count };
    const p = dailyProgress(c, state);
    assert.equal(p.progress, 1);
    assert.truthy(p.done);
  });

  test('returns fractional progress', () => {
    const c = listDailyChallenges().find((x) => x.target.type === 'kill');
    const state = { kills: Math.floor(c.target.count / 2) };
    const p = dailyProgress(c, state);
    assert.equal(p.progress, 0.5);
  });

  test('clamps at 1.0', () => {
    const c = listDailyChallenges().find((x) => x.target.type === 'kill');
    const state = { kills: c.target.count * 5 };
    const p = dailyProgress(c, state);
    assert.equal(p.progress, 1);
  });
});

group('applyDailyBonus', () => {
  test('adds bonus xp and gold', () => {
    const c = listDailyChallenges()[0];
    const state = { xp: 1000, gold: 500 };
    const bonus = applyDailyBonus(c, state);
    assert.truthy(bonus.xp > 0);
    assert.truthy(bonus.gold > 0);
    assert.equal(state.xp, 1000 + bonus.xp);
    assert.equal(state.gold, 500 + bonus.gold);
  });

  test('returns 0s for null challenge', () => {
    const state = { xp: 1000, gold: 500 };
    const bonus = applyDailyBonus(null, state);
    assert.equal(bonus.xp, 0);
    assert.equal(bonus.gold, 0);
  });
});

group('daily completions', () => {
  test('isDailyComplete returns false initially', () => {
    saveDailyCompletions({});
    assert.falsy(isDailyComplete(new Date('2030-01-01')));
  });

  test('markDailyComplete makes isDailyComplete return true', () => {
    const d = new Date('2030-01-01T00:00:00Z');
    markDailyComplete(d, 'c_test');
    assert.truthy(isDailyComplete(d));
  });

  test('dailyStreak counts consecutive days', () => {
    // Clear first
    saveDailyCompletions({});
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    for (let i = 0; i < 3; i++) {
      const d = new Date(today.getTime() - i * 86400000);
      markDailyComplete(d, 'c_test');
    }
    assert.equal(dailyStreak(), 3);
  });

  test('dailyStreak breaks on gap', () => {
    saveDailyCompletions({});
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    // Mark today, then 3 days gap, then 1 day
    markDailyComplete(today, 'c_test');
    const d3 = new Date(today.getTime() - 3 * 86400000);
    markDailyComplete(d3, 'c_test');
    // Today counts, but day-1 and day-2 are missing, so streak = 1
    assert.equal(dailyStreak(), 1);
  });
});
