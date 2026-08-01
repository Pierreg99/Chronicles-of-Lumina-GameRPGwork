// entities/loot.js — crystal + berry pickups. Crystals advance the quest,
// berries restore HP.

import * as THREE from 'three';

const PICKUP_RANGE = 1.1;

export class LootSystem {
  constructor(scene, materials) {
    this.scene = scene;
    this.materials = materials;
    this.loot = [];
  }

  drop(pos, kind = null) {
    const isCrystal = kind ? kind === 'crystal' : Math.random() < 0.8;
    const geo = isCrystal ? new THREE.OctahedronGeometry(0.22) : new THREE.SphereGeometry(0.16, 8, 8);
    const mat = this.materials.toon(isCrystal ? 0x5ad1ff : 0xd94f4f);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(pos.x, 0.4, pos.z);
    m.castShadow = true;
    this.scene.add(m);
    this.loot.push({ m, type: isCrystal ? 'crystal' : 'berry', t: Math.random() * 6 });
  }

  update(dt, player, onCrystal, onBerry) {
    for (let i = this.loot.length - 1; i >= 0; i--) {
      const l = this.loot[i];
      l.t += dt;
      l.m.rotation.y += dt * 3;
      l.m.position.y = 0.4 + Math.sin(l.t * 3) * 0.1;
      if (l.m.position.distanceTo(player.position) < PICKUP_RANGE) {
        if (l.type === 'crystal') onCrystal && onCrystal();
        else onBerry && onBerry();
        this.scene.remove(l.m);
        this.loot.splice(i, 1);
      }
    }
  }

  clear() {
    for (const l of this.loot) this.scene.remove(l.m);
    this.loot.length = 0;
  }
}
