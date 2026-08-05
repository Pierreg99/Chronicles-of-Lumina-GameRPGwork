// systems/daily-challenge.js — daily challenge mode with rotating
// seeds, bonus rewards, and shared leaderboard.

const CHALLENGE_POOL = [
  { id: 'c_slayer',     name: 'Tag der Jäger',          desc: 'Besiege 50 Gegner in unter 5 Minuten.',         target: { type: 'kill', count: 50 },      bonus: { xpMul: 2, goldMul: 2 } },
  { id: 'c_gatherer',   name: 'Tag der Sammler',        desc: 'Sammle 30 Materialien in unter 3 Minuten.',    target: { type: 'collect', count: 30 },  bonus: { xpMul: 1.5, goldMul: 1.5 } },
  { id: 'c_explorer',   name: 'Tag der Entdecker',      desc: 'Besuche 5 Biome in unter 10 Minuten.',          target: { type: 'visit', count: 5 },     bonus: { xpMul: 1.5, goldMul: 1.5 } },
  { id: 'c_crafter',    name: 'Tag der Handwerker',     desc: 'Stelle 10 Items in unter 4 Minuten her.',        target: { type: 'craft', count: 10 },    bonus: { xpMul: 1.5, goldMul: 2 } },
  { id: 'c_boss',       name: 'Tag der Bosse',          desc: 'Besiege 3 Bosse in unter 8 Minuten.',           target: { type: 'kill', target: 'boss', count: 3 }, bonus: { xpMul: 3, goldMul: 3 } },
  { id: 'c_speedrun',   name: 'Speedrun-Tag',           desc: 'Beende 1 Dungeon in unter 2 Minuten.',          target: { type: 'dungeon', count: 1 },   bonus: { xpMul: 2, goldMul: 1.5 } },
  { id: 'c_purist',     name: 'Tag der Puristen',       desc: 'Besiege 20 Gegner ohne Tränke.',               target: { type: 'kill', count: 20, noPotions: true }, bonus: { xpMul: 2, goldMul: 1 } },
  { id: 'c_mage',       name: 'Tag der Magier',         desc: 'Wirke 30 Zauber in unter 5 Minuten.',          target: { type: 'cast', count: 30 },     bonus: { xpMul: 2, goldMul: 1.5 } },
  { id: 'c_dungeon',    name: 'Tag der Katakomben',     desc: 'Betrete 3 Dungeons in unter 6 Minuten.',        target: { type: 'dungeon', count: 3 },   bonus: { xpMul: 2, goldMul: 2 } },
  { id: 'c_arena',      name: 'Arena-Tag',              desc: 'Besiege 30 Gegner in der Arena.',              target: { type: 'kill', count: 30, arena: true }, bonus: { xpMul: 1.5, goldMul: 1.5 } },
];

/**
 * Pick today's challenge deterministically by date.
 * Same date = same challenge for everyone.
 * @param {Date} [date]
 */
export function getDailyChallenge(date = new Date()) {
  const dayKey = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
  let hash = 0;
  for (let i = 0; i < dayKey.length; i++) {
    hash = (hash * 31 + dayKey.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % CHALLENGE_POOL.length;
  const c = CHALLENGE_POOL[idx];
  return { ...c, dayKey, date: date.toISOString().slice(0, 10) };
}

/** Seed for the daily challenge. Used for map generation. */
export function getDailySeed(date = new Date()) {
  const dayKey = `${date.getUTCFullYear()}${date.getUTCMonth()}${date.getUTCDate()}`;
  let hash = 2166136261;
  for (let i = 0; i < dayKey.length; i++) {
    hash ^= dayKey.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }
  return hash;
}

export function listDailyChallenges() { return [...CHALLENGE_POOL]; }
export function totalDailyChallenges() { return CHALLENGE_POOL.length; }

/** Check progress on a daily challenge. */
export function dailyProgress(challenge, state) {
  if (!challenge || !challenge.target) return { progress: 0, done: false };
  const t = challenge.target;
  let have = 0;
  if (t.type === 'kill') have = state.kills || 0;
  if (t.type === 'collect') have = state.collected || 0;
  if (t.type === 'visit') have = state.visitedZones?.size || 0;
  if (t.type === 'craft') have = state.itemsCrafted || 0;
  if (t.type === 'dungeon') have = state.dungeonsCompleted || 0;
  if (t.type === 'cast') have = state.spellsCast || 0;
  const progress = Math.min(1, have / t.count);
  return { progress, done: have >= t.count };
}

/**
 * Apply bonus rewards when a daily challenge is completed.
 * Returns the bonus amounts applied.
 */
export function applyDailyBonus(challenge, state) {
  if (!challenge?.bonus) return { xp: 0, gold: 0 };
  const baseXp = state.xp || 0;
  const baseGold = state.gold || 0;
  const bonusXp = Math.floor(baseXp * (challenge.bonus.xpMul - 1));
  const bonusGold = Math.floor(baseGold * (challenge.bonus.goldMul - 1));
  state.xp = (state.xp || 0) + bonusXp;
  state.gold = (state.gold || 0) + bonusGold;
  return { xp: bonusXp, gold: bonusGold };
}

/**
 * Track daily completion. Stored as date -> challengeId mapping.
 */
const DAILY_STORAGE_KEY = 'lumina-daily-completions-v1';

export function loadDailyCompletions() {
  try {
    if (typeof localStorage === 'undefined') return {};
    const raw = localStorage.getItem(DAILY_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch (_) { return {}; }
}

export function saveDailyCompletions(map) {
  try {
    if (typeof localStorage === 'undefined') return false;
    localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(map));
    return true;
  } catch (_) { return false; }
}

export function markDailyComplete(date, challengeId) {
  const map = loadDailyCompletions();
  const key = date.toISOString().slice(0, 10);
  map[key] = challengeId;
  saveDailyCompletions(map);
  return map;
}

export function isDailyComplete(date) {
  const map = loadDailyCompletions();
  const key = date.toISOString().slice(0, 10);
  return Boolean(map[key]);
}

/** Streak: how many consecutive days the player completed. */
export function dailyStreak() {
  const map = loadDailyCompletions();
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today.getTime() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    if (map[key]) streak++;
    else if (i > 0) break;
    else return 0;
  }
  return streak;
}
