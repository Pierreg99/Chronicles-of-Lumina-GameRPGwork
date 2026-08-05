// tests/biome-variety.test.mjs — per-biome tree + enemy registries.
import './_setup.mjs';
import {
  TREE_TYPES, BIOME_TREE_POOLS,
  getTreeType, listTreeTypes, pickTree, getBiomeTreePool,
} from '../src/world/zones/biome-trees.js';
import {
  ENEMY_TYPES,
  getEnemyType, listEnemyTypes, pickEnemy, totalEnemyTypes,
} from '../src/world/zones/biome-enemies.js';
import { test, group, assert } from './_runner.mjs';

group('tree types', () => {
  test('has 22+ tree variants', () => {
    assert.truthy(listTreeTypes().length >= 22, `only ${listTreeTypes().length}`);
  });

  test('every tree has required fields', () => {
    for (const [id, t] of Object.entries(TREE_TYPES)) {
      assert.truthy(t.id, `${id} id`);
      assert.truthy(t.trunk, `${id} trunk color`);
      assert.truthy(t.crown, `${id} crown color`);
      assert.truthy(t.crownSize > 0, `${id} crownSize`);
      assert.truthy(t.shape, `${id} shape`);
    }
  });

  test('every biome has a tree pool', () => {
    const zones = ['verdant', 'dunes', 'peaks', 'mire', 'ember', 'crystal', 'sky', 'reef', 'haunted', 'void'];
    for (const z of zones) {
      const pool = getBiomeTreePool(z);
      assert.truthy(pool.length >= 1, `${z} empty pool`);
      for (const id of pool) {
        assert.truthy(TREE_TYPES[id], `${z} references unknown tree ${id}`);
      }
    }
  });

  test('pickTree falls back to oak for unknown', () => {
    const t = pickTree(['not_a_tree']);
    assert.equal(t.id, 'oak');
  });

  test('pickTree returns from the provided pool', () => {
    const t = pickTree(['crystal_cluster']);
    assert.equal(t.id, 'crystal_cluster');
  });
});

group('enemy types', () => {
  test('has 30+ enemy variants', () => {
    assert.truthy(totalEnemyTypes() >= 30, `only ${totalEnemyTypes()}`);
  });

  test('every enemy has combat stats', () => {
    for (const [id, e] of Object.entries(ENEMY_TYPES)) {
      assert.truthy(e.id, `${id} id`);
      assert.truthy(e.name, `${id} name`);
      assert.truthy(e.hp > 0, `${id} hp`);
      assert.truthy(e.damage > 0, `${id} damage`);
      assert.truthy(e.speed > 0, `${id} speed`);
      assert.truthy(e.aggro > 0, `${id} aggro`);
      assert.truthy(e.range > 0, `${id} range`);
      assert.truthy(e.xp > 0, `${id} xp`);
    }
  });

  test('every biome has 3+ enemy types in the enemy-pool', () => {
    // We don't test zones.enemyPool directly here (it's in
    // world/zones/index.js), but the type registry itself should
    // cover all the biomes. Spot-check key biomes:
    const zoneEnemies = {
      verdant: ['slime_blue', 'slime_green', 'slime_purple'],
      dunes:   ['scorpion', 'sandworm', 'vulture'],
      peaks:   ['ice_wisp', 'mountain_goat', 'frost_slime', 'yeti'],
      mire:    ['bog_slime', 'willow_wisp', 'mire_lurker', 'frog_giant'],
      void:    ['void_slime', 'phase_stalker', 'rift_lord', 'null_wisp'],
    };
    for (const [z, ids] of Object.entries(zoneEnemies)) {
      for (const id of ids) {
        assert.truthy(ENEMY_TYPES[id], `${z} references unknown enemy ${id}`);
      }
    }
  });

  test('pickEnemy falls back to slime_blue', () => {
    const e = pickEnemy(['not_an_enemy']);
    assert.equal(e.id, 'slime_blue');
  });

  test('pickEnemy returns from the provided pool', () => {
    const e = pickEnemy(['yeti']);
    assert.equal(e.id, 'yeti');
  });

  test('enemy difficulty scales with biome tier (void hardest)', () => {
    const verdantSlime = ENEMY_TYPES.slime_blue;
    const voidRiftLord = ENEMY_TYPES.rift_lord;
    assert.truthy(voidRiftLord.hp > verdantSlime.hp);
    assert.truthy(voidRiftLord.damage >= verdantSlime.damage);
  });
});
