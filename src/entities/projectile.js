// entities/projectile.js — pooled purple orb projectiles + slam rings.
//
// Phase 18: object-pooled. Re-uses pre-built meshes for shots and slam rings
// instead of allocating per-fire. Pool size is small (24) — when exceeded,
// we fall back to fresh allocation but still cap the maximum alive.

import * as THREE from 'three';
import { Pool } from '../utils/pool.js';

const SHOT_POOL_SIZE  = 24;
const RING_POOL_SIZE  = 8;
const SHOT_GEO        = new THREE.SphereGeometry(0.18, 8, 8);
const RING_GEO        = new THREE.TorusGeometry(2.5, 0.12, 8, 32);
const MAX_ALIVE_SHOTS = 80; // hard ceiling to prevent runaway after pool exhaustion

export class ProjectileSystem {
  /**
   * @param {THREE.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    /** @type {Array<{m: THREE.Mesh, vel: THREE.Vector3, life: number, boss: boolean}>} */
    this.shots = [];
    /** @type {Array<{m: THREE.Mesh, t: number, maxScale: number}>} */
    this.rings = [];

    this._shotPool = new Pool(
      () => {
        const m = new THREE.Mesh(
          SHOT_GEO,
          new THREE.MeshToonMaterial({ color: 0xb06fd6, emissive: 0x5e2b80 })
        );
        m.visible = false;
        return m;
      },
      (m) => {
        m.visible = true;
        m.position.set(0, -1000, 0); // out of view until placed
      },
      SHOT_POOL_SIZE
    );

    this._ringPool = new Pool(
      () => {
        const m = new THREE.Mesh(
          RING_GEO,
          new THREE.MeshToonMaterial({ color: 0xb06fd6, emissive: 0x5e2b80 })
        );
        m.rotation.x = Math.PI / 2;
        m.visible = false;
        return m;
      },
      (m) => {
        m.visible = true;
        m.position.set(0, -1000, 0);
        m.scale.set(1, 1, 1);
      },
      RING_POOL_SIZE
    );
  }

  /**
   * @param {THREE.Vector3} from
   * @param {THREE.Vector3} dir
   * @param {{speed?: number, life?: number, boss?: boolean}} [opts]
   */
  fire(from, dir, { speed = 6, life = 4, boss = false } = {}) {
    if (this.shots.length >= MAX_ALIVE_SHOTS) return; // safety net
    const m = /** @type {THREE.Mesh} */ (this._shotPool.acquire());
    m.position.copy(from);
    m.position.y = 0.8;
    const mat = /** @type {THREE.MeshToonMaterial} */ (m.material);
    if (boss) {
      mat.color.setHex(0xd06fd6);
      mat.emissive.setHex(0x8e2ba0);
    } else {
      mat.color.setHex(0xb06fd6);
      mat.emissive.setHex(0x5e2b80);
    }
    this.scene.add(m);
    this.shots.push({ m, vel: dir.clone().multiplyScalar(speed), life, boss });
  }

  /**
   * Boss 3-shot spread.
   * @param {THREE.Vector3} from
   * @param {THREE.Vector3} targetPos
   * @param {number} [count=3]
   * @param {number} [spread=0.3]
   */
  fireFan(from, targetPos, count = 3, spread = 0.3) {
    const baseDir = new THREE.Vector3().subVectors(targetPos, from).setY(0).normalize();
    for (let i = -1; i <= 1; i++) {
      const d = baseDir.clone();
      d.applyAxisAngle(new THREE.Vector3(0, 1, 0), i * spread);
      this.fire(from, d, { speed: 8, boss: true });
    }
  }

  /**
   * @param {THREE.Vector3} pos
   */
  spawnSlamRing(pos) {
    const m = /** @type {THREE.Mesh} */ (this._ringPool.acquire());
    m.position.copy(pos);
    m.position.y = 0.15;
    this.scene.add(m);
    this.rings.push({ m, t: 0, maxScale: 5 });
  }

  /**
   * @param {number} dt
   * @param {{position: THREE.Vector3}} player
   * @param {(pos: THREE.Vector3) => void} [onPlayerHit]
   */
  update(dt, player, onPlayerHit) {
    for (let i = this.shots.length - 1; i >= 0; i--) {
      const s = this.shots[i];
      s.m.position.addScaledVector(s.vel, dt);
      s.life -= dt;
      if (s.m.position.distanceTo(player.position) < 0.8) {
        onPlayerHit && onPlayerHit(s.m.position);
        this._recycleShot(i);
        continue;
      }
      if (s.life <= 0) {
        this._recycleShot(i);
      }
    }
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.t += dt;
      const s = 1 + r.t * 4;
      r.m.scale.set(s, s, 1);
      if (r.t > 1) {
        this._recycleRing(i);
      }
    }
  }

  /** @private */
  _recycleShot(i) {
    const s = this.shots[i];
    this.scene.remove(s.m);
    s.m.visible = false;
    this._shotPool.release(s.m);
    this.shots.splice(i, 1);
  }

  /** @private */
  _recycleRing(i) {
    const r = this.rings[i];
    this.scene.remove(r.m);
    r.m.visible = false;
    this._ringPool.release(r.m);
    this.rings.splice(i, 1);
  }

  clear() {
    for (const s of this.shots) {
      this.scene.remove(s.m);
      s.m.visible = false;
      this._shotPool.release(s.m);
    }
    this.shots.length = 0;
    for (const r of this.rings) {
      this.scene.remove(r.m);
      r.m.visible = false;
      this._ringPool.release(r.m);
    }
    this.rings.length = 0;
  }

  /** Diagnostic: how many are currently active. */
  get activeShotCount() { return this.shots.length; }
  get activeRingCount() { return this.rings.length; }
}
