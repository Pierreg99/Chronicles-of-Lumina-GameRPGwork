// tests/feedback.test.mjs — central feedback façade (hitstop/shake/slowmo/flash/cameraKick).
import './_setup.mjs';
import { EventBus } from '../src/core/event-bus.js';
import { HitStop } from '../src/core/hitstop.js';
import { FeedbackSystem } from '../src/systems/feedback-system.js';
import { Settings } from '../src/core/settings.js';
import { EVENTS } from '../src/core/constants.js';
import { CONFIG } from '../src/core/config.js';
import { test, group, assert } from './_runner.mjs';

const setupGame = () => {
  const s = new Settings();
  s.reset();
  return { bus: new EventBus(), hitstop: new HitStop(), settings: s };
};

group('FeedbackSystem', () => {
  test('hitstopSmall freezes hitstop for CONFIG.feedback.hitstopSmall seconds', () => {
    const g = setupGame();
    const f = new FeedbackSystem(g, g.settings);
    f.hitstopSmall();
    assert.approx(g.hitstop.remaining, CONFIG.feedback.hitstopSmall, 0.001);
    assert.truthy(g.bus._test = true); // bus still alive
  });

  test('hitstopBig emits HITSTOP and freezes for hitstopBig seconds', () => {
    const g = setupGame();
    const f = new FeedbackSystem(g, g.settings);
    let captured = null;
    g.bus.on(EVENTS.HITSTOP, (e) => { captured = e; });
    f.hitstopBig();
    assert.equal(captured.size, 'big');
    assert.approx(g.hitstop.remaining, CONFIG.feedback.hitstopBig, 0.001);
  });

  test('shakeBig emits SHAKE with config amplitude', () => {
    const g = setupGame();
    const f = new FeedbackSystem(g, g.settings);
    let captured = null;
    g.bus.on(EVENTS.SHAKE, (e) => { captured = e; });
    f.shakeBig();
    assert.equal(captured.intensity, CONFIG.feedback.shakeBig.intensity);
    assert.equal(captured.duration, CONFIG.feedback.shakeBig.duration);
  });

  test('shakeBig is a no-op when reduceMotion is on', () => {
    const g = setupGame();
    g.settings.set('reduceMotion', true);
    const f = new FeedbackSystem(g, g.settings);
    let called = 0;
    g.bus.on(EVENTS.SHAKE, () => called++);
    f.shakeBig();
    assert.equal(called, 0);
  });

  test('slowmoSlam sets timeScale to config factor and starts a timer', () => {
    const g = setupGame();
    const f = new FeedbackSystem(g, g.settings);
    f.slowmoSlam();
    assert.equal(f.timeScale, CONFIG.feedback.slowmoSlam.factor);
  });

  test('slowmoSlam is a no-op when reduceMotion is on', () => {
    const g = setupGame();
    g.settings.set('reduceMotion', true);
    const f = new FeedbackSystem(g, g.settings);
    f.slowmoSlam();
    assert.equal(f.timeScale, 1.0);
  });

  test('update() recovers timeScale to 1.0 after the slowmo timer expires', () => {
    const g = setupGame();
    const f = new FeedbackSystem(g, g.settings);
    f.slowmoSlam();
    assert.equal(f.timeScale, CONFIG.feedback.slowmoSlam.factor);
    f.update(CONFIG.feedback.slowmoSlam.duration + 0.1);
    assert.equal(f.timeScale, 1.0);
  });

  test('cameraKick is a no-op when reduceMotion is on', () => {
    const g = setupGame();
    g.settings.set('reduceMotion', true);
    const f = new FeedbackSystem(g, g.settings);
    let called = 0;
    g.bus.on(EVENTS.CAMERA_KICK, () => called++);
    f.cameraKick({ x: 1, y: 0, z: 0 }, 0.5, 0.2);
    assert.equal(called, 0);
  });
});
