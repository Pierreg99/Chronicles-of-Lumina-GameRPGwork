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

export class CodexSystem {
  constructor(game) {
    this.game = game;
    this.bus = game.bus;
    this.entries = new Map(ENTRIES.map((e) => [e.id, { ...e, unlocked: false }]));
    this._load();
    this._wire();
  }

  _wire() {
    this.bus.on(EVENTS.ENEMY_DIED, (e) => this.unlock(e.spec.id));
    this.bus.on(EVENTS.LOOT_PICKUP_CRYSTAL, () => this.unlock('crystal'));
    this.bus.on(EVENTS.LOOT_PICKUP_BERRY,   () => this.unlock('berry'));
    this.bus.on(EVENTS.BOSS_DIED, () => this.unlock('boss_nebelkoloss'));
    this.bus.on('shrine:visit', () => this.unlock('shrine'));
    this.bus.on('village:visit', () => this.unlock('village'));
  }

  unlock(id) {
    const entry = this.entries.get(id);
    if (!entry) return;
    if (entry.unlocked) return;
    entry.unlocked = true;
    this.bus.emit(EVENTS.CODEX_UNLOCK, { id, name: entry.name });
    this._save();
  }

  getUnlocked() { return Array.from(this.entries.values()).filter((e) => e.unlocked); }
  getAll() { return Array.from(this.entries.values()); }
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

  reset() {
    for (const e of this.entries.values()) e.unlocked = false;
    this._save();
  }
}
