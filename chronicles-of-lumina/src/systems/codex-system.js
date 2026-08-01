// systems/codex-system.js — Phase R1: takes `game`.

import { EVENTS } from '../core/constants.js';

const STORAGE_KEY = 'lumina_codex_v1';

const ENTRIES = [
  { id: 'slime_blue',   category: 'Gegner', name: 'Wiesen-Schleim',  desc: 'Langsamer, blauer Schleim aus den Wiesen. 2 HP.' },
  { id: 'slime_green',  category: 'Gegner', name: 'Blatt-Schleim',   desc: 'Springt aggressiv an. 3 HP.' },
  { id: 'slime_purple', category: 'Gegner', name: 'Nebel-Schleim',   desc: 'Schießt lila Projektile aus der Ferne. 3 HP.' },
  { id: 'boss_nebelkoloss', category: 'Boss', name: 'Nebel-Koloss', desc: 'Uralter Wächter des Schreins. 25 HP, 2 Angriffe.' },
  { id: 'crystal',      category: 'Items',  name: 'Lichtkristall',  desc: 'Reinigt den Schrein. 10 Stück erforderlich.' },
  { id: 'berry',        category: 'Items',  name: 'Heilbeere',      desc: 'Stellt 2 HP wieder her. Droppt von Schleimen.' },
  { id: 'shrine',       category: 'Orte',   name: 'Smaragdwald-Schrein', desc: 'Ein verfallener Schrein am Ende des Waldes.' },
  { id: 'village',      category: 'Orte',   name: 'Dorf Sonnenhain',     desc: 'Heimatdorf des Helden.' },
];

/**
 * @typedef {import('../core/game.js').Game} Game
 *
 * @typedef {object} CodexEntry
 * @property {string} id
 * @property {string} category
 * @property {string} name
 * @property {string} desc
 * @property {boolean} unlocked
 */

import { t } from '../core/i18n.js';

const ENTRIES_META = [
  { id: 'slime_blue',       category: 'Gegner' },
  { id: 'slime_green',      category: 'Gegner' },
  { id: 'slime_purple',     category: 'Gegner' },
  { id: 'boss_nebelkoloss', category: 'Boss'   },
  { id: 'crystal',          category: 'Items'  },
  { id: 'berry',            category: 'Items'  },
  { id: 'shrine',           category: 'Orte'   },
  { id: 'village',          category: 'Orte'   },
];

function buildEntries() {
  return ENTRIES_META.map((m) => ({
    ...m,
    name: t(`codex.${m.id}.name`),
    desc: t(`codex.${m.id}.desc`),
    unlocked: false,
  }));
}

/**
 * Bestiary + lore catalogue. Auto-unlocks entries based on game events,
 * persists `unlocked` flags to localStorage.
 * @see EVENTS.CODEX_UNLOCK
 */
export class CodexSystem {
  /**
   * @param {Game} game
   */
  constructor(game) {
    this.game = game;
    this.bus = game.bus;
    /** @type {Map<string, CodexEntry>} */
    this.entries = new Map(buildEntries().map((e) => [e.id, e]));
    this._load();
    this._wire();
  }

  /** Re-derive name/desc from the active locale (e.g. after a language switch). */
  retranslate() {
    for (const m of ENTRIES_META) {
      const entry = this.entries.get(m.id);
      if (!entry) continue;
      entry.name = t(`codex.${m.id}.name`);
      entry.desc = t(`codex.${m.id}.desc`);
    }
  }

  _wire() {
    this.bus.on(EVENTS.ENEMY_DIED, (e) => this.unlock(e.spec.id));
    this.bus.on(EVENTS.LOOT_PICKUP_CRYSTAL, () => this.unlock('crystal'));
    this.bus.on(EVENTS.LOOT_PICKUP_BERRY,   () => this.unlock('berry'));
    this.bus.on(EVENTS.BOSS_DIED, () => this.unlock('boss_nebelkoloss'));
    this.bus.on('shrine:visit', () => this.unlock('shrine'));
    this.bus.on('village:visit', () => this.unlock('village'));
  }

  /**
   * Mark an entry as unlocked. Idempotent — already-unlocked entries emit nothing.
   * Unknown ids are silently ignored.
   * @param {string} id
   * @returns {void}
   */
  unlock(id) {
    const entry = this.entries.get(id);
    if (!entry) return;
    if (entry.unlocked) return;
    entry.unlocked = true;
    this.bus.emit(EVENTS.CODEX_UNLOCK, { id, name: entry.name });
    this._save();
  }

  /** @returns {CodexEntry[]} all entries the player has unlocked so far. */
  getUnlocked() { return Array.from(this.entries.values()).filter((e) => e.unlocked); }

  /** @returns {CodexEntry[]} the full catalogue, unlocked + locked. */
  getAll() { return Array.from(this.entries.values()); }

  /**
   * @returns {{total:number, unlocked:number, pct:number}} discovery progress.
   */
  progress() {
    const total = this.entries.size;
    const unlocked = this.getUnlocked().length;
    return { total, unlocked, pct: Math.round(unlocked / total * 100) };
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      for (const [id, unlocked] of Object.entries(saved)) {
        if (this.entries.has(id)) this.entries.get(id).unlocked = !!unlocked;
      }
    } catch (_) { /* ignore */ }
  }

  _save() {
    try {
      const data = {};
      for (const [id, e] of this.entries) data[id] = e.unlocked;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (_) { /* ignore */ }
  }

  /**
   * Mark every entry as locked again, persist.
   * @returns {void}
   */
  reset() {
    for (const e of this.entries.values()) e.unlocked = false;
    this._save();
  }
}
