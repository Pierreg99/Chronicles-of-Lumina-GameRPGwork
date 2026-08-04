// tests/photo-replay.test.mjs — photo mode + replay buffer.
import './_setup.mjs';
import {
  ReplayBuffer, getReplayConfig, getHighlights, summarizeReplay,
} from '../src/systems/photo-replay.js';
import { test, group, assert } from './_runner.mjs';

group('replay buffer', () => {
  test('starts empty', () => {
    const buf = new ReplayBuffer();
    assert.equal(buf.size(), 0);
    assert.equal(buf.readAll().length, 0);
  });

  test('push adds frames in order', () => {
    const buf = new ReplayBuffer();
    for (let i = 0; i < 5; i++) {
      buf.push({ t: i, x: i, y: 0, z: 0, yaw: 0, zone: 'verdant' });
    }
    assert.equal(buf.size(), 5);
    const frames = buf.readAll();
    for (let i = 0; i < 5; i++) {
      assert.equal(frames[i].t, i);
    }
  });

  test('circular overwrite preserves chronological order', () => {
    const buf = new ReplayBuffer();
    const { capacity } = getReplayConfig();
    // Push more than capacity
    for (let i = 0; i < capacity + 10; i++) {
      buf.push({ t: i, x: i, y: 0, z: 0, yaw: 0, zone: 'verdant' });
    }
    assert.equal(buf.size(), capacity);
    const frames = buf.readAll();
    // First frame should be t=10 (oldest surviving)
    assert.equal(frames[0].t, 10);
    // Last frame should be the most recent (t = capacity+9)
    assert.equal(frames[frames.length - 1].t, capacity + 9);
  });

  test('pause/resume stops recording', () => {
    const buf = new ReplayBuffer();
    buf.push({ t: 0, x: 0, y: 0, z: 0, yaw: 0, zone: 'verdant' });
    buf.pause();
    buf.push({ t: 1, x: 1, y: 0, z: 0, yaw: 0, zone: 'verdant' });
    assert.equal(buf.size(), 1);
    buf.resume();
    buf.push({ t: 2, x: 2, y: 0, z: 0, yaw: 0, zone: 'verdant' });
    assert.equal(buf.size(), 2);
  });

  test('clear wipes the buffer', () => {
    const buf = new ReplayBuffer();
    buf.push({ t: 0, x: 0, y: 0, z: 0, yaw: 0, zone: 'verdant' });
    buf.clear();
    assert.equal(buf.size(), 0);
  });
});

group('replay config', () => {
  test('capacity is 10 seconds at 60 fps', () => {
    const cfg = getReplayConfig();
    assert.equal(cfg.seconds, 10);
    assert.equal(cfg.fps, 60);
    assert.equal(cfg.capacity, 600);
  });
});

group('replay highlights', () => {
  test('returns at most 20 highlights', () => {
    const buf = new ReplayBuffer();
    for (let i = 0; i < 100; i++) {
      buf.push({ t: i, x: i, y: 0, z: 0, yaw: 0, zone: 'verdant' });
    }
    const highlights = getHighlights(buf);
    assert.truthy(highlights.length <= 20);
  });

  test('returns all frames if fewer than 20', () => {
    const buf = new ReplayBuffer();
    for (let i = 0; i < 5; i++) {
      buf.push({ t: i, x: i, y: 0, z: 0, yaw: 0, zone: 'verdant' });
    }
    assert.equal(getHighlights(buf).length, 5);
  });
});

group('replay summary', () => {
  test('counts unique zones', () => {
    const buf = new ReplayBuffer();
    buf.push({ t: 0, x: 0, y: 0, z: 0, yaw: 0, zone: 'verdant' });
    buf.push({ t: 1, x: 5, y: 0, z: 0, yaw: 0, zone: 'verdant' });
    buf.push({ t: 2, x: 10, y: 0, z: 0, yaw: 0, zone: 'dunes' });
    const summary = summarizeReplay(buf);
    assert.equal(summary.zones, 2);
  });

  test('computes max distance from start', () => {
    const buf = new ReplayBuffer();
    buf.push({ t: 0, x: 0, y: 0, z: 0, yaw: 0, zone: 'verdant' });
    buf.push({ t: 1, x: 3, y: 0, z: 4, yaw: 0, zone: 'verdant' });
    const summary = summarizeReplay(buf);
    assert.equal(summary.distance, 5);
  });

  test('returns zeros for empty buffer', () => {
    const buf = new ReplayBuffer();
    const summary = summarizeReplay(buf);
    assert.equal(summary.zones, 0);
    assert.equal(summary.distance, 0);
    assert.equal(summary.duration, 0);
  });
});
