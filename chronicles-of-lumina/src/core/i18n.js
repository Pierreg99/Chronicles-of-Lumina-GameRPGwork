// core/i18n.js — minimal i18n manager.
// - `t(key, params)` looks up a translation in the active locale.
// - Locale is stored in localStorage under `lumina_locale`, default 'de'.
// - Falls back to 'de' if a key is missing in the active locale.
//
// Locale JSON files live in src/locales/{de,en,...}.json — they are
// imported eagerly so the build remains zero-tooling.

import de from '../locales/de.json' with { type: 'json' };
import en from '../locales/en.json' with { type: 'json' };

const LOCALES = { de, en };
const DEFAULT_LOCALE = 'de';
const STORAGE_KEY = 'lumina_locale';

/** @typedef {keyof typeof LOCALES} Locale */

let active = (() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in LOCALES) return stored;
  } catch { /* ignore */ }
  return DEFAULT_LOCALE;
})();

/** @returns {Locale} currently active locale. */
export function getLocale() { return active; }

/**
 * Switch the active locale and persist.
 * @param {Locale} locale
 * @returns {void}
 */
export function setLocale(locale) {
  if (!(locale in LOCALES)) return;
  active = locale;
  try { localStorage.setItem(STORAGE_KEY, locale); } catch { /* ignore */ }
}

/** @returns {ReadonlyArray<Locale>} list of available locales. */
export function availableLocales() { return Object.keys(LOCALES); }

/**
 * Look up a translation key. Supports `{name}`-style parameter substitution.
 * Falls back to the default locale, then to the key itself, on miss.
 *
 * @param {string} key — dot-path like "ui.hearts.full" or flat "START_BTN"
 * @param {Record<string,string|number>} [params] — values to interpolate
 * @returns {string}
 */
export function t(key, params) {
  const lookup = (loc) => {
    const parts = key.split('.');
    let cur = LOCALES[loc];
    for (const p of parts) {
      if (cur == null) return undefined;
      cur = cur[p];
    }
    return typeof cur === 'string' ? cur : undefined;
  };
  let value = lookup(active);
  if (value === undefined && active !== DEFAULT_LOCALE) value = lookup(DEFAULT_LOCALE);
  if (value === undefined) return key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return value;
}
