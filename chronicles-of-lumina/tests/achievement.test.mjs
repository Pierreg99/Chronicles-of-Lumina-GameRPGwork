// tests/achievement.test.mjs — achievement registry + unlock logic.
import './_setup.mjs';
import {
  ACHIEVEMENT_CATEGORIES,
  getAchievement, listAchievements, listAchievementsByCategory,
  totalAchievements, checkAchievements, achievementProgress,
} from '../src/systems/achievement.js';
import { test, group, assert } from './_runner.mjs';

group('achievement categories', () => {
  test('has 5 categories', () => {
    assert.equal(Object.keys(ACHIEVEMENT_CATEGORIES).length, 5);
    for (const id of ['combat', 'exploration', 'crafting', 'progression', 'secret']) {
      assert.truthy(ACHIEVEMENT_CATEGORIES[id.toUpperCase()], `${id} missing`);
    }
  });
});

group('achievement registry', () => {
  test('has 50+ achievements', () => {
    assert.truthy(totalAchievements() >= 50, `only ${totalAchievements()}`);
  });

  test('every achievement has id, name, desc, category, condition', () => {
    for (const a of listAchievements()) {
      assert.truthy(a.id, 'id');
      assert.truthy(a.name, 'name');
      assert.truthy(a.desc, 'desc');
      assert.truthy(ACHIEVEMENT_CATEGORIES[a.category.toUpperCase()], 'category');
      assert.equal(typeof a.condition, 'function', 'condition is function');
    }
  });

  test('category counts are reasonable', () => {
    const combat = listAchievementsByCategory('combat').length;
    const exploration = listAchievementsByCategory('exploration').length;
    const crafting = listAchievementsByCategory('crafting').length;
    const progression = listAchievementsByCategory('progression').length;
    const secret = listAchievementsByCategory('secret').length;
    assert.truthy(combat >= 5, `combat: ${combat}`);
    assert.truthy(exploration >= 5, `exploration: ${exploration}`);
    assert.truthy(crafting >= 5, `crafting: ${crafting}`);
    assert.truthy(progression >= 5, `progression: ${progression}`);
    assert.truthy(secret >= 3, `secret: ${secret}`);
  });
});

group('checkAchievements', () => {
  test('returns newly-unlocked ids', () => {
    const state = { kills: 1, visitedZones: new Set(['verdant']) };
    const already = new Set();
    const newly = checkAchievements(state, already);
    assert.truthy(newly.includes('ach_first_blood'));
    assert.truthy(newly.includes('ach_first_zone'));
  });

  test('skips already-unlocked achievements', () => {
    const state = { kills: 1 };
    const already = new Set(['ach_first_blood']);
    const newly = checkAchievements(state, already);
    assert.falsy(newly.includes('ach_first_blood'));
  });

  test('returns empty array when nothing new', () => {
    const state = { kills: 0, visitedZones: new Set() };
    const newly = checkAchievements(state, new Set());
    assert.equal(newly.length, 0);
  });

  test('handles predicate errors gracefully', () => {
    const state = {};
    const ach = getAchievement('ach_first_blood');
    const original = ach.condition;
    ach.condition = () => { throw new Error('boom'); };
    // Should not throw
    const newly = checkAchievements(state, new Set());
    assert.truthy(Array.isArray(newly));
    ach.condition = original;
  });
});

group('achievementProgress', () => {
  test('returns 0 for incomplete binary achievement', () => {
    const ach = getAchievement('ach_first_blood');
    const p = achievementProgress(ach, { kills: 0 });
    assert.equal(p, 0);
  });

  test('returns 1 for complete achievement', () => {
    const ach = getAchievement('ach_first_blood');
    const p = achievementProgress(ach, { kills: 5 });
    assert.equal(p, 1);
  });

  test('returns progress fraction for numeric achievements', () => {
    const ach = getAchievement('ach_slayer_10');
    const p = achievementProgress(ach, { kills: 5 });
    assert.equal(p, 0.5);
  });

  test('clamps progress at 1.0', () => {
    const ach = getAchievement('ach_slayer_10');
    const p = achievementProgress(ach, { kills: 50 });
    assert.equal(p, 1);
  });
});
