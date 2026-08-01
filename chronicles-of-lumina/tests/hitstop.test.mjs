// tests/hitstop.test.mjs — global freeze-state used by combat + boss feedback.
import './_setup.mjs';
import { HitStop } from '../src/core/hitstop.js';
import { test, group, assert } from './_runner.mjs';

group('HitStop', () => {
  test('starts inactive', () => {
    const hs = new HitStop();
    assert.falsy(hs.active);
  });

  test('freeze() activates for the requested duration', () => {
    const hs = new HitStop();
    hs.freeze(0.1);
    assert.truthy(hs.active);
    assert.approx(hs.remaining, 0.1, 0.001);
  });

  test('update() decrements remaining by dt', () => {
    const hs = new HitStop();
    hs.freeze(0.5);
    hs.update(0.1);
    assert.approx(hs.remaining, 0.4, 0.001);
    hs.update(0.2);
    assert.approx(hs.remaining, 0.2, 0.001);
  });

  test('deactivates when remaining hits zero', () => {
    const hs = new HitStop();
    hs.freeze(0.1);
    hs.update(0.2); // overshoot
    assert.falsy(hs.active);
    assert.equal(hs.remaining, 0);
  });

  test('subsequent freeze() takes the MAX (does not stack)', () => {
    const hs = new HitStop();
    hs.freeze(0.5);
    hs.update(0.1);
    hs.freeze(0.1); // shorter than remaining 0.4
    assert.approx(hs.remaining, 0.4, 0.001);
    hs.freeze(1.0); // longer than remaining
    assert.approx(hs.remaining, 1.0, 0.001);
  });
});
