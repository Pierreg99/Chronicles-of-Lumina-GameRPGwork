// entities/enemy-base.js — shared logic for all enemy types. Subclasses set
// `spec` to differentiate behavior (speed, hp, ranged, jumpy, etc.).

import * as THREE from 'three';

const SLIME_TYPES = [
  { id: 'slime_blue',   col: 0x3a7bd5, hp: 2, speed: 2.2, r: 0.55, ranged: false, jumpy: false, name: 'Wiesen-Schleim' },
  { id: 'slime_green',  col: 0x4caf50, hp: 3, speed: 3.2, r: 0.65, ranged: false, jumpy: true,  name: 'Blatt-Schleim'  },
  { id: 'slime_purple', col: 0x8e44ad, hp: 3, speed: 1.6, r: 0.6,  ranged: true,  jumpy: false, name: 'Nebel-Schleim'  },
];

export function getSlimeSpec(idx) { return SLIMES[idx] || SLIMES[0]; }
const SLIMES = SLIME_TYPES;

export class Enemy {
  constructor(scene, materials, typeIdx, x, z) {
    this.scene = scene;
    this.materials = materials;
    this.spec = SLIMES[typeIdx];
    this.typeIdx = typeIdx;
    this.group = new THREE.Group();
    this._build();
    this.group.position.set(x, 0, z);
    scene.add(this.group);

    this.position = this.group.position;
    this.hp = this.spec.hp;
    this.maxHp = this.spec.hp;
    this.t = Math.random() * 2;
    this.kb = new THREE.Vector3();
    this.shootCd = 2;
    this.dead = false;
    this.id = `${this.spec.id}_${Math.floor(Math.random() * 1e6)}`;

    this._buildBar();
  }

  _build() {
    const s = this.spec;
    const body = new THREE.Mesh(new THREE.SphereGeometry(s.r, 12, 10), this.materials.toon(s.col));
    body.scale.y = 0.85; body.position.y = s.r * 0.85; body.castShadow = true;
    this.body = body;
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), this.materials.toon(0xffffff));
    eyeL.position.set(-0.18, s.r * 1.2, s.r * 0.75);
    const eyeR = eyeL.clone(); eyeR.position.x = 0.18;
    const pupL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 4, 4), this.materials.toon(0x222222));
    pupL.position.set(-0.18, s.r * 1.2, s.r * 0.9);
    const pupR = pupL.clone(); pupR.position.x = 0.18;
    this.group.add(body, eyeL, eyeR, pupL, pupR);
  }

  _buildBar() {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 8;
    this.barCanvas = c;
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(c),
      depthTest: false,
    }));
    spr.scale.set(1.4, 0.18, 1);
    spr.position.y = this.spec.r * 2.2;
    this.barSprite = spr;
    this.group.add(spr);
    this._drawBar();
  }

  _drawBar() {
    const x = this.barCanvas.getContext('2d');
    x.clearRect(0, 0, 64, 8);
    x.fillStyle = '#3a3f45'; x.fillRect(0, 0, 64, 8);
    x.fillStyle = '#2f7bff'; x.fillRect(1, 1, 62 * (this.hp / this.maxHp), 6);
    this.barSprite.material.map.needsUpdate = true;
  }

  damage(n) {
    if (this.dead) return false;
    this.hp -= n;
    this._drawBar();
    return this.hp <= 0;
  }

  update(dt, player, onShoot) {
    if (this.dead) return;
    this.t += dt;
    this.body.scale.y = 0.85 + Math.sin(this.t * 6) * 0.06;

    if (this.kb.lengthSq() > 0.1) {
      this.position.addScaledVector(this.kb, dt);
      this.kb.multiplyScalar(0.85);
      return;
    }

    const d = this.position.distanceTo(player.position);
    if (d < 14 && d > 1.4) {
      const dir = new THREE.Vector3().subVectors(player.position, this.position).setY(0).normalize();
      let sp = this.spec.speed;
      if (this.spec.jumpy && Math.floor(this.t * 2) % 2 === 0) sp *= 1.8;
      this.position.addScaledVector(dir, sp * dt);
      this.group.rotation.y = Math.atan2(dir.x, dir.z);
    }
    if (this.spec.ranged && d < 12) {
      this.shootCd -= dt;
      if (this.shootCd <= 0) {
        this.shootCd = 2.5;
        const dir = new THREE.Vector3().subVectors(player.position, this.position).setY(0).normalize();
        onShoot && onShoot(this.position, dir);
      }
    }
  }
}
