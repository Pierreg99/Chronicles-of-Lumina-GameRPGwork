// systems/achievement.js — achievement registry + unlock tracking +
// progress. 50+ achievements across 5 categories: combat,
// exploration, crafting, social, secret. Each has an id, name,
// description, category, icon, and a `check` predicate that takes
// game state and returns true when unlocked.

export const ACHIEVEMENT_CATEGORIES = Object.freeze({
  COMBAT:      { id: 'combat',      name: 'Kampf',      icon: 'sword' },
  EXPLORATION: { id: 'exploration', name: 'Erkundung',  icon: 'target' },
  CRAFTING:    { id: 'crafting',    name: 'Handwerk',   icon: 'crystal' },
  PROGRESSION: { id: 'progression', name: 'Fortschritt', icon: 'sparkle' },
  SECRET:      { id: 'secret',      name: 'Geheim',     icon: 'book' },
});

/**
 * Achievement registry. Each entry: { id, name, desc, category,
 * icon, condition(state) -> boolean }.
 */
const ACHIEVEMENTS = {
  // ── Combat (15) ──
  ach_first_blood:    { id: 'ach_first_blood',    name: 'Erstes Blut',        desc: 'Besiege deinen ersten Gegner.',                 category: 'combat', condition: (s) => (s.kills || 0) >= 1 },
  ach_slayer_10:      { id: 'ach_slayer_10',      name: 'Schleimer-Töter',   desc: 'Besiege 10 Gegner.',                           category: 'combat', condition: (s) => (s.kills || 0) >= 10 },
  ach_slayer_50:      { id: 'ach_slayer_50',      name: 'Hordenjäger',       desc: 'Besiege 50 Gegner.',                           category: 'combat', condition: (s) => (s.kills || 0) >= 50 },
  ach_slayer_100:     { id: 'ach_slayer_100',     name: 'Schlächter',        desc: 'Besiege 100 Gegner.',                          category: 'combat', condition: (s) => (s.kills || 0) >= 100 },
  ach_combo_5:        { id: 'ach_combo_5',        name: 'Kombo',             desc: 'Erreiche eine 5er-Kombo.',                    category: 'combat', condition: (s) => (s.maxCombo || 0) >= 5 },
  ach_combo_10:       { id: 'ach_combo_10',       name: 'Meister-Kombo',     desc: 'Erreiche eine 10er-Kombo.',                   category: 'combat', condition: (s) => (s.maxCombo || 0) >= 10 },
  ach_boss_first:     { id: 'ach_boss_first',     name: 'Boss-Bezwinger',    desc: 'Besiege deinen ersten Boss.',                  category: 'combat', condition: (s) => s.bossDefeated },
  ach_boss_void:      { id: 'ach_boss_void',      name: 'Architekt-Sieger',  desc: 'Besiege den Architekten.',                    category: 'combat', condition: (s) => s.defeatedBoss && s.defeatedBoss.includes('the_architect') },
  ach_no_damage_boss: { id: 'ach_no_damage_boss', name: 'Unverwundbar',      desc: 'Besiege einen Boss ohne Schaden zu nehmen.',   category: 'combat', condition: (s) => s.noDamageBossDefeated },
  ach_parry_5:        { id: 'ach_parry_5',        name: 'Parieren',          desc: 'Pariere 5 Angriffe.',                         category: 'combat', condition: (s) => (s.parries || 0) >= 5 },
  ach_critical_10:    { id: 'ach_critical_10',    name: 'Kritisch',          desc: 'Verursache 10 kritische Treffer.',            category: 'combat', condition: (s) => (s.criticals || 0) >= 10 },
  ach_no_death:       { id: 'ach_no_death',       name: 'Unsterblich',       desc: 'Beende das Spiel ohne zu sterben.',            category: 'combat', condition: (s) => s.completedWithoutDeath },
  ach_glass_cannon:   { id: 'ach_glass_cannon',   name: 'Glaskanone',        desc: 'Beende das Spiel mit max 1 HP.',               category: 'combat', condition: (s) => s.completedAt1HP },
  ach_low_hp_win:     { id: 'ach_low_hp_win',     name: 'Aus der Asche',     desc: 'Gewinne einen Kampf mit <10% HP.',             category: 'combat', condition: (s) => s.wonFromLowHP },
  ach_flawless:       { id: 'ach_flawless',       name: 'Makellos',          desc: 'Beende einen Boss ohne getroffen zu werden.', category: 'combat', condition: (s) => s.flawlessBoss },

  // ── Exploration (15) ──
  ach_first_zone:     { id: 'ach_first_zone',     name: 'Entdecker',         desc: 'Besuche dein erstes Biom.',                    category: 'exploration', condition: (s) => (s.visitedZones?.size || 0) >= 1 },
  ach_all_zones:      { id: 'ach_all_zones',      name: 'Weltenbummler',     desc: 'Besuche alle 10 Biome.',                       category: 'exploration', condition: (s) => (s.visitedZones?.size || 0) >= 10 },
  ach_5_secrets:       { id: 'ach_5_secrets',       name: 'Geheimniskrämer',   desc: 'Finde 5 versteckte Bereiche.',                 category: 'exploration', condition: (s) => (s._discoveredSecrets?.size || 0) >= 5 },
  ach_all_secrets:    { id: 'ach_all_secrets',    name: 'Alle Geheimnisse',  desc: 'Finde alle 10 versteckten Bereiche.',         category: 'exploration', condition: (s) => (s._discoveredSecrets?.size || 0) >= 10 },
  ach_dungeon_first:  { id: 'ach_dungeon_first',  name: 'Höhlenforscher',    desc: 'Betrete deinen ersten Dungeon.',               category: 'exploration', condition: (s) => (s.dungeonsEntered || 0) >= 1 },
  ach_dungeon_10:     { id: 'ach_dungeon_10',     name: 'Katakomben-Experte',desc: 'Betrete 10 Dungeons.',                         category: 'exploration', condition: (s) => (s.dungeonsEntered || 0) >= 10 },
  ach_collect_all:    { id: 'ach_collect_all',    name: 'Sammler',           desc: 'Sammle alle Kristalle in einem Run.',         category: 'exploration', condition: (s) => (s.crystals || 0) >= 10 },
  ach_all_bosses:     { id: 'ach_all_bosses',     name: 'Boss-Spezialist',   desc: 'Besiege alle Bossgegner.',                     category: 'exploration', condition: (s) => s.allBossesDefeated },
  ach_travel_1k:      { id: 'ach_travel_1k',      name: 'Wanderer',          desc: 'Laufe 1000 Einheiten.',                       category: 'exploration', condition: (s) => (s.distanceTraveled || 0) >= 1000 },
  ach_travel_10k:     { id: 'ach_travel_10k',     name: 'Marathonläufer',    desc: 'Laufe 10.000 Einheiten.',                     category: 'exploration', condition: (s) => (s.distanceTraveled || 0) >= 10000 },
  ach_travel_100k:    { id: 'ach_travel_100k',    name: 'Globetrotter',      desc: 'Laufe 100.000 Einheiten.',                    category: 'exploration', condition: (s) => (s.distanceTraveled || 0) >= 100000 },
  ach_map_share:      { id: 'ach_map_share',      name: 'Kartograph',        desc: 'Teile eine Karte per URL.',                   category: 'exploration', condition: (s) => s.sharedMap },
  ach_seed_100:       { id: 'ach_seed_100',       name: 'Sammler der Seeds', desc: 'Spiele 100 verschiedene Seeds.',              category: 'exploration', condition: (s) => (s.seedsPlayed || 0) >= 100 },
  ach_void_visit:     { id: 'ach_void_visit',     name: 'Am Rande des Nichts', desc: 'Betrete den Leerenspalt.',                  category: 'exploration', condition: (s) => s.visitedZones && s.visitedZones.has('void') },
  ach_sky_visit:      { id: 'ach_sky_visit',      name: 'Höhenflieger',      desc: 'Betrete den Himmeltempel.',                   category: 'exploration', condition: (s) => s.visitedZones && s.visitedZones.has('sky') },

  // ── Crafting (10) ──
  ach_first_craft:    { id: 'ach_first_craft',    name: 'Handwerker',        desc: 'Stelle dein erstes Item her.',                 category: 'crafting', condition: (s) => (s.itemsCrafted || 0) >= 1 },
  ach_craft_10:       { id: 'ach_craft_10',       name: 'Meisterhandwerker', desc: 'Stelle 10 Items her.',                        category: 'crafting', condition: (s) => (s.itemsCrafted || 0) >= 10 },
  ach_craft_50:       { id: 'ach_craft_50',       name: 'Industriemeister',  desc: 'Stelle 50 Items her.',                        category: 'crafting', condition: (s) => (s.itemsCrafted || 0) >= 50 },
  ach_legendary_craft:{ id: 'ach_legendary_craft',name: 'Legendär',          desc: 'Stelle ein legendäres Item her.',             category: 'crafting', condition: (s) => s.craftedLegendary },
  ach_full_set:       { id: 'ach_full_set',       name: 'Volle Rüstung',     desc: 'Trage ein komplettes Rüstungsset.',          category: 'crafting', condition: (s) => s.fullSetEquipped },
  ach_recipe_all:     { id: 'ach_recipe_all',     name: 'Rezeptbuch',        desc: 'Lerne alle 30 Rezepte.',                       category: 'crafting', condition: (s) => (s.recipesLearned || 0) >= 30 },
  ach_potion_25:      { id: 'ach_potion_25',      name: 'Alchemist',         desc: 'Braue 25 Tränke.',                            category: 'crafting', condition: (s) => (s.potionsBrewed || 0) >= 25 },
  ach_enchant_5:      { id: 'ach_enchant_5',      name: 'Verzauberer',       desc: 'Verzaubere 5 Items.',                         category: 'crafting', condition: (s) => (s.itemsEnchanted || 0) >= 5 },
  ach_gather_100:     { id: 'ach_gather_100',     name: 'Sammler der Rohstoffe', desc: 'Sammle 100 Materialien.',                 category: 'crafting', condition: (s) => (s.materialsGathered || 0) >= 100 },
  ach_legendary_gear: { id: 'ach_legendary_gear', name: 'Legendäre Ausrüstung', desc: 'Trage 3 legendäre Items gleichzeitig.',   category: 'crafting', condition: (s) => (s.legendaryEquipped || 0) >= 3 },

  // ── Progression (10) ──
  ach_level_5:        { id: 'ach_level_5',        name: 'Anfänger',          desc: 'Erreiche Level 5.',                            category: 'progression', condition: (s) => (s.level || 0) >= 5 },
  ach_level_10:       { id: 'ach_level_10',       name: 'Veteran',           desc: 'Erreiche Level 10.',                           category: 'progression', condition: (s) => (s.level || 0) >= 10 },
  ach_level_25:       { id: 'ach_level_25',       name: 'Held',              desc: 'Erreiche Level 25.',                           category: 'progression', condition: (s) => (s.level || 0) >= 25 },
  ach_skill_5:        { id: 'ach_skill_5',        name: 'Lehrling',          desc: 'Lerne 5 Skills.',                             category: 'progression', condition: (s) => (s.skillsLearned || 0) >= 5 },
  ach_skill_15:       { id: 'ach_skill_15',       name: 'Meister',           desc: 'Lerne 15 Skills.',                            category: 'progression', condition: (s) => (s.skillsLearned || 0) >= 15 },
  ach_skill_capstone: { id: 'ach_skill_capstone', name: 'Capstone',          desc: 'Erreiche einen Capstone-Knoten.',             category: 'progression', condition: (s) => s.skillCapstoneReached },
  ach_dual_class:     { id: 'ach_dual_class',     name: 'Multi-Klasse',      desc: 'Beleg Skills in 2 Klassen.',                  category: 'progression', condition: (s) => s.dualClass },
  ach_triple_class:   { id: 'ach_triple_class',   name: 'Universalgelehrter',desc: 'Beleg Skills in allen 3 Klassen.',            category: 'progression', condition: (s) => s.tripleClass },
  ach_full_mana:      { id: 'ach_full_mana',      name: 'Mana-Wandler',      desc: 'Erreiche 100 Max Mana.',                      category: 'progression', condition: (s) => (s.maxMana || 0) >= 100 },
  ach_speedrun:       { id: 'ach_speedrun',       name: 'Speedrunner',       desc: 'Beende das Spiel in unter 10 Minuten.',       category: 'progression', condition: (s) => s.speedrunUnder10Min },

  // ── Secret (5) ──
  ach_secret_first:   { id: 'ach_secret_first',   name: 'Neugierig',         desc: 'Entdecke dein erstes Geheimnis.',              category: 'secret', condition: (s) => (s._discoveredSecrets?.size || 0) >= 1 },
  ach_secret_ancient: { id: 'ach_secret_ancient', name: 'Archäologe',        desc: 'Besiege den Uralten Baumgeist.',              category: 'secret', condition: (s) => s.defeatedBoss && s.defeatedBoss.includes('ancient_treant') },
  ach_secret_shadow:  { id: 'ach_secret_shadow',  name: 'Schatten-Jäger',    desc: 'Besiege dein Schatten-Selbst.',                category: 'secret', condition: (s) => s.defeatedBoss && s.defeatedBoss.includes('shadow_self') },
  ach_secret_architect:{ id: 'ach_secret_architect', name: 'Architekt-Bezwinger', desc: 'Besiege den Architekten im Leerenspalt.', category: 'secret', condition: (s) => s.defeatedBoss && s.defeatedBoss.includes('the_architect') },
  ach_easter_egg:     { id: 'ach_easter_egg',     name: 'Easter Egg',        desc: 'Du hast das Easter Egg gefunden!',            category: 'secret', condition: (s) => s.foundEasterEgg },
};

export function getAchievement(id) { return ACHIEVEMENTS[id] || null; }
export function listAchievements() { return Object.values(ACHIEVEMENTS); }
export function listAchievementsByCategory(catId) {
  return Object.values(ACHIEVEMENTS).filter((a) => a.category === catId);
}
export function totalAchievements() { return Object.keys(ACHIEVEMENTS).length; }

/**
 * Check all achievements against current state. Returns array of
 * newly-unlocked achievement ids.
 * @param {object} state
 * @param {Set<string>} alreadyUnlocked
 * @returns {string[]} newly-unlocked ids
 */
export function checkAchievements(state, alreadyUnlocked) {
  const newly = [];
  for (const ach of Object.values(ACHIEVEMENTS)) {
    if (alreadyUnlocked.has(ach.id)) continue;
    try {
      if (ach.condition(state)) newly.push(ach.id);
    } catch (_) { /* ignore predicate errors */ }
  }
  return newly;
}

/**
 * Compute the % progress for a numeric achievement.
 * @param {object} ach
 * @param {object} state
 * @returns {number} 0..1
 */
export function achievementProgress(ach, state) {
  // Specific overrides for nicer display
  const PROGRESS_HINTS = {
    ach_slayer_10:      (s) => Math.min(1, (s.kills || 0) / 10),
    ach_slayer_50:      (s) => Math.min(1, (s.kills || 0) / 50),
    ach_slayer_100:     (s) => Math.min(1, (s.kills || 0) / 100),
    ach_craft_10:       (s) => Math.min(1, (s.itemsCrafted || 0) / 10),
    ach_craft_50:       (s) => Math.min(1, (s.itemsCrafted || 0) / 50),
    ach_level_5:        (s) => Math.min(1, (s.level || 0) / 5),
    ach_level_10:       (s) => Math.min(1, (s.level || 0) / 10),
    ach_level_25:       (s) => Math.min(1, (s.level || 0) / 25),
    ach_all_zones:      (s) => Math.min(1, (s.visitedZones?.size || 0) / 10),
    ach_all_secrets:    (s) => Math.min(1, (s._discoveredSecrets?.size || 0) / 10),
    ach_recipe_all:     (s) => Math.min(1, (s.recipesLearned || 0) / 30),
  };
  const fn = PROGRESS_HINTS[ach.id];
  if (fn) return fn(state);
  // Default: 0 or 1 (binary)
  try {
    return ach.condition(state) ? 1 : 0;
  } catch (_) { return 0; }
}
