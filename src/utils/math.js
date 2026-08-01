// math.js — generic numeric helpers, no gameplay dependencies.

export const TAU = Math.PI * 2;

export const clamp = (v, min, max) => (v < min ? min : v > max ? max : v);

export const lerp = (a, b, t) => a + (b - a) * t;

export const smoothstep = (edge0, edge1, x) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

export const degToRad = (d) => (d * Math.PI) / 180;
export const radToDeg = (r) => (r * 180) / Math.PI;

export const distance2D = (ax, az, bx, bz) => {
  const dx = ax - bx;
  const dz = az - bz;
  return Math.hypot(dx, dz);
};

export const distance3D = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

export const moveTowards = (current, target, maxDelta) => {
  const diff = target - current;
  if (Math.abs(diff) <= maxDelta) return target;
  return current + Math.sign(diff) * maxDelta;
};

export const angleLerp = (a, b, t) => {
  let diff = ((b - a + Math.PI) % TAU) - Math.PI;
  if (diff < -Math.PI) diff += TAU;
  return a + diff * t;
};

// Returns a value approaching target with exponential smoothing.
export const damp = (current, target, lambda, dt) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));
