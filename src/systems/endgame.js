// systems/endgame.js — endless mode, hardcore mode, 5 challenge
// modes, and a localStorage-backed leaderboard.

export const CHALLENGE_MODES = {
  ENDLESS:        { id: 'endless',        name: 'Endlos',          desc: 'Überlebe immer weiter. Welle steigt endlos.', rules: { endless: true } },
  HARDCORE:       { id: 'hardcore',       name: 'Hardcore',        desc: 'Ein Tod = Spielende. Kein Speichern.',     rules: { hardcore: true } },
  SPEEDRUN:       { id: 'speedrun',       name: 'Speedrun',        desc: 'Beende in unter 10 Minuten.',              rules: { speedrun: true, timeLimit: 600 } },
  GLASS_CANNON:   { id: 'glass_cannon',   name: 'Glaskanone',      desc: '1 HP, 10x Schaden.',                       rules: { hp: 1, damageMul: 10 } },
  NO_SPELLS:      { id: 'no_spells',      name: 'Keine Magie',     desc: 'Magie deaktiviert. Nur Nahkampf.',         rules: { spellsDisabled: true } },
  ENDLESS_BOSS:   { id: 'endless_boss',   name: 'Boss-Sturm',      desc: 'Nur Bosse. Endlos.',                       rules: { bossesOnly: true, endless: true } },
  IRONMAN:        { id: 'ironman',        name: 'Ironman',         desc: 'Hardcore + kein Laden + Speedrun-Timer.',  rules: { hardcore: true, noSave: true, timeLimit: 1800 } },
  PACIFIST:       { id: 'pacifist',       name: 'Pazifist',        desc: 'Keine Kills. Nur Ausweichen.',             rules: { killsAllowed: 0 } },
  NIGHTMARE:      { id: 'nightmare',      name: 'Albtraum',        desc: 'Gegner +50% HP, +50% Schaden.',            rules: { enemyHpMul: 1.5, enemyDmgMul: 1.5 } },
  RANDOM:         { id: 'random',         name: 'Zufalls-Modus',   desc: 'Jeder Run = zufällige Regeln.',            rules: { random: true } },
};

export const DIFFICULTY = {
  NORMAL:    { id: 'normal',    name: 'Normal',    hpMul: 1.0, dmgMul: 1.0, xpMul: 1.0 },
  HARD:      { id: 'hard',      name: 'Hart',      hpMul: 1.5, dmgMul: 1.2, xpMul: 1.5 },
  NIGHTMARE: { id: 'nightmare', name: 'Albtraum',  hpMul: 2.0, dmgMul: 1.5, xpMul: 2.5 },
};

/**
 * Apply a challenge mode's rules to a state. Returns a NEW state
 * (does not mutate).
 */
export function applyChallenge(challengeId, state) {
  const mode = CHALLENGE_MODES[challengeId.toUpperCase()];
  if (!mode) return state;
  const out = { ...state, challenge: challengeId };
  const r = mode.rules;
  if (r.hp != null) out.hp = r.hp;
  if (r.damageMul) out.damageMul = r.damageMul;
  if (r.timeLimit) out.timeLimit = r.timeLimit;
  return out;
}

/**
 * Validate that a player is still alive in a given mode.
 */
export function isAlive(state, modeId) {
  const mode = modeId ? CHALLENGE_MODES[modeId.toUpperCase()] : null;
  if (mode?.rules.hardcore && state.deaths >= 1) return false;
  if (state.hp != null && state.hp <= 0) return false;
  return true;
}

/**
 * Track an endless run. Each wave scales: wave 1 is easy, wave 10
 * is 2x harder, wave 100 is 10x.
 */
export function endlessWaveState(wave) {
  return {
    wave,
    enemyHpMul: 1 + (wave - 1) * 0.1,
    enemyDmgMul: 1 + (wave - 1) * 0.08,
    enemyCount: Math.min(50, 3 + Math.floor(wave / 2)),
    xpMul: 1 + (wave - 1) * 0.05,
  };
}

/**
 * localStorage leaderboard. Each entry: { name, score, mode, wave,
 * time, date }. Stored as a single JSON array.
 */
const STORAGE_KEY = 'lumina-leaderboard-v1';

export function loadLeaderboard() {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr;
  } catch (_) { return []; }
}

export function saveLeaderboard(entries) {
  try {
    if (typeof localStorage === 'undefined') return false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch (_) { return false; }
}

export function addLeaderboardEntry(entry) {
  const entries = loadLeaderboard();
  entries.push({
    name: entry.name || 'Anonymous',
    score: entry.score || 0,
    mode: entry.mode || 'endless',
    wave: entry.wave || 0,
    time: entry.time || 0,
    level: entry.level || 0,
    kills: entry.kills || 0,
    date: entry.date || Date.now(),
  });
  saveLeaderboard(entries);
  return entries;
}

export function getTopScores(limit = 10, mode = null) {
  const entries = loadLeaderboard();
  const filtered = mode ? entries.filter((e) => e.mode === mode) : entries;
  filtered.sort((a, b) => b.score - a.score);
  return filtered.slice(0, limit);
}

export function clearLeaderboard() {
  try {
    if (typeof localStorage === 'undefined') return false;
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (_) { return false; }
}

/**
 * Compute a run score for the leaderboard.
 * Weighted: kills * 10 + wave * 100 + time_bonus + level * 50
 */
export function computeRunScore(run) {
  const kills = (run.kills || 0) * 10;
  const wave = (run.wave || 0) * 100;
  const timeBonus = Math.max(0, 600 - (run.time || 0)) * 5; // bonus for fast runs
  const level = (run.level || 0) * 50;
  return kills + wave + timeBonus + level;
}

export function totalChallengeModes() {
  return Object.keys(CHALLENGE_MODES).length;
}
