// uv_helper.js — UV mapping for the real texture_atlas.png.
// Atlas: 512x512, 4x4 grid (128px per cell).
// Layout matches assets/texture_atlas.json.
//
// Returns an 8-vertex UV array [u0,v0, u1,v0, u1,v1, u0,v1] for a 1x1 PlaneGeometry.

const ATLAS_SIZE = 512;
const CELL = 128;

const LAYOUT = {
  grass_tile:           { x: 0, y: 0 },
  path_tile:            { x: 1, y: 0 },
  water_tile:           { x: 2, y: 0 },
  rock:                 { x: 3, y: 0 },
  tree:                 { x: 0, y: 1 },
  house:                { x: 1, y: 1 },
  shrine:               { x: 2, y: 1 },
  minimap:              { x: 3, y: 1 },
  heart_full:           { x: 0, y: 2 },
  heart_empty:          { x: 1, y: 2 },
  crystal:              { x: 2, y: 2 },
  berry:                { x: 3, y: 2 },
  slime_blue_icon:      { x: 0, y: 3 },
  slime_green_icon:     { x: 1, y: 3 },
  slime_purple_icon:    { x: 2, y: 3 },
  slime_blue_portrait:  { x: 3, y: 3 },
};

export function getUVForAsset(name) {
  const cfg = LAYOUT[name];
  if (!cfg) {
    console.warn(`[uv_helper] unknown asset: ${name}`);
    return [0, 0, 0.25, 0, 0.25, 0.25, 0, 0.25];
  }
  const u0 = (cfg.x * CELL) / ATLAS_SIZE;
  const v0 = (cfg.y * CELL) / ATLAS_SIZE;
  const u1 = ((cfg.x + 1) * CELL) / ATLAS_SIZE;
  const v1 = ((cfg.y + 1) * CELL) / ATLAS_SIZE;
  return [
    u0, v0,
    u1, v0,
    u1, v1,
    u0, v1,
  ];
}

export function getAtlasMeta() {
  return { size: ATLAS_SIZE, cell: CELL, layout: { ...LAYOUT } };
}
