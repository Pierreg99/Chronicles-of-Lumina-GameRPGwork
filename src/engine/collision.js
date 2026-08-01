// engine/collision.js — world bounds + static obstacle list.

import { distance2D } from '../utils/math.js';

export class Collision {
  constructor(worldHalf = 38) {
    this.worldHalf = worldHalf;
    this.static = [];
  }

  addStatic(x, z, r) {
    this.static.push({ x, z, r });
  }

  // Clamp a point inside the world AABB.
  clampToWorld(x, z) {
    return {
      x: Math.max(-this.worldHalf, Math.min(this.worldHalf, x)),
      z: Math.max(-this.worldHalf, Math.min(this.worldHalf, z)),
    };
  }

  // Resolve a movement with sliding along static obstacles.
  resolveMove(x, z, dx, dz, r) {
    let nx = x + dx, nz = z + dz;
    if (this._free(nx, nz, r)) return { x: nx, z: nz };
    if (this._free(nx, z, r))  return { x: nx, z };
    if (this._free(x, nz, r))  return { x, z: nz };
    return { x, z };
  }

  _free(x, z, r) {
    for (const s of this.static) {
      if (distance2D(x, z, s.x, s.z) < r + s.r) return false;
    }
    return true;
  }
}
