// tests/new-game-plus.test.mjs — New Game+ carry-over, scaling, tiers.
import './_setup.mjs';
import {
  NG_TIERS, getTier, startNewGamePlus, ngPlusLevel, ngPlusSummary,
  isNGPlusUnlocked, MAX_NG_PLUS, CARRY_OVER, RESETS,
} from '../src/systems/new-game-plus.js';
import { test, group, assert } from './_runner.mjs';

group('NG+ tiers', () => {
  test('has 6 tiers (0-5)', () => {
    assert.equal(Object.keys(NG_TIERS).length, 6);
  });

  test('tier 0 is base difficulty', () => {
    const t = getTier(0);
    assert.equal(t.enemyHpMul, 1.0);
    assert.equal(t.enemyDmgMul, 1.0);
  });

  test('higher tiers scale up', () => {
    const t1 = getTier(1);
    const t5 = getTier(5);
    assert.truthy(t5.enemyHpMul > t1.enemyHpMul);
    assert.truthy(t5.enemyDmgMul > t1.enemyDmgMul);
  });

  test('clamps to max tier', () => {
    const t10 = getTier(10);
    const t5 = getTier(5);
    assert.equal(t10.enemyHpMul, t5.enemyHpMul);
  });

  test('clamps negative to 0', () => {
    const tNeg = getTier(-1);
    assert.equal(tNeg.enemyHpMul, 1.0);
  });
});

group('startNewGamePlus', () => {
  test('carries over equipment with rarity bump', () => {
    const oldState = {
      equipment: { weapon: { id: 'sword', rarity: 'rare' }, head: null },
      inventory: ['potion_hp_small', 'potion_hp_small', 'potion_hp_small', 'potion_hp_small'],
      gold: 1000,
      skillTree: { krieger: ['k_str_1'], magier: [], schurke: [] },
      achievements: { ach_first_blood: true },
      quests: { q_collect_crystals: { status: 'completed' } },
      bossDefeated: ['the_architect'],
      defeatedBoss: ['the_architect'],
      hp: 5, mana: 18, xp: 200, level: 10,
    };
    const newState = startNewGamePlus(oldState, 1);
    assert.equal(newState.equipment.weapon.rarity, 'epic');
  });

  test('does not bump legendary rarity', () => {
    const oldState = {
      equipment: { weapon: { id: 'excalibur', rarity: 'legendary' } },
      inventory: [], gold: 0,
      defeatedBoss: ['the_architect'],
      hp: 0, mana: 0, xp: 0, level: 1,
    };
    const newState = startNewGamePlus(oldState, 1);
    assert.equal(newState.equipment.weapon.rarity, 'legendary');
  });

  test('resets hp, mana, xp, level', () => {
    const oldState = {
      equipment: {}, inventory: [], gold: 0,
      defeatedBoss: ['the_architect'],
      hp: 5, mana: 18, xp: 200, level: 10,
    };
    const newState = startNewGamePlus(oldState, 1);
    assert.equal(newState.hp, 6);
    assert.equal(newState.mana, 20);
    assert.equal(newState.xp, 0);
    assert.equal(newState.level, 1);
  });

  test('keeps 30% of gold', () => {
    const oldState = {
      equipment: {}, inventory: [], gold: 1000,
      defeatedBoss: ['the_architect'],
    };
    const newState = startNewGamePlus(oldState, 1);
    assert.equal(newState.gold, 300);
  });

  test('keeps 50% of inventory', () => {
    const oldState = {
      equipment: {}, inventory: Array(10).fill('potion'),
      gold: 0, defeatedBoss: ['the_architect'],
    };
    const newState = startNewGamePlus(oldState, 1);
    assert.equal(newState.inventory.length, 5);
  });

  test('carries over skill tree', () => {
    const oldState = {
      equipment: {}, inventory: [], gold: 0,
      defeatedBoss: ['the_architect'],
      skillTree: { krieger: ['k_str_1', 'k_str_2'], magier: ['m_int_1'], schurke: [] },
    };
    const newState = startNewGamePlus(oldState, 1);
    assert.equal(newState.skillTree.krieger.length, 2);
    assert.equal(newState.skillTree.magier.length, 1);
  });

  test('resets quests and bosses', () => {
    const oldState = {
      equipment: {}, inventory: [], gold: 0,
      defeatedBoss: ['the_architect'],
      quests: { q_collect_crystals: { status: 'completed' } },
      bossDefeated: ['the_architect'],
    };
    const newState = startNewGamePlus(oldState, 1);
    assert.equal(Object.keys(newState.quests).length, 0);
    assert.equal(newState.bossDefeated.length, 0);
  });

  test('sets ngLevel and ngPlus flag', () => {
    const newState = startNewGamePlus({ defeatedBoss: ['the_architect'] }, 3);
    assert.equal(newState.ngLevel, 3);
    assert.truthy(newState.ngPlus);
  });
});

group('ngPlusLevel', () => {
  test('returns 0 for fresh state', () => {
    assert.equal(ngPlusLevel({}), 0);
  });

  test('returns level from state', () => {
    assert.equal(ngPlusLevel({ ngLevel: 2 }), 2);
  });
});

group('ngPlusSummary', () => {
  test('returns human-readable summary', () => {
    const s = ngPlusSummary(3);
    assert.equal(s.name, 'NG+3');
    assert.equal(s.level, 3);
    assert.truthy(s.enemyHpMul > 1);
    assert.truthy(s.xpMul > 1);
  });
});

group('isNGPlusUnlocked', () => {
  test('true when architect is defeated', () => {
    assert.truthy(isNGPlusUnlocked({ defeatedBoss: ['the_architect'] }));
  });

  test('false when architect is not defeated', () => {
    assert.falsy(isNGPlusUnlocked({ defeatedBoss: [] }));
  });

  test('false when state is empty', () => {
    assert.falsy(isNGPlusUnlocked({}));
  });
});

group('MAX_NG_PLUS', () => {
  test('caps at 5', () => {
    assert.equal(MAX_NG_PLUS, 5);
  });
});
