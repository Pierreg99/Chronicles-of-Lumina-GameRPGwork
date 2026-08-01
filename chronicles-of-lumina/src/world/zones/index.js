// world/zones/index.js — biome definitions for the open world.
//
// Each zone describes its visual identity (terrain colors, sky, fog), what
// enemies and props populate it, ambient audio, and a description for the
// start screen. The world-builder reads from here instead of hardcoding
// the village/forest/shrine layout.
//
// Adding a new zone = add an entry below. No other code needs to change.

export const ZONES = {
  verdant: {
    id: 'verdant',
    name: 'Smaragdwald',
    description: 'Dichte Eichen, saftige Wiesen. Heimat des Dorfes und der Schleime.',
    accent: '#7BC96F',         // biome swatch for UI
    sky:        0x8fc7e8,      // soft daylight blue
    fog:        0xb6e2c2,
    fogNear:    30,
    fogFar:     95,
    ambient:    0xa3c4a0,
    sun:        0xfff1c4,
    ground:     0x6ab04c,
    path:       0xd9c79a,
    trees:     ['oak', 'pine', 'bush'],
    rocks:      3,              // count
    enemyPool: ['slimeBlue', 'slimeGreen'],
    bossPool:  ['fogcolossus'],
    music:     'forest',
    difficulty: 1.0,
    spawns: {
      village:  { x: -22, z: 18 },
      shrine:   { x:  30, z: -28 },
      forestCenter: { x: 18, z: -10 },
    },
  },
  dunes: {
    id: 'dunes',
    name: 'Golddünen',
    description: 'Sand, Hitze und vergrabene Geheimnisse. Schnelle Skorpione und Sandstürme.',
    accent: '#F4A460',
    sky:        0xF5D0A0,      // warm sunset
    fog:        0xE8C896,
    fogNear:    25,
    fogFar:     90,
    ambient:    0xE8C896,
    sun:        0xFFCC66,
    ground:     0xE8B66E,
    path:       0xC8946E,
    trees:     ['palm', 'cactus'],
    rocks:      5,
    enemyPool: ['scorpion', 'sandworm'],
    bossPool:  ['sandlord'],
    music:     'desert',
    difficulty: 1.3,
    spawns: {
      oasis:    { x: 0,   z: 0 },
      pyramid:  { x: 30, z: -30 },
      ruins:    { x: -28, z: 22 },
    },
  },
  peaks: {
    id: 'peaks',
    name: 'Sturmgipfel',
    description: 'Schneebedeckte Berge, dünne Luft, Eisdrachen. Nur für erfahrene Aren.',
    accent: '#A8C5E0',
    sky:        0xB8C9DC,      // overcast
    fog:        0xD6E2EE,
    fogNear:    18,
    fogFar:     80,
    ambient:    0xB8C9DC,
    sun:        0xE6F0FF,
    ground:     0xE8EEF4,
    path:       0xA8B5C5,
    trees:     ['pine_snow'],
    rocks:      8,
    enemyPool: ['ice_wisp', 'mountain_goat', 'frost_slime'],
    bossPool:  ['glacial_wyrm'],
    music:     'mountain',
    difficulty: 1.6,
    spawns: {
      peak:     { x:  0,  z:  0 },
      bridge:   { x: 20, z: -20 },
      cave:     { x: -25, z:  25 },
    },
  },
  mire: {
    id: 'mire',
    name: 'Nebelmarsch',
    description: 'Sumpf, Glühwürmchen, schleichende Gestalten. Giftige Pfützen und schwere Monster.',
    accent: '#7B9E6B',
    sky:        0x6B7A8F,      // dim overcast
    fog:        0x4A5A4F,
    fogNear:    12,
    fogFar:     60,
    ambient:    0x5A6A5F,
    sun:        0xC4D6B8,
    ground:     0x3F4F3A,
    path:       0x5C4F38,
    trees:     ['willow', 'dead_tree'],
    rocks:      2,
    enemyPool: ['bog_slime', 'willow_wisp', 'mire_lurker'],
    bossPool:  ['miremother'],
    music:     'swamp',
    difficulty: 1.4,
    spawns: {
      hub:      { x:  0,  z:  0 },
      sunken:   { x: 22, z: -22 },
      altar:    { x: -22, z:  22 },
    },
  },
  ember: {
    id: 'ember',
    name: 'Glutkessel',
    description: 'Vulkaninsel mit Lavaströmen, Feuer-Golems und dem Endgame-Boss.',
    accent: '#FF6B35',
    sky:        0x4A1A1A,      // smoke red
    fog:        0x6B2A1A,
    fogNear:    15,
    fogFar:     70,
    ambient:    0x6B2A1A,
    sun:        0xFF8855,
    ground:     0x2A1A1A,
    path:       0x4A2A1A,
    trees:     ['dead_tree', 'obsidian'],
    rocks:      6,
    enemyPool: ['fire_slime', 'lava_golem', 'ember_wisp'],
    bossPool:  ['pyrelord'],
    music:     'volcano',
    difficulty: 2.0,
    spawns: {
      caldera:  { x:  0,  z:  0 },
      forge:    { x: 25, z: -25 },
      spire:    { x: -25, z:  25 },
    },
  },
};

// Default zone (player starts here)
export const DEFAULT_ZONE = 'verdant';

// Get a zone by id, with safe fallback
export function getZone(id) {
  return ZONES[id] || ZONES[DEFAULT_ZONE];
}

// List of all zone ids (for iteration)
export function listZones() {
  return Object.values(ZONES);
}

// Encode a custom map as a short URL-safe code: "verdant:20473104"
export function encodeMapCode(zoneId, seed) {
  return `${zoneId}:${(seed >>> 0).toString(36).padStart(7, '0')}`;
}

// Decode a map code. Returns { zoneId, seed } or null if invalid.
export function decodeMapCode(code) {
  if (!code || typeof code !== 'string') return null;
  if (!code.includes(':')) return null;
  const [zoneId, seedStr] = code.split(':');
  if (!ZONES[zoneId]) return null;
  if (!seedStr) return null;
  const seed = parseInt(seedStr, 36);
  if (Number.isNaN(seed)) return null;
  return { zoneId, seed: seed >>> 0 };
}
