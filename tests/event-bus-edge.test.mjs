// tests/event-bus-edge.test.mjs — EventBus edge cases (on/off, clear, errors).
import './_setup.mjs';
import { EventBus } from '../src/core/event-bus.js';
import { test, group, assert, done } from './_runner.mjs';

group('EventBus edge cases', () => {
  test('on() returns an unsubscribe handle', () => {
    const bus = new EventBus();
    let n = 0;
    const off = bus.on('e', () => n++);
    bus.emit('e');
    bus.emit('e');
    assert.equal(n, 2);
    off();
    bus.emit('e');
    assert.equal(n, 2);
  });

  test('off() removes only the specific listener', () => {
    const bus = new EventBus();
    const calls = [];
    bus.on('e', () => calls.push('a'));
    bus.on('e', () => calls.push('b'));
    bus.off('e', calls[0] /* not the fn — should be no-op */);
    bus.emit('e');
    assert.deepEqual(calls, ['a', 'b']);
  });

  test('emit() with no listeners is a no-op (no throw)', () => {
    const bus = new EventBus();
    bus.emit('nobody-home');
    bus.emit('still-nobody');
    assert.equal(true, true);
  });

  test('one listener throwing does not stop other listeners', () => {
    const bus = new EventBus();
    const calls = [];
    bus.on('e', () => { throw new Error('boom'); });
    bus.on('e', () => calls.push('after-throw'));
    bus.emit('e');
    assert.deepEqual(calls, ['after-throw']);
  });

  test('clear() removes all listeners across all events', () => {
    const bus = new EventBus();
    let n = 0;
    bus.on('a', () => n++);
    bus.on('b', () => n++);
    bus.on('c', () => n++);
    bus.clear();
    bus.emit('a'); bus.emit('b'); bus.emit('c');
    assert.equal(n, 0);
  });

  test('same listener registered twice is only called once', () => {
    const bus = new EventBus();
    let n = 0;
    const fn = () => n++;
    bus.on('e', fn);
    bus.on('e', fn);  // Set dedupes — second add is a no-op
    bus.emit('e');
    assert.equal(n, 1);
  });
});

done();
