// tests/loop.test.mjs — fixed-timestep game loop, controllable via raf mock.
import './_setup.mjs';
import { Loop, DT } from '../src/core/loop.js';
import { test, group, assert, done } from './_runner.mjs';

// Replace rAF with a manually-driven one so we can step the loop deterministically.
function installControlledRaf() {
  const queue = [];
  globalThis.requestAnimationFrame = (cb) => {
    queue.push(cb);
    return queue.length - 1;
  };
  globalThis.cancelAnimationFrame = (id) => { queue[id] = null; };
  return {
    tick(timeMs) { const cb = queue.shift(); if (cb) cb(timeMs); },
    pending() { return queue.length; },
  };
}

group('Loop', () => {
  test('DT is 1/60', () => {
    assert.approx(DT, 1 / 60, 0.0001);
  });

  test('start() and stop() toggle the running flag without crashing', () => {
    installControlledRaf();
    const loop = new Loop({ update: () => {}, render: () => {} });
    assert.equal(loop.running, false);
    loop.start();
    assert.equal(loop.running, true);
    loop.stop();
    assert.equal(loop.running, false);
  });

  test('update() is called with DT=1/60 on each fixed step', () => {
    const raf = installControlledRaf();
    const updates = [];
    const loop = new Loop({
      update: (dt) => updates.push(dt),
      render: () => {},
    });
    // Use a realistic first-frame timestamp so frameTime is non-negative.
    // Passing t=0 here would make frameTime = (0 - this.last)/1000 negative
    // (since this.last was just set to performance.now() in start()) and
    // starve the accumulator.
    const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    loop.start();
    raf.tick(now + 16);  // first frame after start: ~16ms after this.last
    raf.tick(now + 1016); // 1s later
    loop.stop();
    assert.truthy(updates.length >= 1, `expected ≥1 update, got ${updates.length}`);
    for (const u of updates) assert.approx(u, 1 / 60, 0.0001);
  });

  test('setPaused(true) halts both updates and renders', () => {
    const raf = installControlledRaf();
    let updates = 0;
    let renders = 0;
    const loop = new Loop({
      update: () => { updates++; },
      render: () => { renders++; },
    });
    loop.start();
    loop.setPaused(true);
    raf.tick(0);
    raf.tick(1000);
    loop.stop();
    assert.equal(updates, 0);
    assert.equal(renders, 0);
  });

  test('setPaused(false) resumes updates and renders', () => {
    const raf = installControlledRaf();
    let updates = 0;
    let renders = 0;
    const loop = new Loop({
      update: () => { updates++; },
      render: () => { renders++; },
    });
    loop.start();
    loop.setPaused(true);
    raf.tick(1000);
    loop.setPaused(false);
    raf.tick(2000);
    loop.stop();
    assert.truthy(updates > 0, 'should have updates after resume');
    assert.truthy(renders > 0, 'should have renders after resume');
  });

  test('onPauseChange is fired exactly once per transition', () => {
    installControlledRaf();
    let n = 0;
    const loop = new Loop({
      update: () => {}, render: () => {},
      onPauseChange: () => { n++; },
    });
    loop.setPaused(true);
    loop.setPaused(true);  // no-op
    loop.setPaused(false);
    assert.equal(n, 2);
  });
});

done();
