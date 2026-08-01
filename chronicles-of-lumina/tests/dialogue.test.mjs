// tests/dialogue.test.mjs — line queue + choice API.
import './_setup.mjs';
import { EventBus } from '../src/core/event-bus.js';
import { DialogueSystem } from '../src/systems/dialogue-system.js';
import { EVENTS } from '../src/core/constants.js';
import { test, group, assert } from './_runner.mjs';

const setupGame = () => ({
  bus: new EventBus(),
});

group('DialogueSystem', () => {
  test('say() emits DIALOG_OPEN with who + text', () => {
    const g = setupGame();
    const ds = new DialogueSystem(g);
    let captured = null;
    g.bus.on(EVENTS.DIALOG_OPEN, (msg) => { captured = msg; });
    ds.say('Elder', 'Hallo');
    assert.equal(captured.who, 'Elder');
    assert.equal(captured.text, 'Hallo');
  });

  test('current() returns the active line', () => {
    const g = setupGame();
    const ds = new DialogueSystem(g);
    ds.say('A', 'message 1');
    assert.equal(ds.current.who, 'A');
    assert.equal(ds.current.text, 'message 1');
  });

  test('pickChoice() runs onPick and closes the dialog', () => {
    const g = setupGame();
    const ds = new DialogueSystem(g);
    let picked = null;
    ds.say('A', 'pick one', [
      { id: 'yes', label: 'Ja',  onPick: (id) => { picked = id; } },
      { id: 'no',  label: 'Nein', onPick: (id) => { picked = id; } },
    ]);
    let closed = false;
    g.bus.on(EVENTS.DIALOG_CLOSE, () => { closed = true; });
    ds.pickChoice('yes');
    assert.equal(picked, 'yes');
    assert.truthy(closed);
    assert.equal(ds.current, null);
  });

  test('pickChoice() does nothing when no choices set', () => {
    const g = setupGame();
    const ds = new DialogueSystem(g);
    ds.say('A', 'plain message');
    assert.notThrows(() => ds.pickChoice('any'));
  });

  test('pickChoice() ignores unknown id', () => {
    const g = setupGame();
    const ds = new DialogueSystem(g);
    let picked = null;
    ds.say('A', 'choose', [{ id: 'a', onPick: (id) => { picked = id; } }]);
    ds.pickChoice('does-not-exist');
    assert.equal(picked, null);
  });

  test('say() with choices does not auto-close (Infinity until)', () => {
    const g = setupGame();
    const ds = new DialogueSystem(g);
    ds.say('A', 'pick', [{ id: 'a', label: 'A' }]);
    assert.equal(ds.until, Infinity);
  });

  test('startIntro() uses the configured elderIntro', () => {
    const g = setupGame();
    const ds = new DialogueSystem(g);
    ds.startIntro();
    assert.equal(ds.current.who, 'Dorfälteste');
  });
});
