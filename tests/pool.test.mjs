// tests/pool.test.mjs — verifies the generic Pool used by Phase 18 perf work.
import { test } from './_runner.mjs';
import { Pool } from '../src/utils/pool.js';

test('Pool: starts with N pre-built items, all inactive', () => {
  const p = new Pool(() => ({ tag: 'x' }), () => {}, 5);
  if (p.items.length !== 5) throw new Error(`expected 5 items, got ${p.items.length}`);
  if (p.active.size !== 0)   throw new Error('expected 0 active');
});

test('Pool: acquire returns an item and marks it active', () => {
  const p = new Pool(() => ({ n: 0 }), (i) => { i.n = 1; }, 3);
  const a = p.acquire();
  if (a.n !== 1)             throw new Error('reset not called on acquire');
  if (p.active.size !== 1)   throw new Error('item not marked active');
  if (!p.active.has(a))      throw new Error('item missing from active set');
});

test('Pool: reuses items until pool exhausted, then grows', () => {
  let built = 0;
  const p = new Pool(() => ({ id: built++ }), () => {}, 2);
  const a = p.acquire();
  const b = p.acquire();
  const c = p.acquire(); // triggers grow
  if (built !== 3) throw new Error(`expected 3 builds, got ${built}`);
  if (p.items.length !== 3) throw new Error('pool did not grow');
  if (p.active.size !== 3)  throw new Error('all should be active');
  // same instance? only after release
  p.release(a);
  const d = p.acquire();
  if (d !== a) throw new Error('expected to reuse released item');
});

test('Pool: releaseAll resets active set without shrinking items', () => {
  const p = new Pool(() => ({}), () => {}, 4);
  p.acquire(); p.acquire(); p.acquire();
  p.releaseAll();
  if (p.active.size !== 0)   throw new Error('active not cleared');
  if (p.items.length !== 4)  throw new Error('items list should not shrink');
});

test('Pool: forEachActive iterates exactly the active set', () => {
  const p = new Pool(() => ({ k: Math.random() }), () => {}, 3);
  const seen = new Set();
  const a = p.acquire(); seen.add(a);
  const b = p.acquire(); seen.add(b);
  let count = 0;
  p.forEachActive((it) => { if (!seen.has(it)) throw new Error('foreign item'); count++; });
  if (count !== 2) throw new Error(`expected 2, saw ${count}`);
});
