// tests/codex.test.mjs — bestiary + localStorage persistence.
import './_setup.mjs';
import { EventBus } from '../src/core/event-bus.js';
import { CodexSystem } from '../src/systems/codex-system.js';
import { EVENTS } from '../src/core/constants.js';
import { test, group, assert } from './_runner.mjs';

const setupGame = () => {
  localStorage.clear();
  return { bus: new EventBus() };
};

group('CodexSystem', () => {
  test('starts with everything locked', () => {
    const g = setupGame();
    const c = new CodexSystem(g);
    const u = c.getUnlocked();
    assert.equal(u.length, 0);
  });

  test('unlock() flips the unlocked flag and emits CODEX_UNLOCK', () => {
    const g = setupGame();
    const c = new CodexSystem(g);
    let captured = null;
    g.bus.on(EVENTS.CODEX_UNLOCK, (e) => { captured = e; });
    c.unlock('slime_blue');
    assert.equal(captured.id, 'slime_blue');
    assert.equal(c.getUnlocked().length, 1);
  });

  test('unlock() is idempotent — second call does not re-emit', () => {
    const g = setupGame();
    const c = new CodexSystem(g);
    let n = 0;
    g.bus.on(EVENTS.CODEX_UNLOCK, () => n++);
    c.unlock('slime_blue'); // first — emits
    c.unlock('slime_blue'); // second — short-circuits
    c.unlock('slime_blue'); // third — short-circuits
    assert.equal(n, 1);
  });

  test('unlock() ignores unknown ids', () => {
    const g = setupGame();
    const c = new CodexSystem(g);
    let n = 0;
    g.bus.on(EVENTS.CODEX_UNLOCK, () => n++);
    c.unlock('this-is-not-in-the-catalogue');
    assert.equal(c.getUnlocked().length, 0);
    assert.equal(n, 0);
  });

  test('progress() reports total / unlocked / pct', () => {
    const g = setupGame();
    const c = new CodexSystem(g);
    c.unlock('slime_blue');
    c.unlock('crystal');
    const p = c.progress();
    assert.equal(p.unlocked, 2);
    assert.equal(p.total, c.getAll().length);
    assert.truthy(p.pct >= 0 && p.pct <= 100);
  });

  test('persists unlocked set to localStorage', () => {
    const g = setupGame();
    const c = new CodexSystem(g);
    c.unlock('slime_green');
    const raw = localStorage.getItem('lumina_codex_v1');
    assert.truthy(raw);
    const parsed = JSON.parse(raw);
    assert.equal(parsed.slime_green, true);
  });

  test('second instance reads persisted unlocks', () => {
    localStorage.clear();
    const g1 = { bus: new EventBus() };
    const c1 = new CodexSystem(g1);
    c1.unlock('slime_purple');
    const g2 = { bus: new EventBus() };
    const c2 = new CodexSystem(g2);
    assert.truthy(c2.entries.get('slime_purple').unlocked);
  });

  test('getAll() returns the full catalogue', () => {
    const g = setupGame();
    const c = new CodexSystem(g);
    assert.truthy(c.getAll().length > 0);
    assert.truthy(c.getAll().every((e) => e.id && e.name && e.category));
  });

  test('listens to ENEMY_DIED to auto-unlock', () => {
    const g = setupGame();
    const c = new CodexSystem(g);
    g.bus.emit(EVENTS.ENEMY_DIED, { spec: { id: 'slime_blue' } });
    assert.truthy(c.entries.get('slime_blue').unlocked);
  });

  test('reset() clears all unlocks', () => {
    const g = setupGame();
    const c = new CodexSystem(g);
    c.unlock('slime_blue');
    c.reset();
    assert.equal(c.getUnlocked().length, 0);
  });
});
