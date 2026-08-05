// systems/equipment.js — equipment slots + stat system + item registry.
//
// Six armor slots, four weapon types, five rarity tiers. Items are
// plain data (no class needed) with stat rolls computed at drop
// time. Stats are pure functions so the same item id always gives
// the same baseline + range.

/** Six armor slots + 4 weapon types. */
export const EQUIPMENT_SLOTS = Object.freeze({
  HELM:    'helm',
  CHEST:   'chest',
  LEGS:    'legs',
  BOOTS:   'boots',
  GLOVES:  'gloves',
  RING:    'ring',
  WEAPON:  'weapon',  // separate from armor, but stored the same way
});

/** Five rarity tiers, ordered from common to legendary. */
export const RARITY = Object.freeze({
  COMMON:    { id: 'common',    name: 'Gewöhnlich',   color: '#9CA3AF', statMul: 1.0 },
  UNCOMMON:  { id: 'uncommon',  name: 'Ungewöhnlich', color: '#34D399', statMul: 1.2 },
  RARE:      { id: 'rare',      name: 'Selten',       color: '#60A5FA', statMul: 1.5 },
  EPIC:      { id: 'epic',      name: 'Episch',       color: '#A78BFA', statMul: 1.8 },
  LEGENDARY: { id: 'legendary', name: 'Legendär',     color: '#F59E0B', statMul: 2.2 },
});

/** Stats that can be on any item. */
export const STATS = Object.freeze({
  STR: 'str',   // physical damage
  DEX: 'dex',   // attack speed, crit chance
  INT: 'int',   // magic damage, mana pool
  VIT: 'vit',   // max HP
  WIS: 'wis',   // mana regen
});

export const STAT_LABELS = {
  str: 'Stärke',
  dex: 'Geschick',
  int: 'Intellekt',
  vit: 'Vitalität',
  wis: 'Weisheit',
};

/** Item template registry. Each entry is a baseline + slot + tier. */
const ITEM_TEMPLATES = {
  // ── Weapons ──
  sword_iron:    { id: 'sword_iron',    name: 'Eisernes Schwert',  slot: 'weapon', tier: 'common',    base: { str: 3 },         min: { str: 2 }, max: { str: 5 } },
  sword_steel:   { id: 'sword_steel',   name: 'Stahlschwert',      slot: 'weapon', tier: 'uncommon',  base: { str: 5 },         min: { str: 4 }, max: { str: 8 } },
  sword_mithril: { id: 'sword_mithril', name: 'Mithril-Klinge',    slot: 'weapon', tier: 'rare',      base: { str: 9, dex: 1 },  min: { str: 7, dex: 1 }, max: { str: 12, dex: 3 } },
  sword_void:    { id: 'sword_void',    name: 'Leerenspalter',     slot: 'weapon', tier: 'legendary', base: { str: 18, dex: 3, int: 2 }, min: { str: 14, dex: 2, int: 1 }, max: { str: 24, dex: 5, int: 4 } },
  axe_iron:      { id: 'axe_iron',      name: 'Holzfälleraxt',     slot: 'weapon', tier: 'common',    base: { str: 4, dex: -1 }, min: { str: 3, dex: -1 }, max: { str: 6, dex: 0 } },
  axe_steel:     { id: 'axe_steel',     name: 'Streitaxt',         slot: 'weapon', tier: 'uncommon',  base: { str: 7, dex: -1 }, min: { str: 5, dex: -1 }, max: { str: 10, dex: 0 } },
  staff_apprentice: { id: 'staff_apprentice', name: 'Lehrlingsstab', slot: 'weapon', tier: 'common',    base: { int: 4 },         min: { int: 3 }, max: { int: 6 } },
  staff_arcane:  { id: 'staff_arcane',  name: 'Arkaner Stab',      slot: 'weapon', tier: 'rare',      base: { int: 10, wis: 2 }, min: { int: 7, wis: 1 }, max: { int: 14, wis: 4 } },
  bow_hunters:   { id: 'bow_hunters',   name: 'Jägerbogen',        slot: 'weapon', tier: 'common',    base: { dex: 3 },         min: { dex: 2 }, max: { dex: 5 } },
  bow_composite: { id: 'bow_composite', name: 'Kompositbogen',      slot: 'weapon', tier: 'uncommon',  base: { dex: 6, str: 1 },  min: { dex: 4, str: 0 }, max: { dex: 9, str: 2 } },

  // ── Helmets ──
  helm_leather:  { id: 'helm_leather',  name: 'Lederkappe',        slot: 'helm',   tier: 'common',    base: { vit: 2 },         min: { vit: 1 }, max: { vit: 3 } },
  helm_iron:     { id: 'helm_iron',     name: 'Eiserner Helm',     slot: 'helm',   tier: 'uncommon',  base: { vit: 5, str: 1 },  min: { vit: 3, str: 0 }, max: { vit: 7, str: 2 } },
  helm_mage:     { id: 'helm_mage',     name: 'Magier-Hut',         slot: 'helm',   tier: 'rare',      base: { int: 5, wis: 2 },  min: { int: 3, wis: 1 }, max: { int: 8, wis: 4 } },

  // ── Chests ──
  chest_leather: { id: 'chest_leather', name: 'Lederrüstung',      slot: 'chest',  tier: 'common',    base: { vit: 4 },         min: { vit: 2 }, max: { vit: 6 } },
  chest_chain:   { id: 'chest_chain',   name: 'Kettenhemd',        slot: 'chest',  tier: 'uncommon',  base: { vit: 8, str: 1 },  min: { vit: 6, str: 0 }, max: { vit: 11, str: 2 } },
  chest_plate:   { id: 'chest_plate',   name: 'Plattenrüstung',     slot: 'chest',  tier: 'rare',      base: { vit: 14, str: 2 }, min: { vit: 11, str: 1 }, max: { vit: 18, str: 4 } },
  chest_robe:    { id: 'chest_robe',    name: 'Magier-Robe',        slot: 'chest',  tier: 'rare',      base: { int: 8, vit: 4 },  min: { int: 6, vit: 2 }, max: { int: 12, vit: 6 } },

  // ── Legs ──
  legs_cloth:    { id: 'legs_cloth',    name: 'Stoffhose',         slot: 'legs',   tier: 'common',    base: { vit: 2 },         min: { vit: 1 }, max: { vit: 3 } },
  legs_leather:  { id: 'legs_leather',  name: 'Lederhose',         slot: 'legs',   tier: 'common',    base: { vit: 4, dex: 1 },  min: { vit: 2, dex: 0 }, max: { vit: 6, dex: 2 } },
  legs_plate:    { id: 'legs_plate',    name: 'Plattenhose',       slot: 'legs',   tier: 'uncommon',  base: { vit: 8, str: 1 },  min: { vit: 6, str: 0 }, max: { vit: 11, str: 2 } },

  // ── Boots ──
  boots_leather: { id: 'boots_leather', name: 'Lederstiefel',      slot: 'boots',  tier: 'common',    base: { dex: 1, vit: 1 }, min: { dex: 0, vit: 0 }, max: { dex: 2, vit: 2 } },
  boots_swift:   { id: 'boots_swift',   name: 'Schnelle Stiefel',  slot: 'boots',  tier: 'uncommon',  base: { dex: 3 },         min: { dex: 2 }, max: { dex: 5 } },
  boots_war:     { id: 'boots_war',     name: 'Kriegsstiefel',     slot: 'boots',  tier: 'rare',      base: { vit: 4, str: 1 },  min: { vit: 2, str: 0 }, max: { vit: 6, str: 2 } },

  // ── Gloves ──
  gloves_cloth:  { id: 'gloves_cloth',  name: 'Stoffhandschuhe',   slot: 'gloves', tier: 'common',    base: { dex: 1 },         min: { dex: 0 }, max: { dex: 2 } },
  gloves_leather:{ id: 'gloves_leather',name: 'Lederhandschuhe',   slot: 'gloves', tier: 'common',    base: { dex: 2, str: 1 },  min: { dex: 1, str: 0 }, max: { dex: 3, str: 2 } },
  gloves_gauntlet:{ id: 'gloves_gauntlet', name: 'Panzerhandschuhe',slot: 'gloves', tier: 'uncommon',  base: { str: 3, vit: 1 },  min: { str: 2, vit: 0 }, max: { str: 5, vit: 2 } },

  // ── Rings ──
  ring_iron:     { id: 'ring_iron',     name: 'Eiserner Ring',     slot: 'ring',   tier: 'common',    base: { str: 1 },         min: { str: 0 }, max: { str: 2 } },
  ring_silver:   { id: 'ring_silver',   name: 'Silberring',        slot: 'ring',   tier: 'uncommon',  base: { int: 2, wis: 1 },  min: { int: 1, wis: 0 }, max: { int: 4, wis: 2 } },
  ring_ruby:     { id: 'ring_ruby',     name: 'Rubinring',         slot: 'ring',   tier: 'rare',      base: { str: 3, int: 2 },  min: { str: 2, int: 1 }, max: { str: 5, int: 4 } },
  ring_void:     { id: 'ring_void',     name: 'Leerensiegel',      slot: 'ring',   tier: 'legendary', base: { str: 4, dex: 3, int: 4, vit: 4, wis: 4 }, min: { str: 3, dex: 2, int: 3, vit: 3, wis: 3 }, max: { str: 6, dex: 5, int: 6, vit: 6, wis: 6 } },
};

export function getItemTemplate(id) {
  return ITEM_TEMPLATES[id] || null;
}

export function listItemTemplates() {
  return Object.values(ITEM_TEMPLATES);
}

export function listTemplatesBySlot(slot) {
  return Object.values(ITEM_TEMPLATES).filter((t) => t.slot === slot);
}

/**
 * Roll a specific item instance. The instance carries the final stat
 * values, determined by `rng()` between min and max. Falls back to a
 * Math.random if rng is not provided.
 * @param {string} templateId
 * @param {function} [rng] — returns 0..1
 * @returns {object|null} item instance
 */
export function rollItem(templateId, rng = Math.random) {
  const tmpl = ITEM_TEMPLATES[templateId];
  if (!tmpl) return null;
  const stats = { ...tmpl.base };
  for (const stat of Object.keys(stats)) {
    const lo = (tmpl.min && tmpl.min[stat] != null) ? tmpl.min[stat] : stats[stat];
    const hi = (tmpl.max && tmpl.max[stat] != null) ? tmpl.max[stat] : stats[stat];
    if (lo === hi) continue;
    stats[stat] = lo + Math.floor(rng() * (hi - lo + 1));
  }
  return {
    uid: `item_${Date.now()}_${Math.floor(rng() * 1e6)}`,
    templateId,
    slot: tmpl.slot,
    tier: tmpl.tier,
    name: tmpl.name,
    stats,
  };
}

/**
 * Compute the total bonus to a stat from a set of equipped items.
 * @param {object[]} equipped — array of { slot, stats }
 * @param {string} stat — e.g. 'str'
 * @returns {number}
 */
export function getStatBonus(equipped, stat) {
  if (!equipped) return 0;
  let total = 0;
  for (const item of equipped) {
    if (item && item.stats && typeof item.stats[stat] === 'number') {
      total += item.stats[stat];
    }
  }
  return total;
}

/**
 * Aggregate all stat bonuses into a single stat object.
 * @param {object[]} equipped
 * @returns {{str:number, dex:number, int:number, vit:number, wis:number}}
 */
export function getAllStatBonuses(equipped) {
  const out = { str: 0, dex: 0, int: 0, vit: 0, wis: 0 };
  for (const s of Object.keys(out)) out[s] = getStatBonus(equipped, s);
  return out;
}

/**
 * Compute derived stats: max HP from VIT, max mana from INT, etc.
 * @param {object} baseStats — { maxHp, maxMana, attackDamage, attackSpeed, critChance, manaRegen }
 * @param {object} bonuses — { str, dex, int, vit, wis }
 * @returns {object} derived stats
 */
export function deriveStats(baseStats, bonuses) {
  return {
    maxHp:      baseStats.maxHp + bonuses.vit * 4,
    maxMana:    baseStats.maxMana + bonuses.int * 3,
    attackDamage: baseStats.attackDamage + bonuses.str,
    attackSpeed:  baseStats.attackSpeed + bonuses.dex * 0.02,
    critChance:   baseStats.critChance + bonuses.dex * 0.005,
    manaRegen:    baseStats.manaRegen + bonuses.wis * 0.2,
  };
}

/**
 * Equip a new item, returning the previous item that was in that slot
 * (or null if the slot was empty).
 * @param {object} equipment — { helm, chest, ... } map of slot -> item
 * @param {object} item
 * @returns {{ prev: object|null, next: object }} — updated equipment
 */
export function equipItem(equipment, item) {
  if (!item || !item.slot) return { prev: null, next: equipment };
  const prev = equipment[item.slot] || null;
  return {
    prev,
    next: { ...equipment, [item.slot]: item },
  };
}

/**
 * Unequip an item from a slot. Returns the item that was removed.
 * @param {object} equipment
 * @param {string} slot
 * @returns {{ removed: object|null, next: object }}
 */
export function unequipSlot(equipment, slot) {
  const removed = equipment[slot] || null;
  const next = { ...equipment };
  delete next[slot];
  return { removed, next };
}

/**
 * Roll a random drop from a list of template ids, weighted by tier.
 * @param {string[]} templateIds
 * @param {function} [rng]
 * @returns {object|null}
 */
export function rollDrop(templateIds, rng = Math.random) {
  if (!templateIds || !templateIds.length) return null;
  const id = templateIds[Math.floor(rng() * templateIds.length)];
  return rollItem(id, rng);
}
