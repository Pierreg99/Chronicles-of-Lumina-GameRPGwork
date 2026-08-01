// entities/boss-nebelkoloss.js — the Nebel-Koloss (mist colossus).
// Owns its own AI: chase, projectile volley, ground slam, and death.

import * as THREE from 'three';

const HP = 25;
const SPEED = 1.8;
const SHOOT_CD = 2.2;
const SLAM_CD = 6;
const SLAM_RADIUS = 4;
const MELEE_RANGE = 2.2;

export class BossNebelkoloss {
  constructor(scene, materials) {
    this.scene = scene;
    this.materials = materials;
    this.group = new THREE.Group();
    this._build();
    this.position = this.group.position;
    this.hp = HP;
    this.maxHp = HP;
    this.active = false;
    this.dead = false;
    this.shootCd = SHOOT_CD;
    this.slamCd = SLAM_CD;
    this.t = 0;
    this.bossActive = true; // marks as a boss for projectile collision
  }

  _build() {
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(1.6, 16, 14),
      new THREE.MeshToonMaterial({ color: 0x5e2b80, emissive: 0x2a1240 })
    );
    body.scale.y = 0.8; body.position.y = 1.4; body.castShadow = true;
    this.body = body;
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.5, 1),
      new THREE.MeshToonMaterial({ color: 0xb06fd6, emissive: 0x7a3aa0 })
    );
    core.position.y = 1.5; core.name = 'core';
    this.core = core;
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), this.materials.toon(0xff4444));
    eyeL.position.set(-0.5, 2, 1.3);
    const eyeR = eyeL.clone(); eyeR.position.x = 0.5;
    this.group.add(body, core, eyeL, eyeR);
    this.group.position.set(4, 0, 20);
    this.scene.add(this.group);
  }

  spawn() {
    this.active = true;
  }

  damage(n) {
    if (this.dead) return false;
    this.hp -= n;
    if (this.hp <= 0) {
      this.dead = true;
      this.active = false;
      this.scene.remove(this.group);
      return true; // killed
    }
    return false;
  }

  update(dt, player, onShoot) {
    if (!this.active || this.dead) return null;
    this.t += dt;
    this.body.scale.y = 0.8 + Math.sin(this.t * 3) * 0.05;
    this.core.rotation.y += dt * 2;
    this.core.rotation.x += dt;

    const d = this.position.distanceTo(player.position);

    // Chase
    if (d > 3) {
      const dir = new THREE.Vector3().subVectors(player.position, this.position).setY(0).normalize();
      this.position.addScaledVector(dir, SPEED * dt);
      this.group.rotation.y = Math.atan2(dir.x, dir.z);
    }

    // Projectile volley
    this.shootCd -= dt;
    let spawnedShots = false;
    if (this.shootCd <= 0 && d < 16) {
      this.shootCd = SHOOT_CD;
      spawnedShots = true;
    }

    // Ground slam
    this.slamCd -= dt;
    let didSlam = false;
    if (this.slamCd <= 0 && d < 5) {
      this.slamCd = SLAM_CD;
      didSlam = true;
    }

    // Melee
    if (d < MELEE_RANGE) {
      return { melee: true, slam: didSlam, shots: spawnedShots };
    }
    return { melee: false, slam: didSlam, shots: spawnedShots };
  }
}
