// core/settings.js — LocalStorage-backed settings store. Used by Phase 8 but
// scaffolded now so other phases can read settings safely.

/** @typedef {number|boolean|string|undefined} SettingsValue — value type for any settings key. */

/**
 * @typedef {object} SettingsData
 * @property {number}  masterVolume
 * @property {number}  sfxVolume
 * @property {number}  musicVolume
 * @property {boolean} reduceMotion
 * @property {boolean} colorblind
 * @property {number}  cameraSensitivity
 * @property {boolean} showFPS
 */

const KEY = 'lumina_settings_v1';

/** @type {SettingsData} */
const DEFAULTS = Object.freeze({
  masterVolume: 0.7,
  sfxVolume: 0.7,
  musicVolume: 0.35,
  reduceMotion: false,
  colorblind: false,
  cameraSensitivity: 1.0,
  showFPS: false,
});

/**
 * Persistent settings store. Auto-loads from localStorage on construction.
 * Unknown keys in `set()` are silently rejected (defensive against typos).
 */
export class Settings {
  constructor() {
    /** @type {SettingsData} */
    this._data = { ...DEFAULTS };
    this._load();
  }

  /** @private load from localStorage; ignore parse errors. */
  _load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) Object.assign(this._data, JSON.parse(raw));
    } catch (_) { /* ignore */ }
  }

  /** @private write to localStorage; ignore quota errors. */
  _save() {
    try { localStorage.setItem(KEY, JSON.stringify(this._data)); } catch (_) {}
  }

  /**
   * Read a setting by key. Returns `undefined` for unknown keys.
   * @param {keyof SettingsData} key
   * @returns {SettingsValue|undefined}
   */
  get(key) { return this._data[key]; }

  /**
   * Update a setting. Unknown keys are rejected silently.
   * @param {string} key
   * @param {SettingsValue} value
   * @returns {void}
   */
  set(key, value) {
    if (!(key in DEFAULTS)) return;
    // The narrow SettingsData property type doesn't accept the union
    // SettingsValue; this is a known limitation of using a plain object
    // as a typed store. Suppress the diagnostic.
    // @ts-ignore
    this._data[key] = value;
    this._save();
  }

  /** @returns {SettingsData} shallow clone (caller can't mutate the store). */
  all() { return { ...this._data }; }

  /** Reset every setting to its default and persist. */
  reset() { this._data = { ...DEFAULTS }; this._save(); }
}

/** Process-wide singleton. Most code should import this, not `new Settings()`. */
export const settings = new Settings();

/** Frozen copy of the default keys, useful for type-guard introspection. */
export const SETTINGS_KEYS = Object.freeze({ ...DEFAULTS });
