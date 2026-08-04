// tests/voice.test.mjs — voice bark preset registry.
import './_setup.mjs';
import { BARK_PRESETS, FORMANTS } from '../src/engine/voice.js';
import { test, group, assert } from './_runner.mjs';

group('bark presets', () => {
  test('every preset has required fields', () => {
    for (const [name, p] of Object.entries(BARK_PRESETS)) {
      assert.truthy(p.freq > 0, `${name} freq`);
      assert.truthy(p.durSec > 0, `${name} duration`);
      assert.truthy(Array.isArray(p.formants) && p.formants.length >= 1, `${name} formants`);
      assert.truthy(p.attackSec >= 0 && p.releaseSec >= 0, `${name} envelope`);
      assert.truthy(['sine', 'square', 'sawtooth'].includes(p.type), `${name} waveform`);
      assert.truthy(p.gain > 0 && p.gain <= 0.5, `${name} gain`);
    }
  });

  test('all formants reference valid vowel keys', () => {
    for (const [name, p] of Object.entries(BARK_PRESETS)) {
      for (const f of p.formants) {
        assert.truthy(FORMANTS[f], `${name} references unknown formant ${f}`);
      }
    }
  });

  test('all bark frequencies fall in audible range (50-2000 Hz)', () => {
    for (const [name, p] of Object.entries(BARK_PRESETS)) {
      assert.truthy(p.freq >= 50 && p.freq <= 2000, `${name} start freq ${p.freq}`);
      if (p.freqEnd) {
        assert.truthy(p.freqEnd >= 30 && p.freqEnd <= 3000, `${name} end freq ${p.freqEnd}`);
      }
    }
  });

  test('durations are in a sane range (0.05 - 2.0 sec)', () => {
    for (const [name, p] of Object.entries(BARK_PRESETS)) {
      assert.truthy(p.durSec >= 0.05 && p.durSec <= 2.0,
        `${name} duration ${p.durSec} out of range`);
    }
  });

  test('death bark is the longest, pickup is short', () => {
    assert.truthy(BARK_PRESETS.death.durSec > BARK_PRESETS.pickup.durSec);
    assert.truthy(BARK_PRESETS.death.durSec > BARK_PRESETS.hit.durSec);
  });
});

group('formant table', () => {
  test('every vowel has 3 formants in increasing frequency', () => {
    for (const [name, f] of Object.entries(FORMANTS)) {
      assert.truthy(f.f1 < f.f2, `${name} f1 < f2`);
      assert.truthy(f.f2 < f.f3, `${name} f2 < f3`);
      assert.truthy(f.f1 >= 200 && f.f1 <= 1000, `${name} f1 in range`);
      assert.truthy(f.f2 >= 700 && f.f2 <= 2500, `${name} f2 in range`);
      assert.truthy(f.f3 >= 2000 && f.f3 <= 3500, `${name} f3 in range`);
    }
  });
});
