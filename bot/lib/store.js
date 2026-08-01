// lib/store.js — JSON-file backed persistence for reports & suggestions.
// Lightweight alternative to a DB. Each file is an array of objects.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const DATA_DIR = resolve(process.env.DATA_DIR ?? './data');

async function ensureDir(path) {
  if (!existsSync(dirname(path))) await mkdir(dirname(path), { recursive: true });
}

async function load(file, fallback) {
  const path = resolve(DATA_DIR, file);
  await ensureDir(path);
  if (!existsSync(path)) {
    await writeFile(path, JSON.stringify(fallback, null, 2), 'utf8');
    return fallback;
  }
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return fallback;
  }
}

async function save(file, data) {
  const path = resolve(DATA_DIR, file);
  await ensureDir(path);
  await writeFile(path, JSON.stringify(data, null, 2), 'utf8');
}

function randomId() { return String(Math.floor(1000 + Math.random() * 9000)); }

export const Store = {
  async addBugReport({ user, description }) {
    const id = randomId();
    const all = await load('reports.json', []);
    const entry = { id, user: user.id, userTag: user.tag, description, createdAt: new Date().toISOString() };
    all.push(entry);
    await save('reports.json', all);
    return { ...entry, id };
  },

  async addSuggestion({ user, idea, complexity }) {
    const id = randomId();
    const all = await load('suggestions.json', []);
    const entry = { id, user: user.id, userTag: user.tag, idea, complexity, createdAt: new Date().toISOString() };
    all.push(entry);
    await save('suggestions.json', all);
    return { ...entry, id };
  },

  async leaderboard() {
    return load('leaderboard.json', [
      { name: 'Aren, der Lichtbringer',   crystals: 142 },
      { name: 'Mirella von Sonnenhain',   crystals: 128 },
      { name: 'Tobias Schattenfeder',     crystals: 117 },
      { name: 'Kaja Kristallweber',       crystals:  98 },
      { name: 'Lennart Nebelrufer',       crystals:  82 },
    ]);
  },
};

/** Heuristik für die Umsetzbarkeit einer Idee (Schlüsselwort-getrieben). */
export function classifyComplexity(idea = '') {
  const lower = idea.toLowerCase();
  if (/(neue[smr]?\s+(welt|ort|biome|level)|story|geschichte|cutscene)/.test(lower)) return '🟣 komplex';
  if (/(animation|modell|3d|shader|partikel|ki|boss|kampf)/.test(lower))           return '🟠 mittel';
  if (/(ui|hud|farbe|ton|sound|lautstärke|tasten|steuerung|einstellung|tipp)/.test(lower)) return '🟢 einfach';
  return '⚪ unklar';
}
