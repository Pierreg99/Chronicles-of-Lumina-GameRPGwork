// tests/tween.test.mjs — tween library used by camera, anticipation, shake.
import './_setup.mjs';
import { Tween, tween, TweenManager, EASINGS } from '../src/utils/tween.js';
import { test, group, assert } from './_runner.mjs';

group('Tween', () => {
  test('reaches target after duration with linear ease', () => {
    const tw = tween({ from: 0, to: 10, duration: 1, ease: 'linear' });
    tw.step(0.5);
    assert.approx(tw.value, 5, 0.001);
    tw.step(0.5);
    assert.approx(tw.value, 10, 0.001);
    assert.truthy(tw.done);
  });

  test('retarget() resets from current value', () => {
    const tw = tween({ from: 0, to: 10, duration: 1 });
    tw.step(0.5);
    const mid = tw.value;
    tw.retarget(20, 0.5);
    tw.step(0.5);
    assert.approx(tw.value, 20, 0.001);
    assert.truthy(mid < 10); // was moving toward 10
  });

  test('onUpdate fires on each step', () => {
    const log = [];
    const tw = tween({ from: 0, to: 1, duration: 0.2, onUpdate: (v) => log.push(v) });
    tw.step(0.1);
    tw.step(0.1);
    assert.equal(log.length, 2);
  });

  test('onComplete fires once at end', () => {
    let count = 0;
    const tw = tween({ from: 0, to: 1, duration: 0.1, onComplete: () => count++ });
    tw.step(0.05);
    assert.equal(count, 0);
    tw.step(0.1); // overshoots
    assert.equal(count, 1);
  });

  test('cancel() prevents future updates', () => {
    const tw = tween({ from: 0, to: 10, duration: 1 });
    tw.step(0.5);
    tw.cancel();
    tw.step(0.5);
    assert.truthy(tw.done);
  });

  test('easeOutCubic overshoots smoothly', () => {
    const tw = tween({ from: 0, to: 1, duration: 1, ease: 'easeOutCubic' });
    tw.step(0.5);
    // easeOutCubic(0.5) = 1 - (0.5)^3 = 0.875
    assert.approx(tw.value, 0.875, 0.01);
  });

  test('EASINGS exports all expected eases', () => {
    ['linear', 'easeInQuad', 'easeOutQuad', 'easeInOutQuad', 'easeOutCubic', 'easeOutBack', 'easeOutElastic']
      .forEach((name) => assert.truthy(typeof EASINGS[name] === 'function', `missing ease: ${name}`));
  });
});

group('TweenManager', () => {
  test('adds and updates all active tweens', () => {
    const mgr = new TweenManager();
    const tw1 = mgr.add(tween({ from: 0, to: 1, duration: 0.5 }));
    const tw2 = mgr.add(tween({ from: 0, to: 1, duration: 0.5 }));
    mgr.update(0.5);
    assert.truthy(tw1.done);
    assert.truthy(tw2.done);
    assert.equal(mgr.tweens.length, 0);
  });

  test('clear() drops all tweens', () => {
    const mgr = new TweenManager();
    mgr.add(tween({ from: 0, to: 1, duration: 1 }));
    mgr.add(tween({ from: 0, to: 1, duration: 1 }));
    mgr.clear();
    assert.equal(mgr.tweens.length, 0);
  });
});
