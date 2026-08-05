// systems/npc.js — NPC registry, dialog trees, and shop data.
//
// An NPC has: id, name, role (elder, vendor, quest_giver,
// merchant, trainer), location (zone id), portrait (icon),
// dialogTree (root node id), optional shop (item pool), optional
// quests (quest ids to offer).

export const NPC_ROLES = {
  ELDER:       { id: 'elder',       name: 'Ältester' },
  VENDOR:      { id: 'vendor',      name: 'Händler' },
  QUEST_GIVER: { id: 'quest_giver', name: 'Auftraggeber' },
  TRAINER:     { id: 'trainer',     name: 'Lehrmeister' },
  BLACKSMITH:  { id: 'blacksmith',  name: 'Schmied' },
  ALCHEMIST:   { id: 'alchemist',   name: 'Alchemist' },
  ENCHANTER:   { id: 'enchanter',   name: 'Verzauberer' },
  INNKEEPER:   { id: 'innkeeper',   name: 'Gastwirt' },
  SAGE:        { id: 'sage',        name: 'Weiser' },
  GUARD:       { id: 'guard',       name: 'Wache' },
  SPIRIT:      { id: 'spirit',      name: 'Geist' },
  MERCHANT:    { id: 'merchant',    name: 'Reisender' },
};

const NPCS = {
  elder_thaddeus: {
    id: 'elder_thaddeus', name: 'Ältester Thaddeus', role: 'elder',
    location: 'verdant', portrait: 'sage',
    desc: 'Ein weiser alter Mann, der die Kristalle hütet.',
    dialogTree: 'dt_thaddeus_root',
  },
  vendor_mira: {
    id: 'vendor_mira', name: 'Mira die Händlerin', role: 'vendor',
    location: 'verdant', portrait: 'merchant',
    desc: 'Verkauft Tränke und Vorräte.',
    dialogTree: 'dt_mira_root',
    shop: { id: 'shop_mira', name: 'Miras Waren', items: ['potion_hp_small', 'potion_mana_small', 'bread', 'torch'] },
  },
  blacksmith_iron: {
    id: 'blacksmith_iron', name: 'Iron der Schmied', role: 'blacksmith',
    location: 'verdant', portrait: 'blacksmith',
    desc: 'Repariert Ausrüstung und verkauft Waffen.',
    dialogTree: 'dt_iron_root',
    shop: { id: 'shop_iron', name: 'Irons Waffen', items: ['sword_iron', 'hammer_iron', 'dagger_steel'] },
  },
  alchemist_yarrow: {
    id: 'alchemist_yarrow', name: 'Yarrow der Alchemist', role: 'alchemist',
    location: 'verdant', portrait: 'alchemist',
    desc: 'Braut Tränke aus seltenen Kräutern.',
    dialogTree: 'dt_yarrow_root',
    shop: { id: 'shop_yarrow', name: 'Yarrows Tränke', items: ['potion_hp_large', 'potion_mana_large', 'potion_antidote', 'potion_stamina'] },
  },
  enchanter_lyra: {
    id: 'enchanter_lyra', name: 'Lyra die Verzauberin', role: 'enchanter',
    location: 'verdant', portrait: 'sage',
    desc: 'Verzaubert Ausrüstung mit mächtigen Effekten.',
    dialogTree: 'dt_lyra_root',
    shop: { id: 'shop_lyra', name: 'Lyras Verzauberungen', items: ['rune_fire', 'rune_ice', 'rune_lightning', 'scroll_teleport'] },
  },
  sage_korin: {
    id: 'sage_korin', name: 'Korin der Weise', role: 'sage',
    location: 'mire', portrait: 'sage',
    desc: 'Kennt die Geheimnisse des Sumpfes.',
    dialogTree: 'dt_korin_root',
  },
  guard_kael: {
    id: 'guard_kael', name: 'Wächter Kael', role: 'guard',
    location: 'verdant', portrait: 'guard',
    desc: 'Bewacht den Eingang zum Dorf.',
    dialogTree: 'dt_kael_root',
  },
  spirit_ancient: {
    id: 'spirit_ancient', name: 'Uralter Geist', role: 'spirit',
    location: 'haunted', portrait: 'spirit',
    desc: 'Ein ruheloses Wesen, das nach Erlösung sucht.',
    dialogTree: 'dt_spirit_root',
  },
  merchant_owl: {
    id: 'merchant_owl', name: 'Eulrich der Reisende', role: 'merchant',
    location: 'dunes', portrait: 'merchant',
    desc: 'Ein reisender Händler mit exotischen Waren.',
    dialogTree: 'dt_owl_root',
    shop: { id: 'shop_owl', name: 'Eulrichs Exotica', items: ['potion_hp_small', 'scroll_teleport', 'gem_fire', 'gem_ice'] },
  },
  trainer_ash: {
    id: 'trainer_ash', name: 'Ascheklinge', role: 'trainer',
    location: 'ember', portrait: 'warrior',
    desc: 'Lehrt Krieger-Skills.',
    dialogTree: 'dt_ash_root',
  },
  trainer_lyric: {
    id: 'trainer_lyric', name: 'Lyric die Magierin', role: 'trainer',
    location: 'crystal', portrait: 'mage',
    desc: 'Lehrt Magier-Skills.',
    dialogTree: 'dt_lyric_root',
  },
  trainer_shadow: {
    id: 'trainer_shadow', name: 'Schatten', role: 'trainer',
    location: 'haunted', portrait: 'rogue',
    desc: 'Lehrt Schurken-Skills.',
    dialogTree: 'dt_shadow_root',
  },
  innkeeper_hollow: {
    id: 'innkeeper_hollow', name: 'Gastwirt Hollow', role: 'innkeeper',
    location: 'verdant', portrait: 'merchant',
    desc: 'Bietet ein Bett für die Nacht.',
    dialogTree: 'dt_hollow_root',
  },
};

export function getNPC(id) { return NPCS[id] || null; }
export function listNPCs() { return Object.values(NPCS); }
export function listNPCsByZone(zoneId) {
  return Object.values(NPCS).filter((n) => n.location === zoneId);
}
export function listNPCsByRole(roleId) {
  return Object.values(NPCS).filter((n) => n.role === roleId);
}
export function totalNPCs() { return Object.keys(NPCS).length; }

/**
 * Dialog tree. Each node: { id, text, choices: [{ text, next, condition?, action? }] }
 * Conditions: { hasItem, hasQuest, completedQuest, level, gold }
 * Actions: { giveItem, giveGold, takeItem, startQuest, completeQuest, giveXp, giveSkillPoint }
 */
const DIALOG_TREES = {
  dt_thaddeus_root: {
    id: 'dt_thaddeus_root',
    text: 'Willkommen, junger Held. Die Kristalle wurden über das Land verstreut. Kannst du sie zurückbringen?',
    choices: [
      { text: 'Was muss ich tun?', next: 'dt_thaddeus_quest' },
      { text: 'Wer bist du?', next: 'dt_thaddeus_lore' },
      { text: 'Auf Wiedersehen.', next: null },
    ],
  },
  dt_thaddeus_quest: {
    id: 'dt_thaddeus_quest',
    text: 'Sammle 10 Lichtkristalle aus den verschiedenen Regionen und bringe sie zum Schrein. Erst dann kannst du den Nebel-Koloss besiegen.',
    choices: [
      { text: 'Ich werde es versuchen.', next: null, action: { startQuest: 'q_collect_crystals' } },
      { text: 'Mehr erzählen.', next: 'dt_thaddeus_lore' },
    ],
  },
  dt_thaddeus_lore: {
    id: 'dt_thaddeus_lore',
    text: 'Ich bin der letzte Wächter des Schrein. Die Biome wurden einst durch die Kristalle verbunden, bis der Nebel alles zerriss.',
    choices: [
      { text: 'Verstehe.', next: 'dt_thaddeus_root' },
    ],
  },
  dt_mira_root: {
    id: 'dt_mira_root',
    text: 'Frische Waren! Was darf es sein?',
    choices: [
      { text: 'Zeig mir deine Waren.', next: 'dt_mira_shop' },
      { text: 'Erzähl mir einen Trank.', next: 'dt_mira_lore' },
      { text: 'Bis später.', next: null },
    ],
  },
  dt_mira_shop: {
    id: 'dt_mira_shop',
    text: 'Hier sind meine besten Angebote.',
    choices: [
      { text: 'Danke.', next: null, action: { openShop: 'shop_mira' } },
    ],
  },
  dt_mira_lore: {
    id: 'dt_mira_lore',
    text: 'Tränke sind das A und O. Wer ohne Tränke reist, kommt selten weit.',
    choices: [
      { text: 'Wahr.', next: 'dt_mira_root' },
    ],
  },
  dt_iron_root: {
    id: 'dt_iron_root',
    text: 'Gutes Metall erkennt man am Klang. Was brauchst du?',
    choices: [
      { text: 'Waffen bitte.', next: 'dt_iron_shop' },
      { text: 'Rüste mich aus.', next: 'dt_iron_upgrade' },
    ],
  },
  dt_iron_shop: {
    id: 'dt_iron_shop',
    text: 'Nur das Beste aus meiner Schmiede.',
    choices: [
      { text: 'Danke.', next: null, action: { openShop: 'shop_iron' } },
    ],
  },
  dt_iron_upgrade: {
    id: 'dt_iron_upgrade',
    text: 'Bring mir Erz und ich verstärke deine Ausrüstung.',
    choices: [
      { text: 'Verstanden.', next: 'dt_iron_root' },
    ],
  },
  dt_yarrow_root: {
    id: 'dt_yarrow_root',
    text: 'Die Alchemie ist eine Kunst. Welcher Trank darf es sein?',
    choices: [
      { text: 'Deine Tränke.', next: 'dt_yarrow_shop' },
      { text: 'Wie braut man?', next: 'dt_yarrow_lore' },
    ],
  },
  dt_yarrow_shop: {
    id: 'dt_yarrow_shop',
    text: 'Wähle weise.',
    choices: [
      { text: 'Danke.', next: null, action: { openShop: 'shop_yarrow' } },
    ],
  },
  dt_yarrow_lore: {
    id: 'dt_yarrow_lore',
    text: 'Man nehme Kräuter, Wasser und ein wenig Magie. Der Rest ist Geduld.',
    choices: [{ text: 'Notiert.', next: 'dt_yarrow_root' }],
  },
  dt_lyra_root: {
    id: 'dt_lyra_root',
    text: 'Magie fließt durch alle Dinge. Was suchst du?',
    choices: [
      { text: 'Verzauberungen.', next: 'dt_lyra_shop' },
      { text: 'Was ist Verzauberung?', next: 'dt_lyra_lore' },
    ],
  },
  dt_lyra_shop: {
    id: 'dt_lyra_shop',
    text: 'Diese Runen warten auf dich.',
    choices: [{ text: 'Danke.', next: null, action: { openShop: 'shop_lyra' } }],
  },
  dt_lyra_lore: {
    id: 'dt_lyra_lore',
    text: 'Eine Verzauberung ist eine Bindung zwischen dir und der Magie. Sie verändert deine Ausrüstung.',
    choices: [{ text: 'Verstehe.', next: 'dt_lyra_root' }],
  },
  dt_korin_root: {
    id: 'dt_korin_root',
    text: 'Der Sumpf birgt mehr als er zeigt. Pass auf.',
    choices: [{ text: 'Danke für den Rat.', next: null }],
  },
  dt_kael_root: {
    id: 'dt_kael_root',
    text: 'Bleib wachsam, Reisender. Die Schatten sind unruhig.',
    choices: [{ text: 'Ich bin bereit.', next: null }],
  },
  dt_spirit_root: {
    id: 'dt_spirit_root',
    text: 'Hilf mir... meine Seele fand keine Ruhe...',
    choices: [
      { text: 'Was ist passiert?', next: 'dt_spirit_lore' },
      { text: 'Möge deine Seele Ruhe finden.', next: null },
    ],
  },
  dt_spirit_lore: {
    id: 'dt_spirit_lore',
    text: 'Der Architekt... er hat uns in diese Form gezwungen...',
    choices: [{ text: 'Ich werde ihn aufhalten.', next: null }],
  },
  dt_owl_root: {
    id: 'dt_owl_root',
    text: 'Eulrich hat, was du suchst. Frag nur!',
    choices: [
      { text: 'Zeig deine Waren.', next: 'dt_owl_shop' },
      { text: 'Reist du viel?', next: 'dt_owl_lore' },
    ],
  },
  dt_owl_shop: {
    id: 'dt_owl_shop',
    text: 'Aus allen Ecken der Welt.',
    choices: [{ text: 'Danke.', next: null, action: { openShop: 'shop_owl' } }],
  },
  dt_owl_lore: {
    id: 'dt_owl_lore',
    text: 'Jedes Biom hat seine Geheimnisse. Wer reist, lernt sie alle kennen.',
    choices: [{ text: 'Wahr.', next: 'dt_owl_root' }],
  },
  dt_ash_root: {
    id: 'dt_ash_root',
    text: 'Stärke kommt aus Schmerz. Bereit für die Lektion?',
    choices: [{ text: 'Ich bin bereit.', next: null }],
  },
  dt_lyric_root: {
    id: 'dt_lyric_root',
    text: 'Mana ist der Atem der Welt. Höre ihm zu.',
    choices: [{ text: 'Ich lausche.', next: null }],
  },
  dt_shadow_root: {
    id: 'dt_shadow_root',
    text: '...',
    choices: [{ text: '...', next: null }],
  },
  dt_hollow_root: {
    id: 'dt_hollow_root',
    text: 'Ein Bett für die Nacht? Oder nur ein warmes Essen?',
    choices: [
      { text: 'Ein Bett bitte.', next: 'dt_hollow_bed' },
      { text: 'Nur ein Gespräch.', next: 'dt_hollow_talk' },
    ],
  },
  dt_hollow_bed: {
    id: 'dt_hollow_bed',
    text: 'Schlaf gut. Die Welt dreht sich morgen weiter.',
    choices: [{ text: 'Danke.', next: null, action: { rest: true } }],
  },
  dt_hollow_talk: {
    id: 'dt_hollow_talk',
    text: 'Es ist ruhig hier. Manchmal zu ruhig. Aber das ist okay.',
    choices: [{ text: 'Stimmt.', next: 'dt_hollow_root' }],
  },
};

export function getDialogNode(id) { return DIALOG_TREES[id] || null; }
export function getNPCDialogRoot(npcId) {
  const npc = NPCS[npcId];
  if (!npc) return null;
  return DIALOG_TREES[npc.dialogTree] || null;
}

/**
 * Evaluate a dialog choice. Returns the next dialog node or null
 * if conversation ends. Conditions are evaluated against game state.
 */
export function evaluateChoice(node, choiceIdx, state) {
  if (!node || !node.choices || !node.choices[choiceIdx]) return null;
  const choice = node.choices[choiceIdx];
  if (choice.condition) {
    if (choice.condition.level && (state.level || 0) < choice.condition.level) return null;
    if (choice.condition.gold && (state.gold || 0) < choice.condition.gold) return null;
    if (choice.condition.hasItem && !state.inventory?.includes(choice.condition.hasItem)) return null;
  }
  if (choice.action) applyAction(choice.action, state);
  if (!choice.next) return null;
  return DIALOG_TREES[choice.next] || null;
}

function applyAction(action, state) {
  if (!action || !state) return;
  if (action.giveItem) {
    state.inventory = state.inventory || [];
    if (!state.inventory.includes(action.giveItem)) state.inventory.push(action.giveItem);
  }
  if (action.takeItem && state.inventory) {
    state.inventory = state.inventory.filter((id) => id !== action.takeItem);
  }
  if (action.giveGold) state.gold = (state.gold || 0) + action.giveGold;
  if (action.startQuest) {
    state.quests = state.quests || {};
    state.quests[action.startQuest] = state.quests[action.startQuest] || { status: 'active' };
  }
  if (action.completeQuest && state.quests) {
    state.quests[action.completeQuest] = { status: 'completed' };
  }
  if (action.giveXp) state.xp = (state.xp || 0) + action.giveXp;
  if (action.giveSkillPoint) state.skillPoints = (state.skillPoints || 0) + 1;
}

export function totalDialogNodes() { return Object.keys(DIALOG_TREES).length; }
