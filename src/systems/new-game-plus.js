// systems/new-game-plus.js — New Game+ (NG+) mode: carry over
// items + levels, scale enemies harder, add new mechanics per tier.

/**
 * Difficulty tier per NG+ level.
 * Each tier: enemyHpMul, enemyDmgMul, xpMul, goldMul, dropChanceMul
 */
export const NG_TIERS = {
  0: { id: 0, name: 'Normal',     enemyHpMul: 1.0,  enemyDmgMul: 1.0,  xpMul: 1.0,  goldMul: 1.0,  dropChanceMul: 1.0 },
  1: { id: 1, name: 'NG+1',       enemyHpMul: 1.5,  enemyDmgMul: 1.3,  xpMul: 1.5,  goldMul: 1.3,  dropChanceMul: 1.2 },
  2: { id: 2, name: 'NG+2',       enemyHpMul: 2.0,  enemyDmgMul: 1.6,  xpMul: 2.0,  goldMul: 1.6,  dropChanceMul: 1.5 },
  3: { id: 3, name: 'NG+3',       enemyHpMul: 2.5,  enemyDmgMul: 2.0,  xpMul: 2.5,  goldMul: 2.0,  dropChanceMul: 1.8 },
  4: { id: 4, name: 'NG+4',       enemyHpMul: 3.0,  enemyDmgMul: 2.5,  xpMul: 3.0,  goldMul: 2.5,  dropChanceMul: 2.0 },
  5: { id: 5, name: 'NG+5 Hölle', enemyHpMul: 4.0,  enemyDmgMul: 3.0,  xpMul: 4.0,  goldMul: 3.0,  dropChanceMul: 2.5 },
};

export function getTier(level) {
  return NG_TIERS[Math.max(0, Math.min(5, level || 0))] || NG_TIERS[0];
}

/**
 * Items that can be carried over to NG+ (and the rest is reset).
 * - Equipment: yes (rarity up by 1)
 * - Inventory consumables: 50% kept
 * - Skills: yes (already unlocked)
 * - Quests: reset
 * - Bosses: reset (need to defeat again)
 */
export const CARRY_OVER = {
  equipment: true,
  skillTree: true,
  achievements: true,
  leaderboard: true,
  consumables: 0.5, // 50% kept
  gold: 0.3,        // 30% kept
};

/** Items that DO NOT carry over. */
export const RESETS = [
  'hp', 'mana', 'xp', 'level', 'crystals', 'questProgress',
  'bossDefeated', 'visitedZones', 'distanceTraveled',
];

/**
 * Apply NG+ to a state. Returns a NEW state (does not mutate).
 * @param {object} oldState — state from the previous run
 * @param {number} ngLevel — 1, 2, 3, 4, or 5
 * @returns {object} new state
 */
export function startNewGamePlus(oldState, ngLevel = 1) {
  const tier = getTier(ngLevel);
  const out = { ...oldState, ngLevel, ngPlus: true, ngTier: tier };
  // Reset progress fields
  for (const field of RESETS) {
    if (field === 'hp' || field === 'mana') out[field] = field === 'hp' ? 6 : 20;
    else if (field === 'level') out[field] = 1;
    else if (field === 'xp') out[field] = 0;
    else out[field] = 0;
  }
  // Carry over equipment, but boost rarity
  if (CARRY_OVER.equipment && oldState.equipment) {
    out.equipment = bumpRarities(oldState.equipment);
  }
  // Carry over skill tree
  if (CARRY_OVER.skillTree && oldState.skillTree) {
    out.skillTree = { ...oldState.skillTree };
  }
  // Carry over achievements
  if (CARRY_OVER.achievements && oldState.achievements) {
    out.achievements = { ...oldState.achievements };
  }
  // Partial carry
  if (oldState.inventory) {
    out.inventory = oldState.inventory.filter((_, i) => i < Math.floor(oldState.inventory.length * CARRY_OVER.consumables));
  }
  if (oldState.gold) {
    out.gold = Math.floor(oldState.gold * CARRY_OVER.gold);
  }
  // Reset quest log
  out.quests = {};
  // Reset bosses
  out.bossDefeated = [];
  return out;
}

const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
function bumpRarity(rarity) {
  const idx = RARITY_ORDER.indexOf(rarity);
  if (idx < 0 || idx >= RARITY_ORDER.length - 1) return rarity;
  return RARITY_ORDER[idx + 1];
}

function bumpRarities(equipment) {
  const out = {};
  for (const [slot, item] of Object.entries(equipment)) {
    if (!item) continue;
    out[slot] = { ...item, rarity: bumpRarity(item.rarity) };
  }
  return out;
}

/**
 * Calculate total NG+ level from completed runs.
 */
export function ngPlusLevel(state) {
  return Math.max(0, state.ngLevel || 0);
}

/**
 * Get a human-readable NG+ summary.
 */
export function ngPlusSummary(ngLevel) {
  const tier = getTier(ngLevel);
  return {
    name: tier.name,
    level: ngLevel,
    enemyHpMul: tier.enemyHpMul,
    enemyDmgMul: tier.enemyDmgMul,
    xpMul: tier.xpMul,
    goldMul: tier.goldMul,
    dropChanceMul: tier.dropChanceMul,
  };
}

/**
 * Decide whether a player has unlocked NG+. Requires having
 * defeated the architect at least once.
 */
export function isNGPlusUnlocked(state) {
  return Boolean(state.defeatedBoss?.includes('the_architect'));
}

/**
 * Max NG+ level (5 = hell). Player can keep replaying but
 * difficulty caps here.
 */
export const MAX_NG_PLUS = 5;
