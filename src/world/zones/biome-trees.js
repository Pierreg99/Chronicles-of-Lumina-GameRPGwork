// world/zones/biome-trees.js — per-biome tree variant registry.
//
// Each tree is a data record: trunk color, crown color/size,
// optional accent (fruits, glow, crystals). The forest.js builder
// reads from this to vary trees by current zone. Adds visual
// variety without requiring new 3D assets.

export const TREE_TYPES = {
  // ── Verdant (forest) ──
  oak:           { id: 'oak',           trunk: 0x8b5a2b, crown: 0x3d8b3d, crownSize: 1.4, accent: null,           shape: 'icosa' },
  birch:         { id: 'birch',         trunk: 0xe8e8e0, crown: 0x6fa86f, crownSize: 1.2, accent: null,           shape: 'icosa' },
  bush:          { id: 'bush',          trunk: 0x6a4426, crown: 0x4f9b3a, crownSize: 0.8, accent: 0xff6fb1,       shape: 'icosa' },
  // ── Dunes (desert) ──
  palm:          { id: 'palm',          trunk: 0x8b5a2b, crown: 0x2d6b3d, crownSize: 1.6, accent: null,           shape: 'spike' },
  cactus:        { id: 'cactus',        trunk: 0x4a7a3a, crown: 0x5a9a4a, crownSize: 0.7, accent: 0xff6fb1,       shape: 'column' },
  dead_shrub:    { id: 'dead_shrub',    trunk: 0x6a5a3a, crown: 0x8a7a5a, crownSize: 0.6, accent: null,           shape: 'icosa' },
  // ── Peaks (mountain) ──
  pine:          { id: 'pine',          trunk: 0x6a4426, crown: 0x2d5b2d, crownSize: 1.5, accent: null,           shape: 'cone' },
  pine_snow:     { id: 'pine_snow',     trunk: 0x6a4426, crown: 0x8fb8c8, crownSize: 1.5, accent: 0xffffff,       shape: 'cone' },
  // ── Mire (swamp) ──
  willow:        { id: 'willow',        trunk: 0x5a4a2a, crown: 0x4a6a3a, crownSize: 1.4, accent: 0x9acd32,       shape: 'droop' },
  dead_tree:     { id: 'dead_tree',     trunk: 0x4a3a2a, crown: 0x3a2a1a, crownSize: 1.0, accent: null,           shape: 'spike' },
  glow_mushroom: { id: 'glow_mushroom', trunk: 0x6a5a3a, crown: 0x9acd32, crownSize: 0.5, accent: 0xffe066,       shape: 'mushroom' },
  // ── Ember (volcano) ──
  obsidian:      { id: 'obsidian',      trunk: 0x1a1a2a, crown: 0x2a2a3a, crownSize: 1.2, accent: 0xff6b35,       shape: 'spike' },
  ember_bush:    { id: 'ember_bush',    trunk: 0x3a2a1a, crown: 0x6b2a1a, crownSize: 0.7, accent: 0xff8855,       shape: 'icosa' },
  // ── Crystal (underground) ──
  crystal_cluster: { id: 'crystal_cluster', trunk: 0x2a2545, crown: 0x7dd3fc, crownSize: 0.6, accent: 0x9DD4FF,     shape: 'crystal' },
  cave_moss:     { id: 'cave_moss',     trunk: 0x1a1530, crown: 0x4a5a6a, crownSize: 0.5, accent: 0x60a5fa,       shape: 'icosa' },
  // ── Sky (floating islands) ──
  cloud_bush:    { id: 'cloud_bush',    trunk: 0xf5edd8, crown: 0xffffff, crownSize: 1.0, accent: 0xfff8dc,       shape: 'puff' },
  floating_shrine: { id: 'floating_shrine', trunk: 0xe8e0c0, crown: 0xfcd34d, crownSize: 0.5, accent: 0xfff8dc,     shape: 'spike' },
  // ── Reef (underwater) ──
  coral:         { id: 'coral',         trunk: 0xc8a876, crown: 0xff8a7a, crownSize: 0.8, accent: 0xffd23f,       shape: 'coral' },
  kelp:          { id: 'kelp',          trunk: 0x6a8a3a, crown: 0x4a6a2a, crownSize: 1.5, accent: null,           shape: 'spike' },
  sea_anemone:   { id: 'sea_anemone',   trunk: 0xa8a8a8, crown: 0xa4d4ff, crownSize: 0.4, accent: 0xff8a7a,       shape: 'puff' },
  // ── Haunted (ruins) ──
  haunted_bush:  { id: 'haunted_bush',  trunk: 0x4a3a5a, crown: 0x6a5a7a, crownSize: 0.7, accent: 0xa78bfa,       shape: 'spike' },
  ghost_tree:    { id: 'ghost_tree',    trunk: 0x8a8aaa, crown: 0xc5b0e8, crownSize: 1.1, accent: 0xc5b0e8,       shape: 'droop' },
  // ── Void (cosmic) ──
  void_shard:    { id: 'void_shard',    trunk: 0x1a0e2a, crown: 0x4a3aaa, crownSize: 0.6, accent: 0x9090ff,       shape: 'crystal' },
  rift_obelisk:  { id: 'rift_obelisk',  trunk: 0x2a1f4a, crown: 0x9090ff, crownSize: 1.5, accent: 0xc0c0ff,       shape: 'column' },
};

/** Get a tree variant by id. */
export function getTreeType(id) {
  return TREE_TYPES[id] || TREE_TYPES.oak;
}

/** List all tree ids. */
export function listTreeTypes() {
  return Object.keys(TREE_TYPES);
}

/**
 * Pick a random tree from a list of valid types for a biome.
 * @param {string[]} typeIds — list of tree ids (e.g. from zone.trees)
 * @param {function} [rng] — random function (0..1)
 * @returns {object} tree variant
 */
export function pickTree(typeIds, rng = Math.random) {
  if (!typeIds || !typeIds.length) return TREE_TYPES.oak;
  const id = typeIds[Math.floor(rng() * typeIds.length)];
  return TREE_TYPES[id] || TREE_TYPES.oak;
}

/**
 * Per-biome default tree pool. Each zone's `trees` field in the
 * zone registry can override this.
 */
export const BIOME_TREE_POOLS = {
  verdant: ['oak', 'birch', 'bush'],
  dunes:   ['palm', 'cactus', 'dead_shrub'],
  peaks:   ['pine', 'pine_snow'],
  mire:    ['willow', 'dead_tree', 'glow_mushroom'],
  ember:   ['obsidian', 'ember_bush', 'dead_tree'],
  crystal: ['crystal_cluster', 'cave_moss'],
  sky:     ['cloud_bush', 'floating_shrine'],
  reef:    ['coral', 'kelp', 'sea_anemone'],
  haunted: ['haunted_bush', 'ghost_tree', 'dead_tree'],
  void:    ['void_shard', 'rift_obelisk'],
  default: ['oak'],
};

export function getBiomeTreePool(zoneId) {
  return BIOME_TREE_POOLS[zoneId] || BIOME_TREE_POOLS.default;
}
