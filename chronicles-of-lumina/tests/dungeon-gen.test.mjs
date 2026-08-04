// tests/dungeon-gen.test.mjs — procedural dungeon generator.
import './_setup.mjs';
import { generateDungeon, validateLayout, DUNGEON_TYPES } from '../src/world/dungeon-gen.js';
import { test, group, assert } from './_runner.mjs';

group('dungeon generator', () => {
  test('produces a valid layout for each type', () => {
    for (const typeId of Object.keys(DUNGEON_TYPES)) {
      const seed = Math.floor(Math.random() * 0xffffff);
      const layout = generateDungeon(typeId, seed);
      assert.truthy(validateLayout(layout), `${typeId} seed ${seed} failed validation`);
    }
  });

  test('same seed produces identical layout (determinism)', () => {
    const a = generateDungeon('crypt', 12345);
    const b = generateDungeon('crypt', 12345);
    assert.equal(a.rooms.length, b.rooms.length);
    for (let i = 0; i < a.rooms.length; i++) {
      assert.equal(a.rooms[i].x, b.rooms[i].x, `room ${i} x`);
      assert.equal(a.rooms[i].y, b.rooms[i].y, `room ${i} y`);
    }
  });

  test('different seeds produce different layouts', () => {
    const a = generateDungeon('mine', 100);
    const b = generateDungeon('mine', 200);
    // At least one room position should differ
    const aKey = a.rooms.map((r) => `${r.x},${r.y}`).join('|');
    const bKey = b.rooms.map((r) => `${r.x},${r.y}`).join('|');
    assert.truthy(aKey !== bKey, 'seeds should produce different layouts');
  });

  test('always has an entrance and a boss room', () => {
    for (let i = 0; i < 10; i++) {
      const layout = generateDungeon('tower', i * 1000);
      assert.truthy(layout.rooms.some((r) => r.type === 'entrance'), `run ${i} no entrance`);
      assert.truthy(layout.rooms.some((r) => r.type === 'boss'), `run ${i} no boss`);
    }
  });

  test('all rooms stay within the grid bounds', () => {
    for (let i = 0; i < 20; i++) {
      const layout = generateDungeon('crypt', i * 7777);
      for (const r of layout.rooms) {
        assert.truthy(r.x >= 0 && r.y >= 0, `room ${r.id} negative pos`);
        assert.truthy(r.x + r.w <= layout.size.width, `room ${r.id} overflows width`);
        assert.truthy(r.y + r.h <= layout.size.height, `room ${r.id} overflows height`);
      }
    }
  });

  test('room counts fall within the type-specific range', () => {
    for (let i = 0; i < 20; i++) {
      const layout = generateDungeon('crypt', i * 123);
      const [min, max] = DUNGEON_TYPES.crypt.roomCount;
      assert.truthy(layout.rooms.length >= min && layout.rooms.length <= max + 1,
        `crypt room count ${layout.rooms.length} out of range [${min}, ${max+1}]`);
    }
  });
});
