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

// Phase 7: derive a 32-bit seed from a Date (or any YYYY-MM-DD string).
// Same date → same seed → same spawn layout.
export function seedFromDate(date) {
  const d = (date instanceof Date) ? date : new Date(date);
  // Combine year/month/day into a single integer; the day-of-year part makes
  // each calendar day unique, year*month provides an extra shuffle.
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  // Julian day of year
  const start = new Date(Date.UTC(y, 0, 0));
  const diff = (d - start) / 86400000;
  return (y * 10000 + Math.floor(diff) * 1000 + m * 13) >>> 0;
}

export function dailySeed() {
  return seedFromDate(new Date());
}

export function dailyIndex() {
  const d = new Date();
  const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 0));
  return Math.floor((d - start) / 86400000);
}
