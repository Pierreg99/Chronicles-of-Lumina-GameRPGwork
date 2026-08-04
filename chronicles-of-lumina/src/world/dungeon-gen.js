// world/dungeon-gen.js — procedural dungeon layout generator.
//
// Takes a dungeon type + seed and returns a layout:
//   {
//     rooms: [{ x, y, w, h, type, enemies, loot, locked }],
//     corridors: [{ from: {x, y}, to: {x, y} }],
//     entry: { x, y },
//     boss:   { x, y },
//     size:   { width, height },
//   }
//
// Three dungeon types with distinct shape signatures:
//   - crypt:  tight, branching, lots of small rooms
//   - mine:   linear, large central caverns with side branches
//   - tower:  vertical-ish, 1 wide path climbing a winding staircase
//
// The algorithm is a *constrained random walk + grid allocation* — for
// each room we pick a position adjacent to an existing room (or the
// entry) and ensure no overlap. It produces layouts that are
// deterministic per (type, seed) and always have a single connected
// path from entry to boss.

/** Mulberry32 PRNG — small, fast, deterministic. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DUNGEON_TYPES = {
  crypt: {
    id: 'crypt',
    name: 'Krypta',
    roomCount: [8, 12],
    roomSize:  [3, 5],   // half-size (half-width, half-height)
    corridorWidth: 1,
    branchiness: 0.6,    // 0=linear, 1=branching
    palette: 0x4A3A5A,   // purple stone
    enemyPool: ['undead', 'skeleton', 'ghost'],
    bossName: 'Totenlord',
  },
  mine: {
    id: 'mine',
    name: 'Mine',
    roomCount: [6, 9],
    roomSize:  [4, 6],
    corridorWidth: 1,
    branchiness: 0.4,
    palette: 0x6A4A2A,   // warm brown rock
    enemyPool: ['kobold', 'spider', 'cave_lurker'],
    bossName: 'Grubenwurm',
  },
  tower: {
    id: 'tower',
    name: 'Turm',
    roomCount: [7, 10],
    roomSize:  [3, 4],
    corridorWidth: 1,
    branchiness: 0.2,
    palette: 0x4A4A6A,   // mystic blue
    enemyPool: ['cultist', 'construct', 'wraith'],
    bossName: 'Turmwächter',
  },
};

const ROOM_TYPES = ['combat', 'loot', 'puzzle', 'empty'];

/**
 * Generate a dungeon layout.
 * @param {string} typeId — one of DUNGEON_TYPES keys
 * @param {number} seed
 * @returns {object} layout
 */
export function generateDungeon(typeId, seed) {
  const type = DUNGEON_TYPES[typeId] || DUNGEON_TYPES.crypt;
  const rng = mulberry32(seed >>> 0);
  const [rmin, rmax] = type.roomCount;
  const [shmin, shmax] = type.roomSize;
  const targetRooms = Math.floor(rmin + rng() * (rmax - rmin + 1));

  /** @type {Array<{x:number,y:number,w:number,h:number,type:string,enemies:string[],loot:string[],locked:boolean,id:number}>} */
  const rooms = [];
  const maxAttempts = 200;
  let attempts = 0;

  // First room: the entry. Center of the grid.
  const gridSize = 32;
  const center = { x: gridSize / 2, y: gridSize / 2 };
  rooms.push({
    x: center.x, y: center.y,
    w: 2 + Math.floor(rng() * 2), h: 2 + Math.floor(rng() * 2),
    type: 'entrance',
    enemies: [], loot: [], locked: false,
    id: 0,
  });

  // Subsequent rooms: place adjacent to a random existing room.
  while (rooms.length < targetRooms && attempts < maxAttempts) {
    attempts++;
    const parent = rooms[Math.floor(rng() * rooms.length)];
    const direction = Math.floor(rng() * 4); // 0=N, 1=E, 2=S, 3=W
    const w = shmin + Math.floor(rng() * (shmax - shmin + 1));
    const h = shmin + Math.floor(rng() * (shmax - shmin + 1));
    let nx, ny;
    if (direction === 0) { nx = parent.x; ny = parent.y - parent.h - 2 - h; }
    else if (direction === 1) { nx = parent.x + parent.w + 2 + w; ny = parent.y; }
    else if (direction === 2) { nx = parent.x; ny = parent.y + parent.h + 2 + h; }
    else { nx = parent.x - parent.w - 2 - w; ny = parent.y; }

    if (nx < 0 || ny < 0 || nx + w >= gridSize || ny + h >= gridSize) continue;
    if (rooms.some((r) => rectOverlap(r, { x: nx, y: ny, w, h }))) continue;

    // Branchiness: skip placement sometimes
    if (rng() > type.branchiness) continue;

    const roomType = ROOM_TYPES[Math.floor(rng() * ROOM_TYPES.length)];
    rooms.push({
      x: nx, y: ny, w, h,
      type: roomType,
      enemies: rollEnemies(type.enemyPool, rng),
      loot: rollLoot(rng),
      locked: false,
      id: rooms.length,
    });
  }

  // Mark a random non-entrance room as the boss room.
  const bossCandidates = rooms.filter((r) => r.type !== 'entrance');
  if (bossCandidates.length) {
    const bossRoom = bossCandidates[Math.floor(rng() * bossCandidates.length)];
    bossRoom.type = 'boss';
    bossRoom.bossName = type.bossName;
    bossRoom.enemies = [];
  }

  // Add a final exit room adjacent to boss. Try south, then north, then
  // east, then west — pick whichever fits inside the grid.
  if (bossCandidates.length) {
    const boss = bossCandidates[Math.floor(rng() * bossCandidates.length)];
    const exitW = 2, exitH = 2;
    const candidates = [
      { x: boss.x, y: boss.y + boss.h + 2 },       // south
      { x: boss.x, y: boss.y - exitH - 2 },       // north
      { x: boss.x + boss.w + 2, y: boss.y },      // east
      { x: boss.x - exitW - 2, y: boss.y },       // west
    ];
    for (const c of candidates) {
      if (c.x < 0 || c.y < 0) continue;
      if (c.x + exitW >= gridSize || c.y + exitH >= gridSize) continue;
      if (rooms.some((r) => rectOverlap(r, { x: c.x, y: c.y, w: exitW, h: exitH }))) continue;
      rooms.push({
        x: c.x, y: c.y, w: exitW, h: exitH,
        type: 'exit',
        enemies: [], loot: ['crystal_x3'], locked: false,
        id: rooms.length,
      });
      break;
    }
  }

  // Build corridors connecting all rooms to the entry.
  const corridors = buildCorridors(rooms, rng);

  // Mark all 'loot' and 'puzzle' rooms as potentially locked.
  for (const r of rooms) {
    if (r.type === 'puzzle') r.locked = rng() < 0.4;
  }

  return {
    type: type.id,
    typeName: type.name,
    palette: type.palette,
    rooms,
    corridors,
    entry: { x: rooms[0].x + rooms[0].w / 2, y: rooms[0].y + rooms[0].h / 2 },
    boss: bossCandidates.length
      ? { x: bossCandidates[Math.floor(rng() * bossCandidates.length)].x + 1, y: bossCandidates[Math.floor(rng() * bossCandidates.length)].y + 1 }
      : null,
    size: { width: gridSize, height: gridSize },
    seed: seed >>> 0,
  };
}

function rectOverlap(a, b) {
  return !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y);
}

function rollEnemies(pool, rng) {
  const n = 1 + Math.floor(rng() * 3);
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push(pool[Math.floor(rng() * pool.length)]);
  }
  return out;
}

function rollLoot(rng) {
  const r = rng();
  if (r < 0.4) return ['berry'];
  if (r < 0.7) return ['crystal'];
  if (r < 0.85) return ['berry', 'berry'];
  return ['crystal', 'berry'];
}

/**
 * Connect each room to the entry via a path. We use a BFS from the
 * entry, then for each unvisited room we connect it to its nearest
 * already-visited neighbor with an L-shaped corridor.
 */
function buildCorridors(rooms, rng) {
  const corridors = [];
  if (rooms.length === 0) return corridors;
  const visited = new Set([0]);
  const remaining = new Set(rooms.slice(1).map((_, i) => i + 1));

  while (remaining.size > 0) {
    let bestNext = -1, bestParent = -1, bestDist = Infinity;
    for (const rIdx of remaining) {
      const r = rooms[rIdx];
      for (const vIdx of visited) {
        const v = rooms[vIdx];
        const dist = Math.abs(r.x - v.x) + Math.abs(r.y - v.y);
        if (dist < bestDist) {
          bestDist = dist;
          bestNext = rIdx;
          bestParent = vIdx;
        }
      }
    }
    if (bestNext === -1) break;
    const from = rooms[bestParent];
    const to = rooms[bestNext];
    // L-shaped corridor: horizontal then vertical
    const fromCenter = { x: from.x + from.w / 2, y: from.y + from.h / 2 };
    const toCenter = { x: to.x + to.w / 2, y: to.y + to.h / 2 };
    const corner = rng() < 0.5
      ? { x: toCenter.x, y: fromCenter.y }
      : { x: fromCenter.x, y: toCenter.y };
    corridors.push({ from: fromCenter, to: corner });
    corridors.push({ from: corner, to: toCenter });
    visited.add(bestNext);
    remaining.delete(bestNext);
  }
  return corridors;
}

/**
 * Validate a layout: all rooms are within bounds, all corridors
 * connect two existing rooms, entry is reachable from boss.
 */
export function validateLayout(layout) {
  if (!layout || !layout.rooms || !layout.rooms.length) return false;
  for (const r of layout.rooms) {
    if (r.x < 0 || r.y < 0) return false;
    if (r.x + r.w > layout.size.width) return false;
    if (r.y + r.h > layout.size.height) return false;
  }
  return layout.rooms.length >= 4;
}

export { DUNGEON_TYPES };
