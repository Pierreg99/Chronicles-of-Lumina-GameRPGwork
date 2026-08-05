// tests/crafting.test.mjs — crafting stations + recipes + canCraft.
import './_setup.mjs';
import {
  STATIONS,
  getMaterial, listMaterials,
  getRecipe, listRecipes, listRecipesByStation, totalRecipes,
  canCraft, craft, addToInventory,
} from '../src/systems/crafting.js';
import { test, group, assert } from './_runner.mjs';

group('stations', () => {
  test('has 4 stations (forge, alchemy, enchanter, cook)', () => {
    assert.equal(Object.keys(STATIONS).length, 4);
    for (const id of ['forge', 'alchemy', 'enchanter', 'cook']) {
      assert.truthy(STATIONS[id.toUpperCase()], `${id} missing`);
    }
  });
});

group('materials', () => {
  test('has 17 material types', () => {
    assert.truthy(listMaterials().length >= 17);
  });
  test('every material has id/name/icon', () => {
    for (const m of listMaterials()) {
      assert.truthy(m.id);
      assert.truthy(m.name);
      assert.truthy(m.icon);
    }
  });
  test('getMaterial returns null for unknown', () => {
    assert.equal(getMaterial('not_a_material'), null);
  });
});

group('recipes', () => {
  test('has 30+ recipes total', () => {
    assert.truthy(totalRecipes() >= 30, `only ${totalRecipes()}`);
  });

  test('every recipe has station + materials + output', () => {
    for (const r of listRecipes()) {
      assert.truthy(STATIONS[r.station.toUpperCase()], `${r.id} station ${r.station} invalid`);
      assert.truthy(r.materials && Object.keys(r.materials).length > 0, 'materials');
      assert.truthy(r.output, 'output');
    }
  });

  test('every recipe has at least 1 material in inventory registry', () => {
    for (const r of listRecipes()) {
      for (const matId of Object.keys(r.materials)) {
        assert.truthy(getMaterial(matId), `${r.id} references unknown material ${matId}`);
      }
    }
  });

  test('station counts sum to total', () => {
    let total = 0;
    for (const s of Object.keys(STATIONS)) {
      total += listRecipesByStation(s.toLowerCase()).length;
    }
    assert.equal(total, totalRecipes());
  });

  test('10 forge recipes', () => {
    assert.equal(listRecipesByStation('forge').length, 10);
  });
});

group('canCraft', () => {
  test('returns true with sufficient materials', () => {
    const inv = { iron_ore: 5, coal: 2 };
    const result = canCraft('recipe_iron_sword', inv);
    assert.truthy(result.canCraft);
    assert.deepEqual(result.missing, {});
  });

  test('returns false with insufficient materials', () => {
    const inv = { iron_ore: 1 };
    const result = canCraft('recipe_iron_sword', inv);
    assert.falsy(result.canCraft);
    assert.truthy(result.missing.iron_ore >= 2);
    assert.truthy(result.missing.coal >= 1);
  });

  test('returns missing counts (not just true/false)', () => {
    const inv = { iron_ore: 2, coal: 1 };
    const result = canCraft('recipe_iron_sword', inv);
    assert.falsy(result.canCraft);
    assert.equal(result.missing.iron_ore, 1);
  });

  test('handles empty inventory', () => {
    const result = canCraft('recipe_iron_sword', {});
    assert.falsy(result.canCraft);
  });

  test('returns false for unknown recipe', () => {
    const result = canCraft('not_a_recipe', {});
    assert.falsy(result.canCraft);
  });
});

group('craft', () => {
  test('consumes materials and returns output', () => {
    const inv = { iron_ore: 5, coal: 2 };
    const output = craft('recipe_iron_sword', inv);
    assert.truthy(output);
    assert.equal(output.type, 'item');
    assert.equal(output.itemId, 'sword_iron');
    assert.equal(inv.iron_ore, 2); // 5 - 3
    assert.equal(inv.coal, 1);     // 2 - 1
  });

  test('returns null if materials missing', () => {
    const inv = { iron_ore: 1 };
    const output = craft('recipe_iron_sword', inv);
    assert.equal(output, null);
    assert.equal(inv.iron_ore, 1); // unchanged
  });
});

group('addToInventory', () => {
  test('adds to existing count', () => {
    const inv = { iron_ore: 3 };
    addToInventory(inv, 'iron_ore', 2);
    assert.equal(inv.iron_ore, 5);
  });

  test('creates new key when missing', () => {
    const inv = {};
    addToInventory(inv, 'coal', 1);
    assert.equal(inv.coal, 1);
  });
});
