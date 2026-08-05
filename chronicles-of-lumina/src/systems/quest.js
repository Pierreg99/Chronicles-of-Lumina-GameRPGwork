// systems/quest.js — quest definitions, tracking, completion.
// Each quest: id, name, type (main/side/daily), giver, zone,
// objectives [{ type, target, count }], rewards { xp, gold,
// items, skillPoints }, prereq (quest id), chain (next quest).

export const QUEST_TYPES = {
  MAIN:    { id: 'main',    name: 'Hauptquest' },
  SIDE:    { id: 'side',    name: 'Nebenquest' },
  DAILY:   { id: 'daily',   name: 'Tagesquest' },
  REPEAT:  { id: 'repeat',  name: 'Wiederholbar' },
  HIDDEN:  { id: 'hidden',  name: 'Verborgen' },
};

export const QUEST_STATUS = {
  AVAILABLE: 'available',
  ACTIVE:    'active',
  COMPLETED: 'completed',
  FAILED:    'failed',
};

const QUESTS = {
  // ── Main story (5) ──
  q_collect_crystals: {
    id: 'q_collect_crystals', name: 'Die 10 Kristalle', type: 'main',
    giver: 'elder_thaddeus', zone: 'verdant',
    desc: 'Sammle 10 Lichtkristalle aus den verschiedenen Regionen.',
    objectives: [{ type: 'collect', target: 'crystal', count: 10 }],
    rewards: { xp: 500, gold: 200, items: ['chest_rare'], skillPoints: 1 },
    chain: 'q_purify_shrine',
  },
  q_purify_shrine: {
    id: 'q_purify_shrine', name: 'Den Schrein reinigen', type: 'main',
    giver: 'elder_thaddeus', zone: 'verdant',
    desc: 'Bringe die Kristalle zum Schrein und führe das Ritual durch.',
    objectives: [{ type: 'interact', target: 'shrine', count: 1 }],
    rewards: { xp: 1000, gold: 500, items: ['sword_legendary'], skillPoints: 2 },
    prereq: 'q_collect_crystals',
    chain: 'q_defeat_architect',
  },
  q_defeat_architect: {
    id: 'q_defeat_architect', name: 'Der Architekt', type: 'main',
    giver: 'elder_thaddeus', zone: 'void',
    desc: 'Reise zum Leerenspalt und stelle dich dem Architekten.',
    objectives: [{ type: 'kill', target: 'the_architect', count: 1 }],
    rewards: { xp: 5000, gold: 2000, items: ['crown_legendary'], skillPoints: 5 },
    prereq: 'q_purify_shrine',
  },
  q_explore_biomes: {
    id: 'q_explore_biomes', name: 'Alle Biome', type: 'main',
    giver: 'sage_korin', zone: 'mire',
    desc: 'Besuche alle 10 Biome.',
    objectives: [{ type: 'visit', target: 'zone', count: 10 }],
    rewards: { xp: 1500, gold: 1000, items: ['boots_swift'], skillPoints: 3 },
  },
  q_slayer_king: {
    id: 'q_slayer_king', name: 'König der Kristalle', type: 'main',
    giver: 'trainer_lyric', zone: 'crystal',
    desc: 'Besiege den Kristallkönig in der Kristallhöhle.',
    objectives: [{ type: 'kill', target: 'crystal_king', count: 1 }],
    rewards: { xp: 2000, gold: 1000, items: ['staff_arcane'], skillPoints: 2 },
  },

  // ── Side quests (15) ──
  q_gather_herbs: {
    id: 'q_gather_herbs', name: 'Kräuter für Yarrow', type: 'side',
    giver: 'alchemist_yarrow', zone: 'verdant',
    desc: 'Sammle 15 Heilkräuter für Yarrow.',
    objectives: [{ type: 'collect', target: 'herb_heal', count: 15 }],
    rewards: { xp: 200, gold: 100, items: ['potion_hp_large', 'potion_hp_large', 'potion_hp_large'] },
  },
  q_iron_ore: {
    id: 'q_iron_ore', name: 'Erz für Iron', type: 'side',
    giver: 'blacksmith_iron', zone: 'verdant',
    desc: 'Bringe Iron 20 Eisenerz.',
    objectives: [{ type: 'collect', target: 'ore_iron', count: 20 }],
    rewards: { xp: 250, gold: 150, items: ['sword_steel'] },
  },
  q_sandstorm: {
    id: 'q_sandstorm', name: 'Sandsturm-Überlebende', type: 'side',
    giver: 'merchant_owl', zone: 'dunes',
    desc: 'Besiege 25 Sandwürmer.',
    objectives: [{ type: 'kill', target: 'sandworm', count: 25 }],
    rewards: { xp: 300, gold: 200, items: ['amulet_dune'] },
  },
  q_frost_lord: {
    id: 'q_frost_lord', name: 'Frostfürst', type: 'side',
    giver: 'trainer_ash', zone: 'peaks',
    desc: 'Besiege den Frostfürst in den Sturmgipfeln.',
    objectives: [{ type: 'kill', target: 'frost_lord', count: 1 }],
    rewards: { xp: 800, gold: 400, items: ['armor_frost'] },
  },
  q_miremother: {
    id: 'q_miremother', name: 'Mutter des Sumpfes', type: 'side',
    giver: 'sage_korin', zone: 'mire',
    desc: 'Besiege die Sumpfmutter.',
    objectives: [{ type: 'kill', target: 'mire_mother', count: 1 }],
    rewards: { xp: 600, gold: 300, items: ['ring_swamp'] },
  },
  q_ember_heart: {
    id: 'q_ember_heart', name: 'Glutherz', type: 'side',
    giver: 'trainer_ash', zone: 'ember',
    desc: 'Besiege Lavagolem und bringe sein Herz.',
    objectives: [{ type: 'collect', target: 'heart_lava', count: 1 }],
    rewards: { xp: 700, gold: 350, items: ['armor_ember'] },
  },
  q_sky_temple: {
    id: 'q_sky_temple', name: 'Himmelstempel', type: 'side',
    giver: 'trainer_lyric', zone: 'sky',
    desc: 'Besteige den Himmelstempel und besiege den Tempelwächter.',
    objectives: [{ type: 'kill', target: 'temple_guardian', count: 1 }],
    rewards: { xp: 1000, gold: 500, items: ['staff_sky'] },
  },
  q_kraken: {
    id: 'q_kraken', name: 'Kraken-Lord', type: 'side',
    giver: 'merchant_owl', zone: 'reef',
    desc: 'Besiege den Kraken-Lord im Gezeitenriff.',
    objectives: [{ type: 'kill', target: 'kraken_lord', count: 1 }],
    rewards: { xp: 900, gold: 450, items: ['trident_coral'] },
  },
  q_shadow_self: {
    id: 'q_shadow_self', name: 'Mein Schatten', type: 'side',
    giver: 'trainer_shadow', zone: 'haunted',
    desc: 'Stelle dich deinem Schatten-Selbst in den Geisterruinen.',
    objectives: [{ type: 'kill', target: 'shadow_self', count: 1 }],
    rewards: { xp: 1200, gold: 600, items: ['cloak_shadow'] },
  },
  q_void_treant: {
    id: 'q_void_treant', name: 'Leerentreant', type: 'side',
    giver: 'sage_korin', zone: 'void',
    desc: 'Besiege den Leerentreant.',
    objectives: [{ type: 'kill', target: 'void_treant', count: 1 }],
    rewards: { xp: 1500, gold: 800, items: ['staff_void'] },
  },
  q_traveler: {
    id: 'q_traveler', name: 'Reisender', type: 'side',
    giver: 'guard_kael', zone: 'verdant',
    desc: 'Reise 5000 Einheiten.',
    objectives: [{ type: 'travel', target: 'any', count: 5000 }],
    rewards: { xp: 400, gold: 200, items: ['boots_swift'] },
  },
  q_slayer_apprentice: {
    id: 'q_slayer_apprentice', name: 'Schleimer-Lehrling', type: 'side',
    giver: 'guard_kael', zone: 'verdant',
    desc: 'Besiege 25 Gegner.',
    objectives: [{ type: 'kill', target: 'any', count: 25 }],
    rewards: { xp: 150, gold: 75, items: ['potion_hp_small', 'potion_hp_small', 'potion_hp_small'] },
  },
  q_slayer_master: {
    id: 'q_slayer_master', name: 'Meister-Schleimer', type: 'side',
    giver: 'guard_kael', zone: 'verdant',
    desc: 'Besiege 100 Gegner.',
    objectives: [{ type: 'kill', target: 'any', count: 100 }],
    rewards: { xp: 800, gold: 400, items: ['sword_steel', 'armor_steel'] },
  },
  q_alchemist_apprentice: {
    id: 'q_alchemist_apprentice', name: 'Alchemie-Lehrling', type: 'side',
    giver: 'alchemist_yarrow', zone: 'verdant',
    desc: 'Braue 10 Tränke.',
    objectives: [{ type: 'craft', target: 'potion', count: 10 }],
    rewards: { xp: 300, gold: 150, items: ['potion_hp_large'] },
  },
  q_craft_master: {
    id: 'q_craft_master', name: 'Handwerks-Meister', type: 'side',
    giver: 'blacksmith_iron', zone: 'verdant',
    desc: 'Stelle 50 Items her.',
    objectives: [{ type: 'craft', target: 'any', count: 50 }],
    rewards: { xp: 1000, gold: 500, items: ['hammer_master'] },
  },

  // ── Daily quests (3) ──
  q_daily_kill: {
    id: 'q_daily_kill', name: 'Tagesjagd', type: 'daily',
    giver: 'guard_kael', zone: 'verdant',
    desc: 'Besiege 30 Gegner (jeden Tag neu).',
    objectives: [{ type: 'kill', target: 'any', count: 30 }],
    rewards: { xp: 200, gold: 100, items: ['potion_hp_small'] },
  },
  q_daily_gather: {
    id: 'q_daily_gather', name: 'Tagesernte', type: 'daily',
    giver: 'alchemist_yarrow', zone: 'verdant',
    desc: 'Sammle 20 Materialien (jeden Tag neu).',
    objectives: [{ type: 'collect', target: 'any', count: 20 }],
    rewards: { xp: 200, gold: 100, items: ['potion_mana_small'] },
  },
  q_daily_explore: {
    id: 'q_daily_explore', name: 'Tageserkundung', type: 'daily',
    giver: 'merchant_owl', zone: 'dunes',
    desc: 'Besuche 3 verschiedene Biome (jeden Tag neu).',
    objectives: [{ type: 'visit', target: 'zone', count: 3 }],
    rewards: { xp: 200, gold: 100, items: ['scroll_teleport'] },
  },

  // ── Hidden quests (2) ──
  q_spirit_redemption: {
    id: 'q_spirit_redemption', name: 'Erlösung', type: 'hidden',
    giver: 'spirit_ancient', zone: 'haunted',
    desc: 'Befreie den Uralten Geist.',
    objectives: [{ type: 'kill', target: 'shadow_lord', count: 1 }],
    rewards: { xp: 1500, gold: 1000, items: ['crown_ancient'], skillPoints: 3 },
  },
  q_keeper_secret: {
    id: 'q_keeper_secret', name: 'Hüter-Geheimnis', type: 'hidden',
    giver: 'elder_thaddeus', zone: 'verdant',
    desc: 'Finde alle 10 Geheimnisse und kehre zu Thaddeus zurück.',
    objectives: [{ type: 'discover', target: 'secret', count: 10 }],
    rewards: { xp: 2000, gold: 1500, items: ['chest_legendary'], skillPoints: 5 },
  },
};

export function getQuest(id) { return QUESTS[id] || null; }
export function listQuests() { return Object.values(QUESTS); }
export function listQuestsByType(typeId) {
  return Object.values(QUESTS).filter((q) => q.type === typeId);
}
export function listQuestsByGiver(npcId) {
  return Object.values(QUESTS).filter((q) => q.giver === npcId);
}
export function totalQuests() { return Object.keys(QUESTS).length; }

/**
 * Get all available quests for an NPC. A quest is available if
 * it's not yet active, not completed, and its prereq (if any) is
 * completed.
 */
export function getAvailableQuests(npcId, state) {
  const all = listQuestsByGiver(npcId);
  return all.filter((q) => {
    const s = state.quests?.[q.id];
    if (s && s.status === 'completed') return false;
    if (s && s.status === 'active') return false;
    if (q.prereq && state.quests?.[q.prereq]?.status !== 'completed') return false;
    return true;
  });
}

/**
 * Check a quest's objectives against state. Returns { progress,
 * done } where progress is 0..1.
 */
export function questProgress(quest, state) {
  if (!quest.objectives || !quest.objectives.length) return { progress: 0, done: false };
  let total = 0, max = 0;
  for (const obj of quest.objectives) {
    max += obj.count;
    const have = getObjectiveCount(obj, state);
    total += Math.min(obj.count, have);
  }
  return { progress: max > 0 ? total / max : 0, done: total >= max };
}

function getObjectiveCount(obj, state) {
  if (obj.type === 'collect') return state.inventory?.filter((id) => id === obj.target).length || 0;
  if (obj.type === 'kill') return state.killsByType?.[obj.target] || 0;
  if (obj.type === 'craft') return state.craftedByType?.[obj.target] || 0;
  if (obj.type === 'visit') return state.visitedZones?.size || 0;
  if (obj.type === 'travel') return state.distanceTraveled || 0;
  if (obj.type === 'interact') return state.interactedWith?.filter((t) => t === obj.target).length || 0;
  if (obj.type === 'discover') return state._discoveredSecrets?.size || 0;
  return 0;
}

/**
 * Complete a quest. Apply rewards to state.
 */
export function completeQuest(questId, state) {
  const quest = QUESTS[questId];
  if (!quest) return false;
  state.quests = state.quests || {};
  state.quests[questId] = { status: 'completed' };
  if (quest.rewards) {
    if (quest.rewards.xp) state.xp = (state.xp || 0) + quest.rewards.xp;
    if (quest.rewards.gold) state.gold = (state.gold || 0) + quest.rewards.gold;
    if (quest.rewards.skillPoints) state.skillPoints = (state.skillPoints || 0) + quest.rewards.skillPoints;
    if (quest.rewards.items) {
      state.inventory = state.inventory || [];
      for (const item of quest.rewards.items) state.inventory.push(item);
    }
  }
  // Unlock chain
  if (quest.chain) {
    state.quests[quest.chain] = state.quests[quest.chain] || { status: 'available' };
  }
  return true;
}

/**
 * Start a quest (mark as active).
 */
export function startQuest(questId, state) {
  const quest = QUESTS[questId];
  if (!quest) return false;
  state.quests = state.quests || {};
  if (state.quests[questId]?.status === 'completed') return false;
  state.quests[questId] = { status: 'active' };
  return true;
}

/**
 * Count completed quests.
 */
export function countCompleted(state) {
  if (!state.quests) return 0;
  return Object.values(state.quests).filter((q) => q.status === 'completed').length;
}
