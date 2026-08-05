// tests/era-enemies.test.mjs — verifies era-specific enemy stats.
import { test } from './_runner.mjs';
import { state } from '../src/core/state.js';
import { ERAS, setEra } from '../src/core/era.js';
import { eraSpawnCap, eraPerSpawn, eraSlimeList, currentEraEnemies, randomEraSlime } from '../src/utils/era-enemies.js';

test('era-enemies: era 1 has many weak enemies', () => {
  setEra(1);
  if (eraSpawnCap() !== 8) throw new Error('era 1 should cap at 8');
  if (eraPerSpawn() !== 4) throw new Error('era 1 should spawn 4/wave');
  const list = eraSlimeList();
  if (list.length < 2) throw new Error('era 1 should have 2+ slime variants');
  for (const s of list) {
    if (s.hp > 2) throw new Error('era 1 slimes should have low HP');
  }
});

test('era-enemies: era 2 has medium enemies', () => {
  setEra(2);
  if (eraSpawnCap() !== 5) throw new Error('era 2 should cap at 5');
  const list = eraSlimeList();
  for (const s of list) {
    if (s.hp < 2) throw new Error('era 2 slimes should have medium HP');
    if (s.hp > 6) throw new Error('era 2 slimes should not exceed 6 HP');
  }
});

test('era-enemies: era 3 has few strong enemies', () => {
  setEra(3);
  if (eraSpawnCap() !== 3) throw new Error('era 3 should cap at 3');
  const list = eraSlimeList();
  for (const s of list) {
    if (s.hp < 5) throw new Error('era 3 slimes should have high HP');
  }
});

test('era-enemies: randomEraSlime returns from current era list', () => {
  setEra(1);
  for (let i = 0; i < 10; i++) {
    const s = randomEraSlime();
    if (!s) throw new Error('should return a slime');
    if (!s.id.includes('8')) throw new Error(`era 1 slimes should have 8 in id, got ${s.id}`);
  }
  setEra(3);
  for (let i = 0; i < 10; i++) {
    const s = randomEraSlime();
    if (!s) throw new Error('should return a slime');
    if (!s.id.includes('3d')) throw new Error(`era 3 slimes should have 3d in id, got ${s.id}`);
  }
  setEra(1); // reset
});

test('era-enemies: scoreMult increases per era', () => {
  setEra(1);
  const e1 = currentEraEnemies().scoreMult;
  setEra(2);
  const e2 = currentEraEnemies().scoreMult;
  setEra(3);
  const e3 = currentEraEnemies().scoreMult;
  if (!(e1 < e2 && e2 < e3)) throw new Error(`expected e1<e2<e3, got ${e1},${e2},${e3}`);
  setEra(1);
});
