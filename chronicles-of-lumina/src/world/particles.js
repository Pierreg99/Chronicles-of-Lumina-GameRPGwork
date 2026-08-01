// world/particles.js — pooled point particles. Owns its own geometry.

import * as THREE from 'three';

const PMAX = 120;

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.geo = new THREE.BufferGeometry();
    this.positions = new Float32Array(PMAX * 3);
    this.colors = new Float32Array(PMAX * 3);
    this.geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geo.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    this.points = new THREE.Points(this.geo, new THREE.PointsMaterial({
      size: 0.3, vertexColors: true, transparent: true, opacity: 0.9,
    }));
    this.points.frustumCulled = false;
    scene.add(this.points);

    this.particles = [];
    for (let i = 0; i < PMAX; i++) {
      this.particles.push({ life: 0, vel: new THREE.Vector3(), col: new THREE.Color() });
    }
  }

  burst(pos, color, n = 12) {
    let count = 0;
    const c = new THREE.Color(color);
    for (const p of this.particles) {
      if (p.life <= 0) {
        p.life = 0.6 + Math.random() * 0.4;
        this.geo.attributes.position.setXYZ(this.particles.indexOf(p), pos.x, pos.y + 0.5, pos.z);
        p.col.copy(c);
        p.vel.set((Math.random() - 0.5) * 4, Math.random() * 4, (Math.random() - 0.5) * 4);
        if (++count >= n) break;
      }
    }
  }

  update(dt) {
    const pa = this.geo.attributes.position;
    const pc = this.geo.attributes.color;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (p.life > 0) {
        p.life -= dt;
        pa.setXYZ(i, pa.getX(i) + p.vel.x * dt, Math.max(0, pa.getY(i) + p.vel.y * dt), pa.getZ(i) + p.vel.z * dt);
        p.vel.y -= 8 * dt;
        pc.setXYZ(i, p.col.r, p.col.g, p.col.b);
      } else {
        pc.setXYZ(i, 0, 0, 0);
      }
    }
    pa.needsUpdate = true;
    pc.needsUpdate = true;
  }
}
