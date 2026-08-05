// world/zones/biome-enemies.js — per-biome enemy registry.
//
// Each enemy has stats (hp, damage, speed, aggro, xp) and a
// visual signature (color, body shape, size). The spawn system
// picks from the current zone's enemy pool instead of always
// using the 3 default slimes.

export const ENEMY_TYPES = {
  // ── Verdant (default 3) ──
  slime_blue:    { id: 'slime_blue',    name: 'Wiesen-Schleim',     color: 0x5ad1ff, hp: 2, damage: 1, speed: 1.8, aggro: 7,  range: 1.2, cooldown: 1.4, xp: 10,  body: 'slime'  },
  slime_green:   { id: 'slime_green',   name: 'Blatt-Schleim',      color: 0x6fcf97, hp: 3, damage: 1, speed: 2.6, aggro: 9,  range: 1.3, cooldown: 1.1, xp: 15,  body: 'slime', jump: true },
  slime_purple:  { id: 'slime_purple',  name: 'Nebel-Schleim',      color: 0xb06fd6, hp: 3, damage: 1, speed: 1.4, aggro: 10, range: 7,   cooldown: 2.2, xp: 15,  body: 'slime', ranged: true },

  // ── Dunes ──
  scorpion:      { id: 'scorpion',      name: 'Wüstenskorpion',     color: 0xc8946e, hp: 5, damage: 2, speed: 2.2, aggro: 8,  range: 1.5, cooldown: 1.0, xp: 25,  body: 'bug' },
  sandworm:      { id: 'sandworm',      name: 'Sandwurm',           color: 0xa87a4a, hp: 8, damage: 2, speed: 1.5, aggro: 6,  range: 1.4, cooldown: 1.6, xp: 35,  body: 'worm', burrow: true },
  vulture:       { id: 'vulture',       name: 'Aasgeier',           color: 0x4a3a2a, hp: 3, damage: 1, speed: 3.0, aggro: 12, range: 8,   cooldown: 1.8, xp: 20,  body: 'bird' },

  // ── Peaks ──
  ice_wisp:      { id: 'ice_wisp',      name: 'Eiswisch',           color: 0xa8c5e0, hp: 4, damage: 2, speed: 2.4, aggro: 9,  range: 6,   cooldown: 1.5, xp: 30,  body: 'wisp' },
  mountain_goat: { id: 'mountain_goat', name: 'Bergziege',          color: 0x8a6a4a, hp: 10, damage: 2, speed: 2.8, aggro: 5, range: 1.4, cooldown: 1.0, xp: 40,  body: 'beast' },
  frost_slime:   { id: 'frost_slime',   name: 'Frostschleim',       color: 0xc5e0f0, hp: 6, damage: 2, speed: 1.6, aggro: 7, range: 1.3, cooldown: 1.4, xp: 35, body: 'slime' },
  yeti:          { id: 'yeti',          name: 'Yeti',               color: 0xe8e8e0, hp: 18, damage: 4, speed: 2.0, aggro: 12, range: 1.6, cooldown: 1.5, xp: 80, body: 'beast' },

  // ── Mire ──
  bog_slime:     { id: 'bog_slime',     name: 'Sumpfschleim',       color: 0x4a5a3a, hp: 5, damage: 1, speed: 1.4, aggro: 7, range: 1.3, cooldown: 1.6, xp: 25, body: 'slime' },
  willow_wisp:   { id: 'willow_wisp',   name: 'Weidenwisch',        color: 0x6a8a4a, hp: 4, damage: 2, speed: 2.0, aggro: 9, range: 7,  cooldown: 1.5, xp: 30, body: 'wisp' },
  mire_lurker:   { id: 'mire_lurker',   name: 'Sumpflaurer',        color: 0x3a4a2a, hp: 12, damage: 3, speed: 1.8, aggro: 10, range: 1.5, cooldown: 1.4, xp: 55, body: 'beast' },
  frog_giant:    { id: 'frog_giant',    name: 'Riesenfrosch',       color: 0x6a9a4a, hp: 7, damage: 2, speed: 2.4, aggro: 8, range: 1.5, cooldown: 1.2, xp: 35, body: 'beast' },

  // ── Ember ──
  fire_slime:    { id: 'fire_slime',    name: 'Feuerschleim',       color: 0xff6b35, hp: 6, damage: 2, speed: 1.8, aggro: 8, range: 1.3, cooldown: 1.3, xp: 35, body: 'slime' },
  lava_golem:    { id: 'lava_golem',    name: 'Lavagolem',          color: 0x9a2a1a, hp: 20, damage: 4, speed: 1.2, aggro: 10, range: 1.8, cooldown: 1.6, xp: 90, body: 'golem' },
  ember_wisp:    { id: 'ember_wisp',    name: 'Glutwisch',          color: 0xff8855, hp: 5, damage: 2, speed: 2.4, aggro: 9, range: 7, cooldown: 1.5, xp: 40, body: 'wisp' },
  salamander:     { id: 'salamander',    name: 'Salamander',         color: 0xffaa55, hp: 9, damage: 3, speed: 2.6, aggro: 9, range: 1.4, cooldown: 1.2, xp: 50, body: 'beast' },

  // ── Crystal ──
  crystal_slime: { id: 'crystal_slime', name: 'Kristallschleim',    color: 0x7dd3fc, hp: 6, damage: 2, speed: 1.6, aggro: 7, range: 1.3, cooldown: 1.4, xp: 40, body: 'slime' },
  echo_wraith:   { id: 'echo_wraith',   name: 'Echo-Wraith',        color: 0x9dd4ff, hp: 8, damage: 2, speed: 2.2, aggro: 9, range: 1.5, cooldown: 1.3, xp: 50, body: 'wraith' },
  gem_golem:     { id: 'gem_golem',     name: 'Edelstein-Golem',    color: 0x4a5a8a, hp: 18, damage: 3, speed: 1.0, aggro: 8, range: 1.7, cooldown: 1.6, xp: 80, body: 'golem' },
  shard_bat:     { id: 'shard_bat',     name: 'Splitterfledermaus', color: 0xa8c8e8, hp: 4, damage: 1, speed: 3.0, aggro: 8, range: 1.2, cooldown: 1.0, xp: 30, body: 'bird' },

  // ── Sky ──
  sky_lantern:   { id: 'sky_lantern',   name: 'Himmelslaterne',     color: 0xfcd34d, hp: 5, damage: 2, speed: 2.0, aggro: 8, range: 6,  cooldown: 1.5, xp: 40, body: 'wisp' },
  wind_wraith:   { id: 'wind_wraith',   name: 'Wind-Wraith',        color: 0xe0e8f0, hp: 7, damage: 2, speed: 2.6, aggro: 9, range: 1.4, cooldown: 1.3, xp: 50, body: 'wraith' },
  temple_guardian: { id: 'temple_guardian', name: 'Tempelwächter',  color: 0xe8ddb8, hp: 22, damage: 4, speed: 1.4, aggro: 10, range: 1.7, cooldown: 1.5, xp: 100, body: 'golem' },
  harpy:         { id: 'harpy',         name: 'Harpyie',            color: 0xa08060, hp: 6, damage: 2, speed: 2.8, aggro: 9, range: 1.3, cooldown: 1.2, xp: 45, body: 'bird' },

  // ── Reef ──
  crab:          { id: 'crab',          name: 'Riesenkrabbe',       color: 0xc8a876, hp: 8, damage: 2, speed: 1.4, aggro: 6, range: 1.4, cooldown: 1.4, xp: 35, body: 'beast' },
  jellyfish:     { id: 'jellyfish',     name: 'Riesenqualle',       color: 0xa4d4ff, hp: 5, damage: 2, speed: 1.8, aggro: 8, range: 5, cooldown: 1.6, xp: 40, body: 'wisp' },
  eel:           { id: 'eel',           name: 'Blitzaal',           color: 0x4a5a8a, hp: 10, damage: 3, speed: 2.4, aggro: 9, range: 1.5, cooldown: 1.2, xp: 55, body: 'beast' },
  moray:         { id: 'moray',         name: 'Muräne',             color: 0x6a5a4a, hp: 14, damage: 3, speed: 1.8, aggro: 8, range: 1.5, cooldown: 1.4, xp: 65, body: 'beast' },

  // ── Haunted ──
  ghost_slime:   { id: 'ghost_slime',   name: 'Geisterschleim',     color: 0xa78bfa, hp: 5, damage: 2, speed: 1.6, aggro: 8, range: 1.3, cooldown: 1.4, xp: 40, body: 'slime' },
  wraith:        { id: 'wraith',        name: 'Wraith',             color: 0xc5b0e8, hp: 9, damage: 3, speed: 2.4, aggro: 10, range: 1.5, cooldown: 1.3, xp: 55, body: 'wraith' },
  haunted_armor: { id: 'haunted_armor', name: 'Verfluchte Rüstung', color: 0x6a5a7a, hp: 16, damage: 3, speed: 1.2, aggro: 8, range: 1.5, cooldown: 1.5, xp: 70, body: 'golem' },
  banshee:       { id: 'banshee',       name: 'Banshee',            color: 0xd0c0e8, hp: 12, damage: 4, speed: 2.0, aggro: 12, range: 6,  cooldown: 1.5, xp: 80, body: 'wraith' },

  // ── Void ──
  void_slime:    { id: 'void_slime',    name: 'Leerenschleim',      color: 0x4a3aaa, hp: 8, damage: 3, speed: 2.0, aggro: 9, range: 1.4, cooldown: 1.3, xp: 50, body: 'slime' },
  phase_stalker: { id: 'phase_stalker', name: 'Phasenjäger',        color: 0x6a5aca, hp: 14, damage: 4, speed: 2.6, aggro: 11, range: 1.6, cooldown: 1.3, xp: 75, body: 'wraith' },
  rift_lord:     { id: 'rift_lord',     name: 'Riss-Lord',          color: 0x9090ff, hp: 24, damage: 5, speed: 1.4, aggro: 12, range: 1.8, cooldown: 1.5, xp: 110, body: 'golem' },
  null_wisp:     { id: 'null_wisp',     name: 'Null-Wisch',         color: 0xc0c0ff, hp: 6, damage: 3, speed: 2.8, aggro: 10, range: 7, cooldown: 1.4, xp: 60, body: 'wisp' },
};

export function getEnemyType(id) {
  return ENEMY_TYPES[id] || null;
}

export function listEnemyTypes() {
  return Object.values(ENEMY_TYPES);
}

/**
 * Pick a random enemy from a pool, weighted by nothing (uniform).
 * Falls back to slime_blue if pool is empty.
 * @param {string[]} pool
 * @param {function} [rng]
 * @returns {object} enemy type
 */
export function pickEnemy(pool, rng = Math.random) {
  if (!pool || !pool.length) return ENEMY_TYPES.slime_blue;
  const id = pool[Math.floor(rng() * pool.length)];
  return ENEMY_TYPES[id] || ENEMY_TYPES.slime_blue;
}

/** Total enemy types defined. */
export function totalEnemyTypes() {
  return Object.keys(ENEMY_TYPES).length;
}
