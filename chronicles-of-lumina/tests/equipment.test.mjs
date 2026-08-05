// tests/equipment.test.mjs — equipment slots, stats, items.
import './_setup.mjs';
import {
  EQUIPMENT_SLOTS, RARITY, STATS,
  getItemTemplate, listItemTemplates, listTemplatesBySlot,
  rollItem, getStatBonus, getAllStatBonuses, deriveStats,
  equipItem, unequipSlot, rollDrop,
} from '../src/systems/equipment.js';
import { test, group, assert } from './_runner.mjs';

// Deterministic RNG for testing
const seededRng = (seed) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1103515245 + 12345) >>> 0;
    return s / 4294967296;
  };
};

group('equipment slots', () => {
  test('has 7 slots (6 armor + weapon)', () => {
    assert.equal(Object.keys(EQUIPMENT_SLOTS).length, 7);
  });

  test('rarity has 5 tiers with color + statMul', () => {
    assert.equal(Object.keys(RARITY).length, 5);
    for (const r of Object.values(RARITY)) {
      assert.truthy(r.color.startsWith('#'), 'color');
      assert.truthy(r.statMul >= 1.0 && r.statMul <= 3.0, 'statMul range');
    }
  });

  test('all rarity tiers are ordered by statMul', () => {
    const order = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    for (let i = 1; i < order.length; i++) {
      assert.truthy(RARITY[order[i].toUpperCase()].statMul > RARITY[order[i-1].toUpperCase()].statMul,
        `${order[i]} should be stronger than ${order[i-1]}`);
    }
  });
});

group('item templates', () => {
  test('has at least 20 templates', () => {
    assert.truthy(listItemTemplates().length >= 20, `only ${listItemTemplates().length} templates`);
  });

  test('every template has required fields', () => {
    for (const t of listItemTemplates()) {
      assert.truthy(t.id, 'id');
      assert.truthy(t.name, 'name');
      assert.truthy(EQUIPMENT_SLOTS[t.slot.toUpperCase()] || t.slot === 'weapon', 'slot');
      assert.truthy(RARITY[t.tier.toUpperCase()], 'tier');
      assert.truthy(t.base && Object.keys(t.base).length > 0, 'base stats');
    }
  });

  test('templates per slot >= 2', () => {
    for (const slot of Object.values(EQUIPMENT_SLOTS)) {
      const list = listTemplatesBySlot(slot);
      assert.truthy(list.length >= 2, `slot ${slot} has ${list.length} templates`);
    }
  });

  test('getItemTemplate returns null for unknown id', () => {
    assert.equal(getItemTemplate('not_a_template'), null);
  });
});

group('rollItem', () => {
  test('produces an item with template + rolled stats', () => {
    const rng = seededRng(42);
    const item = rollItem('sword_iron', rng);
    assert.truthy(item);
    assert.equal(item.templateId, 'sword_iron');
    assert.equal(item.slot, 'weapon');
    assert.equal(item.tier, 'common');
    assert.truthy(item.uid);
    assert.truthy(item.stats.str >= 2 && item.stats.str <= 5,
      `str ${item.stats.str} out of range [2,5]`);
  });

  test('same seed produces same item (deterministic)', () => {
    const a = rollItem('sword_steel', seededRng(100));
    const b = rollItem('sword_steel', seededRng(100));
    assert.equal(a.stats.str, b.stats.str);
  });

  test('returns null for unknown template', () => {
    assert.equal(rollItem('not_a_template'), null);
  });
});

group('stat bonuses', () => {
  test('getStatBonus sums across items', () => {
    const items = [
      { stats: { str: 5 } },
      { stats: { str: 3, dex: 2 } },
      { stats: { int: 4 } },
    ];
    assert.equal(getStatBonus(items, 'str'), 8);
    assert.equal(getStatBonus(items, 'dex'), 2);
    assert.equal(getStatBonus(items, 'int'), 4);
    assert.equal(getStatBonus(items, 'vit'), 0);
  });

  test('getStatBonus handles empty / null', () => {
    assert.equal(getStatBonus([], 'str'), 0);
    assert.equal(getStatBonus(null, 'str'), 0);
  });

  test('getAllStatBonuses returns all 5 stats', () => {
    const out = getAllStatBonuses([{ stats: { str: 1, dex: 2, int: 3, vit: 4, wis: 5 } }]);
    assert.equal(out.str, 1);
    assert.equal(out.dex, 2);
    assert.equal(out.int, 3);
    assert.equal(out.vit, 4);
    assert.equal(out.wis, 5);
  });
});

group('deriveStats', () => {
  test('derives maxHp from VIT (4 per point)', () => {
    const derived = deriveStats({ maxHp: 6, maxMana: 20, attackDamage: 1, attackSpeed: 0.18, critChance: 0.05, manaRegen: 1.0 }, { str: 0, dex: 0, int: 0, vit: 5, wis: 0 });
    assert.equal(derived.maxHp, 6 + 5 * 4);
  });

  test('derives maxMana from INT (3 per point)', () => {
    const derived = deriveStats({ maxHp: 6, maxMana: 20, attackDamage: 1, attackSpeed: 0.18, critChance: 0.05, manaRegen: 1.0 }, { str: 0, dex: 0, int: 4, vit: 0, wis: 0 });
    assert.equal(derived.maxMana, 20 + 4 * 3);
  });

  test('derives attackDamage from STR', () => {
    const derived = deriveStats({ maxHp: 6, maxMana: 20, attackDamage: 1, attackSpeed: 0.18, critChance: 0.05, manaRegen: 1.0 }, { str: 7, dex: 0, int: 0, vit: 0, wis: 0 });
    assert.equal(derived.attackDamage, 1 + 7);
  });

  test('zero bonuses = base stats unchanged', () => {
    const base = { maxHp: 6, maxMana: 20, attackDamage: 1, attackSpeed: 0.18, critChance: 0.05, manaRegen: 1.0 };
    const derived = deriveStats(base, { str: 0, dex: 0, int: 0, vit: 0, wis: 0 });
    assert.equal(derived.maxHp, base.maxHp);
    assert.equal(derived.maxMana, base.maxMana);
  });
});

group('equip / unequip', () => {
  test('equipItem returns the previous item in that slot', () => {
    const old = { slot: 'weapon', stats: { str: 3 } };
    const fresh = { slot: 'weapon', stats: { str: 5 } };
    const { prev, next } = equipItem({ weapon: old }, fresh);
    assert.equal(prev, old);
    assert.equal(next.weapon, fresh);
  });

  test('equipItem returns null prev when slot is empty', () => {
    const fresh = { slot: 'helm', stats: { vit: 2 } };
    const { prev, next } = equipItem({}, fresh);
    assert.equal(prev, null);
    assert.equal(next.helm, fresh);
  });

  test('unequipSlot returns the removed item', () => {
    const helm = { slot: 'helm', stats: { vit: 2 } };
    const { removed, next } = unequipSlot({ helm, weapon: { slot: 'weapon' } }, 'helm');
    assert.equal(removed, helm);
    assert.equal(next.helm, undefined);
    assert.equal(next.weapon.stats, undefined); // weapon still there
  });

  test('unequipSlot returns null when slot is empty', () => {
    const { removed } = unequipSlot({ weapon: {} }, 'helm');
    assert.equal(removed, null);
  });
});
