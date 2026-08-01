// entities/projectile.js — pooled purple orb projectiles + slam rings.

import * as THREE from 'three';

export class ProjectileSystem {
  constructor(scene) {
    this.scene = scene;
    this.shots = [];
    this.rings = [];
  }

  fire(from, dir, { speed = 6, life = 4, boss = false } = {}) {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 8, 8),
      new THREE.MeshToonMaterial({
        color: boss ? 0xd06fd6 : 0xb06fd6,
        emissive: boss ? 0x8e2ba0 : 0x5e2b80,
      })
    );
    m.position.copy(from);
    m.position.y = 0.8;
    this.scene.add(m);
    this.shots.push({ m, vel: dir.clone().multiplyScalar(speed), life, boss });
  }

  // Boss 3-shot spread
  fireFan(from, targetPos, count = 3, spread = 0.3) {
    const baseDir = new THREE.Vector3().subVectors(targetPos, from).setY(0).normalize();
    for (let i = -1; i <= 1; i++) {
      const d = baseDir.clone();
      d.applyAxisAngle(new THREE.Vector3(0, 1, 0), i * spread);
      this.fire(from, d, { speed: 8, boss: true });
    }
  }

  spawnSlamRing(pos) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.5, 0.12, 8, 32),
      new THREE.MeshToonMaterial({ color: 0xb06fd6, emissive: 0x5e2b80 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.copy(pos);
    ring.position.y = 0.15;
    this.scene.add(ring);
    this.rings.push({ m: ring, t: 0 });
  }

  update(dt, player, onPlayerHit) {
    for (let i = this.shots.length - 1; i >= 0; i--) {
      const s = this.shots[i];
      s.m.position.addScaledVector(s.vel, dt);
      s.life -= dt;
      if (s.m.position.distanceTo(player.position) < 0.8) {
        onPlayerHit && onPlayerHit(s.m.position);
        this.scene.remove(s.m);
        this.shots.splice(i, 1);
        continue;
      }
      if (s.life <= 0) {
        this.scene.remove(s.m);
        this.shots.splice(i, 1);
      }
    }
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.t += dt;
      const s = 1 + r.t * 4;
      r.m.scale.set(s, s, 1);
      if (r.t > 1) {
        this.scene.remove(r.m);
        this.rings.splice(i, 1);
      }
    }
  }

  clear() {
    for (const s of this.shots) this.scene.remove(s.m);
    this.shots.length = 0;
    for (const r of this.rings) this.scene.remove(r.m);
    this.rings.length = 0;
  }
}
