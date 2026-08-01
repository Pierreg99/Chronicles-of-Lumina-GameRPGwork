// tests/zones.test.mjs — biome registry, map code codec, zone picker.
import './_setup.mjs';
import { ZONES, getZone, listZones, encodeMapCode, decodeMapCode } from '../src/world/zones/index.js';
import { test, group, assert } from './_runner.mjs';

group('zones registry', () => {
  test('contains the 5 documented biomes', () => {
    const ids = listZones().map((z) => z.id);
    assert.deepEqual(ids.sort(), ['dunes', 'ember', 'mire', 'peaks', 'verdant']);
  });

  test('every zone has the required fields', () => {
    for (const z of listZones()) {
      assert.truthy(z.id, 'zone has id');
      assert.truthy(z.name, 'zone has name');
      assert.truthy(z.description, 'zone has description');
      assert.truthy(z.accent, 'zone has accent color');
      assert.truthy(z.spawns, 'zone has spawns');
      assert.truthy(Array.isArray(z.enemyPool) && z.enemyPool.length > 0, 'zone has enemyPool');
      assert.truthy(typeof z.difficulty === 'number' && z.difficulty > 0, 'zone has difficulty');
    }
  });

  test('getZone falls back to default for unknown ids', () => {
    assert.equal(getZone('not_a_zone').id, 'verdant');
  });

  test('all difficulties fall in a sane range (0.5 - 3.0)', () => {
    for (const z of listZones()) {
      assert.truthy(z.difficulty >= 0.5 && z.difficulty <= 3.0,
        `${z.id} difficulty ${z.difficulty} out of range`);
    }
    // Ember is always the hardest zone
    const ember = getZone('ember');
    for (const z of listZones()) {
      if (z.id === 'ember') continue;
      assert.truthy(ember.difficulty >= z.difficulty,
        `ember (${ember.difficulty}) should be the hardest, but ${z.id} is ${z.difficulty}`);
    }
  });
});

group('map codes', () => {
  test('encodeMapCode is URL-safe and reversible', () => {
    const code = encodeMapCode('dunes', 0x1a2b3c4d);
    const decoded = decodeMapCode(code);
    assert.equal(decoded.zoneId, 'dunes');
    assert.equal(decoded.seed, 0x1a2b3c4d);
  });

  test('decodeMapCode returns null for invalid zone', () => {
    assert.equal(decodeMapCode('notreal:12345'), null);
  });

  test('decodeMapCode returns null for missing colon', () => {
    assert.equal(decodeMapCode('verdant'), null);
  });

  test('decodeMapCode returns null for empty input', () => {
    assert.equal(decodeMapCode(''), null);
    assert.equal(decodeMapCode(null), null);
  });

  test('round-trip across all biomes', () => {
    for (const z of listZones()) {
      const seed = 0xdeadbeef;
      const code = encodeMapCode(z.id, seed);
      const decoded = decodeMapCode(code);
      assert.equal(decoded.zoneId, z.id);
      assert.equal(decoded.seed, seed);
    }
  });
});
