// systems/crafting.js — crafting stations + recipe registry + crafting
// function. 4 stations, 30+ recipes, materials registry. Pure data
// + pure functions, no DOM, no three.js.

export const STATIONS = Object.freeze({
  FORGE:     { id: 'forge',     name: 'Schmiede',   icon: 'sword',   color: '#F59E0B' },
  ALCHEMY:   { id: 'alchemy',   name: 'Alchemie',   icon: 'crystal', color: '#34D399' },
  ENCHANTER: { id: 'enchanter', name: 'Verzauberer', icon: 'sparkle', color: '#A78BFA' },
  COOK:      { id: 'cook',      name: 'Küche',      icon: 'berry',   color: '#F472B6' },
});

const MATERIALS = {
  iron_ore:       { id: 'iron_ore',       name: 'Eisenerz',         icon: 'crystal' },
  coal:           { id: 'coal',           name: 'Kohle',            icon: 'crystal' },
  mithril_ore:    { id: 'mithril_ore',    name: 'Mithrilerz',       icon: 'crystal' },
  leather:        { id: 'leather',        name: 'Leder',            icon: 'shield' },
  cloth:          { id: 'cloth',          name: 'Stoff',            icon: 'shield' },
  herb_green:     { id: 'herb_green',     name: 'Grüne Krauter',    icon: 'berry' },
  herb_blue:      { id: 'herb_blue',      name: 'Blaue Krauter',    icon: 'berry' },
  herb_red:       { id: 'herb_red',       name: 'Rote Krauter',     icon: 'berry' },
  mushroom:       { id: 'mushroom',       name: 'Pilz',             icon: 'berry' },
  fish:           { id: 'fish',           name: 'Fisch',            icon: 'berry' },
  meat:           { id: 'meat',           name: 'Fleisch',          icon: 'berry' },
  berry:          { id: 'berry',          name: 'Heilbeere',        icon: 'berry' },
  crystal_shard:  { id: 'crystal_shard',  name: 'Kristallsplitter', icon: 'crystal' },
  rune_arcane:    { id: 'rune_arcane',    name: 'Arkane Rune',      icon: 'sparkle' },
  rune_void:      { id: 'rune_void',      name: 'Leeren-Rune',      icon: 'sparkle' },
  gem_ruby:       { id: 'gem_ruby',       name: 'Rubin',            icon: 'crystal' },
  gem_sapphire:   { id: 'gem_sapphire',   name: 'Saphir',           icon: 'crystal' },
};

export function getMaterial(id) { return MATERIALS[id] || null; }
export function listMaterials() { return Object.values(MATERIALS); }

const RECIPES = {
  // ── Forge (10) ──
  recipe_iron_sword:    { id: 'recipe_iron_sword',    station: 'forge', name: 'Eisernes Schwert',     output: { type: 'item', itemId: 'sword_iron' },    materials: { iron_ore: 3, coal: 1 } },
  recipe_steel_sword:   { id: 'recipe_steel_sword',   station: 'forge', name: 'Stahlschwert',         output: { type: 'item', itemId: 'sword_steel' },   materials: { iron_ore: 5, coal: 2 } },
  recipe_mithril_sword: { id: 'recipe_mithril_sword', station: 'forge', name: 'Mithril-Klinge',       output: { type: 'item', itemId: 'sword_mithril' }, materials: { mithril_ore: 3, coal: 2 } },
  recipe_steel_axe:     { id: 'recipe_steel_axe',     station: 'forge', name: 'Streitaxt',           output: { type: 'item', itemId: 'axe_steel' },     materials: { iron_ore: 4, coal: 2, leather: 1 } },
  recipe_iron_helm:     { id: 'recipe_iron_helm',     station: 'forge', name: 'Eiserner Helm',        output: { type: 'item', itemId: 'helm_iron' },     materials: { iron_ore: 3, leather: 1 } },
  recipe_chain_chest:   { id: 'recipe_chain_chest',   station: 'forge', name: 'Kettenhemd',          output: { type: 'item', itemId: 'chest_chain' },   materials: { iron_ore: 5, cloth: 2 } },
  recipe_plate_chest:   { id: 'recipe_plate_chest',   station: 'forge', name: 'Plattenrüstung',      output: { type: 'item', itemId: 'chest_plate' },   materials: { iron_ore: 8, mithril_ore: 1, leather: 2 } },
  recipe_plate_legs:    { id: 'recipe_plate_legs',    station: 'forge', name: 'Plattenhose',         output: { type: 'item', itemId: 'legs_plate' },    materials: { iron_ore: 4, leather: 2 } },
  recipe_war_boots:     { id: 'recipe_war_boots',     station: 'forge', name: 'Kriegsstiefel',       output: { type: 'item', itemId: 'boots_war' },     materials: { iron_ore: 3, leather: 2 } },
  recipe_gauntlet:      { id: 'recipe_gauntlet',      station: 'forge', name: 'Panzerhandschuhe',    output: { type: 'item', itemId: 'gloves_gauntlet' }, materials: { iron_ore: 3, leather: 2 } },

  // ── Alchemy (8) ──
  recipe_minor_heal:    { id: 'recipe_minor_heal',    station: 'alchemy', name: 'Kleiner Heiltrank',   output: { type: 'consumable', effect: 'heal', amount: 4 },  materials: { herb_green: 2, mushroom: 1 } },
  recipe_greater_heal:  { id: 'recipe_greater_heal',  station: 'alchemy', name: 'Großer Heiltrank',    output: { type: 'consumable', effect: 'heal', amount: 10 }, materials: { herb_green: 3, herb_blue: 1, berry: 2 } },
  recipe_mana_potion:   { id: 'recipe_mana_potion',   station: 'alchemy', name: 'Manatrank',           output: { type: 'consumable', effect: 'mana', amount: 20 }, materials: { herb_blue: 2, crystal_shard: 1 } },
  recipe_greater_mana:  { id: 'recipe_greater_mana',  station: 'alchemy', name: 'Großer Manatrank',    output: { type: 'consumable', effect: 'mana', amount: 40 }, materials: { herb_blue: 3, herb_red: 1, crystal_shard: 2 } },
  recipe_strength_elixir: { id: 'recipe_strength_elixir', station: 'alchemy', name: 'Stärke-Elixier', output: { type: 'consumable', effect: 'buff_str', amount: 3, duration: 30 }, materials: { herb_red: 2, meat: 1 } },
  recipe_speed_elixir:  { id: 'recipe_speed_elixir',  station: 'alchemy', name: 'Geschwindigkeitselixier', output: { type: 'consumable', effect: 'buff_dex', amount: 3, duration: 30 }, materials: { herb_blue: 1, herb_green: 1, fish: 1 } },
  recipe_antidote:      { id: 'recipe_antidote',      station: 'alchemy', name: 'Gegengift',           output: { type: 'consumable', effect: 'cure', amount: 1 }, materials: { mushroom: 2, herb_green: 1 } },
  recipe_explosive:     { id: 'recipe_explosive',     station: 'alchemy', name: 'Sprengladung',        output: { type: 'consumable', effect: 'explode', amount: 8 }, materials: { coal: 3, herb_red: 1, crystal_shard: 1 } },

  // ── Enchanter (7) ──
  recipe_arcane_staff:  { id: 'recipe_arcane_staff',  station: 'enchanter', name: 'Arkaner Stab',     output: { type: 'item', itemId: 'staff_arcane' },   materials: { rune_arcane: 2, gem_sapphire: 1, cloth: 1 } },
  recipe_silver_ring:   { id: 'recipe_silver_ring',   station: 'enchanter', name: 'Silberring',       output: { type: 'item', itemId: 'ring_silver' },    materials: { rune_arcane: 1, gem_sapphire: 1 } },
  recipe_ruby_ring:     { id: 'recipe_ruby_ring',     station: 'enchanter', name: 'Rubinring',        output: { type: 'item', itemId: 'ring_ruby' },      materials: { rune_arcane: 2, gem_ruby: 2 } },
  recipe_enchant_iron:  { id: 'recipe_enchant_iron',  station: 'enchanter', name: 'Verzauberter Eisenhelm', output: { type: 'upgrade', targetId: 'helm_iron', stat: { vit: 5 } }, materials: { rune_arcane: 1, crystal_shard: 2 } },
  recipe_enchant_sword: { id: 'recipe_enchant_sword', station: 'enchanter', name: 'Verzauberte Klinge', output: { type: 'upgrade', targetId: 'sword_iron', stat: { str: 3 } }, materials: { rune_arcane: 2, crystal_shard: 1 } },
  recipe_enchant_void:  { id: 'recipe_enchant_void',  station: 'enchanter', name: 'Leerensiegel',     output: { type: 'item', itemId: 'ring_void' },      materials: { rune_void: 3, crystal_shard: 5 } },
  recipe_arcane_tome:   { id: 'recipe_arcane_tome',   station: 'enchanter', name: 'Arkane Tome',      output: { type: 'consumable', effect: 'learn_spell', amount: 1 }, materials: { rune_arcane: 3, leather: 2 } },

  // ── Cook (5) ──
  recipe_cooked_fish:   { id: 'recipe_cooked_fish',   station: 'cook', name: 'Gebratener Fisch',     output: { type: 'consumable', effect: 'heal', amount: 3 }, materials: { fish: 1 } },
  recipe_cooked_meat:   { id: 'recipe_cooked_meat',   station: 'cook', name: 'Gebratenes Fleisch',   output: { type: 'consumable', effect: 'heal', amount: 5, buff_str: 1, duration: 60 }, materials: { meat: 1, herb_red: 1 } },
  recipe_mushroom_stew: { id: 'recipe_mushroom_stew', station: 'cook', name: 'Pilzeintopf',          output: { type: 'consumable', effect: 'heal', amount: 8 }, materials: { mushroom: 3, herb_green: 1 } },
  recipe_berry_pie:     { id: 'recipe_berry_pie',     station: 'cook', name: 'Beerentarte',          output: { type: 'consumable', effect: 'heal', amount: 12, buff_wis: 2, duration: 60 }, materials: { berry: 4, herb_green: 1 } },
  recipe_feast:         { id: 'recipe_feast',         station: 'cook', name: 'Festmahl',            output: { type: 'consumable', effect: 'heal_full', buff_all: 2, duration: 120 }, materials: { meat: 2, fish: 1, mushroom: 2, berry: 2 } },
};

export function getRecipe(id) { return RECIPES[id] || null; }
export function listRecipes() { return Object.values(RECIPES); }
export function listRecipesByStation(stationId) {
  return Object.values(RECIPES).filter((r) => r.station === stationId);
}

export function totalRecipes() { return Object.keys(RECIPES).length; }

/**
 * Check if the player has the materials to craft a recipe.
 * @param {string} recipeId
 * @param {object} inventory — { materialId: count }
 * @returns {{ canCraft: boolean, missing: object }}
 */
export function canCraft(recipeId, inventory) {
  const recipe = RECIPES[recipeId];
  if (!recipe) return { canCraft: false, missing: {} };
  const missing = {};
  for (const [matId, needed] of Object.entries(recipe.materials)) {
    const have = inventory[matId] || 0;
    if (have < needed) missing[matId] = needed - have;
  }
  return { canCraft: Object.keys(missing).length === 0, missing };
}

/**
 * Attempt to craft a recipe. Deducts materials from inventory.
 * Returns the output (item or consumable spec) on success, or null
 * on failure.
 * @param {string} recipeId
 * @param {object} inventory — { materialId: count }
 * @returns {object|null}
 */
export function craft(recipeId, inventory) {
  const check = canCraft(recipeId, inventory);
  if (!check.canCraft) return null;
  const recipe = RECIPES[recipeId];
  for (const [matId, needed] of Object.entries(recipe.materials)) {
    inventory[matId] = (inventory[matId] || 0) - needed;
  }
  return recipe.output;
}

/**
 * Add materials to inventory (used when gathering). Returns the
 * updated inventory.
 */
export function addToInventory(inventory, matId, count = 1) {
  inventory[matId] = (inventory[matId] || 0) + count;
  return inventory;
}
