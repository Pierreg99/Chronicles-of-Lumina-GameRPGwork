// utils/era-enemies.js — era-specific enemy stats.
// Each era re-balances the same slime family: different hp / speed /
// number spawned per wave. CryoGameDesign A27 balancing table.

import { ERAS, currentEra } from '../core/era.js';

const ERA_ENEMIES = Object.freeze({
  [ERAS.EIGHT_BIT]: {
    spawnCap: 8,             // many weak enemies
    perSpawn: 4,             // spawn 4 at a time
    slimes: [
      { id: 'slime_block_8', col: 0x00aaff, hp: 1, speed: 1.2, r: 0.5, ranged: false, jumpy: false, name: 'Block-Schleim 8-Bit' },
      { id: 'slime_blob_8',  col: 0x55ff55, hp: 1, speed: 1.6, r: 0.5, ranged: false, jumpy: false, name: 'Blob-Schleim 8-Bit' },
    ],
    scoreMult: 0.5,          // low score per kill
  },
  [ERAS.SIXTEEN_BIT]: {
    spawnCap: 5,
    perSpawn: 2,
    slimes: [
      { id: 'slime_pixel_16',  col: 0x3a7bd5, hp: 3, speed: 2.4, r: 0.6, ranged: false, jumpy: true,  name: 'Pixel-Schleim 16-Bit' },
      { id: 'slime_arrow_16',  col: 0x8e44ad, hp: 4, speed: 1.8, r: 0.55, ranged: true,  jumpy: false, name: 'Pfeil-Schleim 16-Bit' },
    ],
    scoreMult: 1.0,
  },
  [ERAS.THREE_D]: {
    spawnCap: 3,
    perSpawn: 1,
    slimes: [
      { id: 'slime_magic_3d',  col: 0x9b59b6, hp: 6, speed: 3.0, r: 0.65, ranged: true,  jumpy: true, name: 'Magie-Schleim 3D' },
      { id: 'slime_tank_3d',   col: 0xc0392b, hp: 12, speed: 1.4, r: 0.8,  ranged: false, jumpy: false, name: 'Tank-Schleim 3D' },
    ],
    scoreMult: 2.0,
  },
});

/** @returns {object} the era's enemy config */
export function currentEraEnemies() { return ERA_ENEMIES[currentEra()]; }

/** @returns {number} max concurrent enemies in this era */
export function eraSpawnCap() { return currentEraEnemies().spawnCap; }

/** @returns {number} enemies to spawn per wave */
export function eraPerSpawn() { return currentEraEnemies().perSpawn; }

/** @returns {Array} the era's slime variants */
export function eraSlimeList() { return currentEraEnemies().slimes; }

/** @returns {object|null} a random slime from the era, or null if none defined */
export function randomEraSlime() {
  const list = eraSlimeList();
  if (!list || list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)];
}
