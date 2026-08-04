// tests/music.test.mjs — music engine scale + progression registry.
import './_setup.mjs';
import { SCALES, MOOD, CHORD_PROGRESSIONS, PROGRESSION } from '../src/engine/music.js';
import { test, group, assert } from './_runner.mjs';

group('music scales', () => {
  test('every documented biome has a scale', () => {
    const required = ['verdant', 'dunes', 'peaks', 'mire', 'ember'];
    for (const id of required) {
      assert.truthy(SCALES[id], `${id} missing scale`);
      assert.equal(SCALES[id].length, 6, `${id} scale should be 6 notes (pentatonic/hexatonic)`);
    }
  });

  test('all scale frequencies are positive and ascending', () => {
    for (const [name, scale] of Object.entries(SCALES)) {
      for (let i = 1; i < scale.length; i++) {
        assert.truthy(scale[i] > scale[i - 1],
          `${name}[${i}]=${scale[i]} should be > ${name}[${i-1}]=${scale[i-1]}`);
      }
    }
  });

  test('all scales fall in audible range (50-2000 Hz)', () => {
    for (const [name, scale] of Object.entries(SCALES)) {
      for (const f of scale) {
        assert.truthy(f >= 50 && f <= 2000,
          `${name} has out-of-range frequency ${f}Hz`);
      }
    }
  });
});

group('music moods', () => {
  test('every documented biome has a mood config', () => {
    for (const id of ['verdant', 'dunes', 'peaks', 'mire', 'ember']) {
      assert.truthy(MOOD[id], `${id} missing mood`);
      assert.truthy(['sine', 'square', 'sawtooth', 'triangle'].includes(MOOD[id].waveform),
        `${id} invalid waveform ${MOOD[id].waveform}`);
    }
  });

  test('all arp rates are in a sane range (0.1 - 2.0 sec)', () => {
    for (const [name, m] of Object.entries(MOOD)) {
      assert.truthy(m.arpRate >= 0.1 && m.arpRate <= 2.0,
        `${name} arp rate ${m.arpRate} out of range`);
    }
  });

  test('filter frequencies are in lowpass-safe range', () => {
    for (const [name, m] of Object.entries(MOOD)) {
      assert.truthy(m.filterFreq >= 200 && m.filterFreq <= 5000,
        `${name} filter ${m.filterFreq}Hz out of range`);
    }
  });
});

group('chord progressions', () => {
  test('every biome has a valid progression name', () => {
    for (const id of ['verdant', 'dunes', 'peaks', 'mire', 'ember', 'crystal', 'sky', 'reef', 'haunted', 'void']) {
      assert.truthy(PROGRESSION[id], `${id} missing progression`);
      const progName = PROGRESSION[id];
      assert.truthy(CHORD_PROGRESSIONS[progName], `${id} references unknown progression ${progName}`);
    }
  });

  test('each chord in a progression has 2-4 notes', () => {
    for (const [name, prog] of Object.entries(CHORD_PROGRESSIONS)) {
      for (const chord of prog) {
        assert.truthy(chord.length >= 2 && chord.length <= 4,
          `${name} chord ${chord} has ${chord.length} notes`);
      }
    }
  });
});
