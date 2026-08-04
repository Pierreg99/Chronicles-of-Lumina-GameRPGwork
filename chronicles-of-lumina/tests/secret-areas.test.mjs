// tests/secret-areas.test.mjs — secret area registry + helpers.
import './_setup.mjs';
import { SECRET_AREAS, getSecretArea, isNearCue, discoverSecret, totalSecrets } from '../src/world/secret-areas.js';
import { test, group, assert } from './_runner.mjs';

group('secret areas', () => {
  test('has one secret for every biome', () => {
    const zones = ['verdant', 'dunes', 'peaks', 'mire', 'ember',
                   'crystal', 'sky', 'reef', 'haunted', 'void'];
    for (const z of zones) {
      assert.truthy(SECRET_AREAS[z], `${z} missing secret area`);
    }
    assert.equal(totalSecrets(), 10);
  });

  test('every secret has required fields', () => {
    for (const [zoneId, secret] of Object.entries(SECRET_AREAS)) {
      assert.equal(secret.zoneId, zoneId, 'zoneId mismatch');
      assert.truthy(secret.name, 'name');
      assert.truthy(secret.description, 'description');
      assert.truthy(secret.cuePos && typeof secret.cuePos.x === 'number', 'cuePos');
      assert.truthy(secret.entryPos && typeof secret.entryPos.x === 'number', 'entryPos');
      assert.truthy(secret.bossSpec, 'bossSpec');
      assert.truthy(secret.bossSpec.id, 'bossSpec.id');
      assert.truthy(secret.bossSpec.hp > 0, 'bossSpec.hp');
      assert.truthy(secret.loot && secret.loot.length > 0, 'loot');
      assert.truthy(secret.unlocksCodex && secret.unlocksCodex.length > 0, 'unlocksCodex');
    }
  });

  test('boss HP scales with difficulty (void is highest)', () => {
    const voidSecret = SECRET_AREAS.void;
    const verdantSecret = SECRET_AREAS.verdant;
    assert.truthy(voidSecret.bossSpec.hp > verdantSecret.bossSpec.hp,
      'void boss should be tougher than verdant boss');
  });

  test('isNearCue detects player proximity', () => {
    const secret = SECRET_AREAS.verdant;
    const player = { x: secret.cuePos.x + 1, z: secret.cuePos.z };
    assert.truthy(isNearCue(secret, player, 3.0));
    const farPlayer = { x: 100, z: 100 };
    assert.falsy(isNearCue(secret, farPlayer, 3.0));
  });

  test('discoverSecret only fires once per id', () => {
    const state = { flags: new Set() };
    const id = 'verdant_secret';
    assert.truthy(discoverSecret(state, id));
    assert.falsy(discoverSecret(state, id));
  });

  test('getSecretArea returns null for unknown zone', () => {
    assert.equal(getSecretArea('not_a_zone'), null);
  });
});
