// tests/settings.test.mjs — localStorage-backed settings store.
import './_setup.mjs';
import { Settings, SETTINGS_KEYS } from '../src/core/settings.js';
import { test, group, assert } from './_runner.mjs';

group('Settings', () => {
  test('returns default values on first read', () => {
    localStorage.clear();
    const s = new Settings();
    assert.equal(s.get('masterVolume'), 0.7);
    assert.equal(s.get('reduceMotion'), false);
  });

  test('set() updates and persists', () => {
    const s = new Settings();
    s.set('masterVolume', 0.3);
    assert.equal(s.get('masterVolume'), 0.3);
    const raw = localStorage.getItem('lumina_settings_v1');
    assert.truthy(raw);
    const parsed = JSON.parse(raw);
    assert.equal(parsed.masterVolume, 0.3);
  });

  test('reload from storage on second instance', () => {
    const s1 = new Settings();
    s1.set('sfxVolume', 0.123);
    const s2 = new Settings();
    assert.equal(s2.get('sfxVolume'), 0.123);
  });

  test('rejects unknown keys', () => {
    const s = new Settings();
    s.set('madeUpKey', 'value');
    assert.equal(s.get('madeUpKey'), undefined);
  });

  test('reset() restores defaults', () => {
    const s = new Settings();
    s.set('masterVolume', 0.1);
    s.reset();
    assert.equal(s.get('masterVolume'), 0.7);
  });

  test('all() returns a snapshot', () => {
    const s = new Settings();
    const all = s.all();
    assert.truthy(typeof all === 'object');
    assert.truthy('masterVolume' in all);
  });

  test('SETTINGS_KEYS exposes the default keys', () => {
    assert.truthy('masterVolume' in SETTINGS_KEYS);
    assert.truthy('reduceMotion' in SETTINGS_KEYS);
    assert.truthy('colorblind' in SETTINGS_KEYS);
  });
});
