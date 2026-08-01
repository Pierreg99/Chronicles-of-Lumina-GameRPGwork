// random.js — seeded RNG + helpers. Uses Mulberry32 for determinism.

export function makeRng(seed = 1) {
  let s = seed >>> 0;
  return function rand() {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const randRange = (rng, min, max) => min + rng() * (max - min);
export const randInt = (rng, min, max) => Math.floor(randRange(rng, min, max + 1));
export const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

export const chance = (rng, p) => rng() < p;
