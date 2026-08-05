// world/secret-areas.js — hidden areas + mini-bosses per biome.
//
// Each biome has one secret area tucked away from the main path.
// Players discover them by walking near a "cue" (glowing crack on a
// wall, hidden path behind a tree, etc.). Once discovered, the cue
// becomes a portal that lets the player enter the secret.
//
// Each secret has:
//   - id, zoneId, name, description
//   - cuePos: world position of the visual cue (e.g., glowing crack)
//   - entryPos: where the player teleports to when entering
//   - bossSpec: { id, name, hp, damage, xp, color }
//   - loot: array of item ids dropped on boss defeat
//
// The actual fight is handled by the boss system; this module just
// owns the data + detection.

export const SECRET_AREAS = {
  verdant: {
    id: 'verdant_secret',
    zoneId: 'verdant',
    name: 'Verwunschener Hain',
    description: 'Ein versteckter Hain hinter dem Wasserfall, in dem ein uralter Baumgeist haust.',
    cuePos:     { x: -30, z:  20 },     // behind the waterfall
    entryPos:   { x: -32, z:  22 },
    bossSpec: {
      id: 'ancient_treant',
      name: 'Uralter Baumgeist',
      hp: 18,
      damage: 2,
      xp: 80,
      color: 0x2D5A2D,
      size: 1.6,
    },
    loot: ['crystal_x5', 'berry_x2'],
    unlocksCodex: ['ancient_treant'],
  },
  dunes: {
    id: 'dunes_secret',
    zoneId: 'dunes',
    name: 'Versunkene Karawanserei',
    description: 'Eine im Sand versunkene Handelsstation. Skorpione bewachen vergessene Schätze.',
    cuePos:     { x:  18, z:  18 },
    entryPos:   { x:  20, z:  20 },
    bossSpec: {
      id: 'sand_king',
      name: 'Sandkönig',
      hp: 24,
      damage: 2,
      xp: 100,
      color: 0xC8946E,
      size: 1.4,
    },
    loot: ['crystal_x8', 'sand_relic'],
    unlocksCodex: ['sand_king'],
  },
  peaks: {
    id: 'peaks_secret',
    zoneId: 'peaks',
    name: 'Gletschergrab',
    description: 'Ein zugefrorenes Grabmal im Herzen des Sturmgipfels. Eismumien erheben sich.',
    cuePos:     { x:   0, z:  30 },
    entryPos:   { x:   0, z:  32 },
    bossSpec: {
      id: 'frost_lord',
      name: 'Frostlord',
      hp: 30,
      damage: 3,
      xp: 150,
      color: 0xA8C5E0,
      size: 1.8,
    },
    loot: ['crystal_x10', 'frost_amulet'],
    unlocksCodex: ['frost_lord'],
  },
  mire: {
    id: 'mire_secret',
    zoneId: 'mire',
    name: 'Sonnenkühle',
    description: 'Eine versteckte Lichtung, in der die Glühwürmchen einen alten Dämon verbergen.',
    cuePos:     { x: -20, z: -10 },
    entryPos:   { x: -22, z: -10 },
    bossSpec: {
      id: 'miremother',
      name: 'Mutter des Sumpfes',
      hp: 28,
      damage: 2,
      xp: 130,
      color: 0x4A5A4F,
      size: 2.0,
    },
    loot: ['crystal_x7', 'swamp_charm'],
    unlocksCodex: ['miremother'],
  },
  ember: {
    id: 'ember_secret',
    zoneId: 'ember',
    name: 'Schmiede der Titanen',
    description: 'Die legendäre Schmiede, in der die ersten Feuer-Golems entstanden.',
    cuePos:     { x:  15, z:  15 },
    entryPos:   { x:  17, z:  17 },
    bossSpec: {
      id: 'titan_forger',
      name: 'Titan-Schmied',
      hp: 40,
      damage: 4,
      xp: 200,
      color: 0xFF6B35,
      size: 2.2,
    },
    loot: ['crystal_x12', 'forge_hammer'],
    unlocksCodex: ['titan_forger'],
  },
  crystal: {
    id: 'crystal_secret',
    zoneId: 'crystal',
    name: 'Singularitätskern',
    description: 'Das Herz der Kristallhöhle, in dem ein einzelner perfekter Kristall pulsiert.',
    cuePos:     { x:  20, z: -10 },
    entryPos:   { x:  22, z: -10 },
    bossSpec: {
      id: 'crystal_warden',
      name: 'Kristallwächter',
      hp: 32,
      damage: 3,
      xp: 160,
      color: 0x7DD3FC,
      size: 1.7,
    },
    loot: ['crystal_x9', 'resonance_shard'],
    unlocksCodex: ['crystal_warden'],
  },
  sky: {
    id: 'sky_secret',
    zoneId: 'sky',
    name: 'Höchster Thron',
    description: 'Der höchste Punkt des Himmeltempels, an dem die Winde singen.',
    cuePos:     { x:   0, z:  28 },
    entryPos:   { x:   0, z:  30 },
    bossSpec: {
      id: 'sky_seraph',
      name: 'Seraph des Himmels',
      hp: 36,
      damage: 3,
      xp: 180,
      color: 0xFCD34D,
      size: 1.8,
    },
    loot: ['crystal_x10', 'wing_charm'],
    unlocksCodex: ['sky_seraph'],
  },
  reef: {
    id: 'reef_secret',
    zoneId: 'reef',
    name: 'Tiefsee-Garten',
    description: 'Ein leuchtender Korallengarten in der Tiefe, bewacht von einem riesigen Kraken.',
    cuePos:     { x:  18, z:  18 },
    entryPos:   { x:  20, z:  20 },
    bossSpec: {
      id: 'kraken_lord',
      name: 'Krakenlord',
      hp: 34,
      damage: 3,
      xp: 170,
      color: 0x34D399,
      size: 2.4,
    },
    loot: ['crystal_x8', 'tide_pearl'],
    unlocksCodex: ['kraken_lord'],
  },
  haunted: {
    id: 'haunted_secret',
    zoneId: 'haunted',
    name: 'Spiegelkammer',
    description: 'Eine Kammer voller Spiegel, in der dein eigenes ECHO dich bekämpft.',
    cuePos:     { x:  -18, z:  18 },
    entryPos:   { x:  -20, z:  20 },
    bossSpec: {
      id: 'shadow_self',
      name: 'Schatten-Selbst',
      hp: 30,
      damage: 4,
      xp: 175,
      color: 0xA78BFA,
      size: 1.0,  // same as player
    },
    loot: ['crystal_x9', 'mirror_shard'],
    unlocksCodex: ['shadow_self'],
  },
  void: {
    id: 'void_secret',
    zoneId: 'void',
    name: 'Anfang des Endes',
    description: 'Der zentrale Riss, an dem die Realität selbst endet und das Nichts beginnt.',
    cuePos:     { x:   0, z:   0 },
    entryPos:   { x:   0, z:   0 },
    bossSpec: {
      id: 'the_architect',
      name: 'Der Architekt',
      hp: 50,
      damage: 5,
      xp: 300,
      color: 0x9090FF,
      size: 3.0,
    },
    loot: ['crystal_x15', 'void_heart'],
    unlocksCodex: ['the_architect'],
  },
};

/**
 * Get the secret area for a given zone.
 * @param {string} zoneId
 * @returns {object|null}
 */
export function getSecretArea(zoneId) {
  return SECRET_AREAS[zoneId] || null;
}

/**
 * Test if a player position is near a secret cue.
 * @param {object} cue
 * @param {{x:number, z:number}} playerPos
 * @param {number} [radius=3.0]
 * @returns {boolean}
 */
export function isNearCue(cue, playerPos, radius = 3.0) {
  if (!cue || !playerPos) return false;
  const dx = cue.cuePos.x - playerPos.x;
  const dz = cue.cuePos.z - playerPos.z;
  return (dx * dx + dz * dz) < (radius * radius);
}

/**
 * Track which secret areas have been discovered. State lives in
 * state.flags as a Set, so it persists across saves.
 * @param {object} state — game state
 * @returns {Set<string>} ids of discovered secrets
 */
export function getDiscovered(state) {
  if (!state) return new Set();
  if (!state.flags) state.flags = new Set();
  if (!state._discoveredSecrets) state._discoveredSecrets = new Set();
  return state._discoveredSecrets;
}

/**
 * Mark a secret as discovered. Returns true if newly discovered.
 * @param {object} state
 * @param {string} id
 * @returns {boolean}
 */
export function discoverSecret(state, id) {
  const set = getDiscovered(state);
  if (set.has(id)) return false;
  set.add(id);
  return true;
}

/**
 * Total count of secret areas defined (for progress UI).
 */
export function totalSecrets() {
  return Object.keys(SECRET_AREAS).length;
}
