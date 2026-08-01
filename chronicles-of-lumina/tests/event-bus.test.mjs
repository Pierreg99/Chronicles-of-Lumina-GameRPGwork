// tests/event-bus.test.mjs — core pub/sub used by every system and UI panel.
import './_setup.mjs';
import { EventBus } from '../src/core/event-bus.js';
import { test, group, assert } from './_runner.mjs';

group('EventBus', () => {
  test('emits to a single listener', () => {
    const bus = new EventBus();
    let called = 0;
    bus.on('foo', () => called++);
    bus.emit('foo');
    bus.emit('foo');
    assert.equal(called, 2);
  });

  test('emits to multiple listeners in order', () => {
    const bus = new EventBus();
    const log = [];
    bus.on('e', () => log.push('a'));
    bus.on('e', () => log.push('b'));
    bus.on('e', () => log.push('c'));
    bus.emit('e');
    assert.deepEqual(log, ['a', 'b', 'c']);
  });

  test('off() removes a listener', () => {
    const bus = new EventBus();
    let count = 0;
    const fn = () => count++;
    bus.on('x', fn);
    bus.emit('x');
    bus.off('x', fn);
    bus.emit('x');
    assert.equal(count, 1);
  });

  test('on() returns an unsubscribe function', () => {
    const bus = new EventBus();
    let n = 0;
    const unsub = bus.on('e', () => n++);
    bus.emit('e');
    unsub();
    bus.emit('e');
    assert.equal(n, 1);
  });

  test('emit() with no listeners is a no-op', () => {
    const bus = new EventBus();
    assert.notThrows(() => bus.emit('nobody-home'));
  });

  test('listener error does not break the chain', () => {
    const bus = new EventBus();
    const log = [];
    bus.on('e', () => { throw new Error('boom'); });
    bus.on('e', () => log.push('survived'));
    bus.emit('e');
    assert.deepEqual(log, ['survived']);
  });

  test('clear() removes all listeners', () => {
    const bus = new EventBus();
    let n = 0;
    bus.on('a', () => n++);
    bus.on('b', () => n++);
    bus.clear();
    bus.emit('a');
    bus.emit('b');
    assert.equal(n, 0);
  });
});
