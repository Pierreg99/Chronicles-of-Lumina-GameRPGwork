// tests/era.test.mjs — verifies the Evoland-style era state machine.
import { test } from './_runner.mjs';
import { ERAS, ERA_INFO, currentEra, advanceEra, setEra, allEras, currentEraInfo } from '../src/core/era.js';
import { applyEraPostProcess } from '../src/engine/era-renderer.js';
import { state } from '../src/core/state.js';

// Reset state before each test
function resetEra() { state.era = 1; }

test('era: starts in era 1 (8-bit)', () => {
  resetEra();
  if (currentEra() !== ERAS.EIGHT_BIT) throw new Error('expected era 1');
  if (currentEraInfo().title !== 'Acht Bit') throw new Error('expected 8-bit title');
});

test('era: advanceEra 1 -> 2', () => {
  resetEra();
  const next = advanceEra();
  if (next !== ERAS.SIXTEEN_BIT) throw new Error(`expected 2, got ${next}`);
  if (currentEra() !== 2) throw new Error('state not updated');
});

test('era: advanceEra 2 -> 3', () => {
  resetEra();
  advanceEra(); // 1->2
  const next = advanceEra(); // 2->3
  if (next !== ERAS.THREE_D) throw new Error('expected 3');
  if (currentEraInfo().title !== 'Drei Dimensionen') throw new Error('expected 3D title');
});

test('era: advanceEra at last era returns null', () => {
  resetEra();
  advanceEra();
  advanceEra();
  if (currentEra() !== 3) throw new Error('should be 3');
  const next = advanceEra();
  if (next !== null) throw new Error(`expected null, got ${next}`);
});

test('era: setEra validates range', () => {
  resetEra();
  if (setEra(2) !== undefined) throw new Error('setEra should not return');
  if (currentEra() !== 2) throw new Error('setEra failed');
  let threw = false;
  try { setEra(0); } catch { threw = true; }
  if (!threw) throw new Error('setEra(0) should throw');
  threw = false;
  try { setEra(4); } catch { threw = true; }
  if (!threw) throw new Error('setEra(4) should throw');
});

test('era: allEras has 3 entries in order', () => {
  const eras = allEras();
  if (eras.length !== 3) throw new Error(`expected 3, got ${eras.length}`);
  if (eras[0] !== 1 || eras[1] !== 2 || eras[2] !== 3) throw new Error('wrong order');
});

test('era: movement constraints vary by era', () => {
  resetEra();
  if (ERA_INFO[1].movement !== 'cardinal-4') throw new Error('era 1 should be cardinal-4');
  if (ERA_INFO[2].movement !== 'cardinal-8') throw new Error('era 2 should be cardinal-8');
  if (ERA_INFO[3].movement !== 'free-3d') throw new Error('era 3 should be free-3d');
});

test('era: pixelSize decreases as we progress', () => {
  resetEra();
  if (ERA_INFO[1].pixelSize !== 4) throw new Error('era 1 should be 4');
  if (ERA_INFO[2].pixelSize !== 2) throw new Error('era 2 should be 2');
  if (ERA_INFO[3].pixelSize !== 1) throw new Error('era 3 should be 1');
});

test('era-renderer: exports applyEraPostProcess function', () => {
  if (typeof applyEraPostProcess !== 'function') throw new Error('expected applyEraPostProcess to be a function');
});
