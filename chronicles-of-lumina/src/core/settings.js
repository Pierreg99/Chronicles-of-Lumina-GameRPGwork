// core/settings.js — LocalStorage-backed settings store. Used by Phase 8 but
// scaffolded now so other phases can read settings safely.

const KEY = 'lumina_settings_v1';

const DEFAULTS = Object.freeze({
  masterVolume: 0.7,
  sfxVolume: 0.7,
  musicVolume: 0.35,
  reduceMotion: false,
  colorblind: false,
  cameraSensitivity: 1.0,
  showFPS: false,
});

export class Settings {
  constructor() {
    this._data = { ...DEFAULTS };
    this._load();
  }

  _load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) Object.assign(this._data, JSON.parse(raw));
    } catch (_) { /* ignore */ }
  }

  _save() {
    try { localStorage.setItem(KEY, JSON.stringify(this._data)); } catch (_) {}
  }

  get(key) { return this._data[key]; }

  set(key, value) {
    if (!(key in DEFAULTS)) return;
    this._data[key] = value;
    this._save();
  }

  all() { return { ...this._data }; }

  reset() { this._data = { ...DEFAULTS }; this._save(); }
}

export const settings = new Settings();
export const SETTINGS_KEYS = Object.freeze({ ...DEFAULTS });
