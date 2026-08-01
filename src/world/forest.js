// world/forest.js — extra tree clusters + fog puffs near the forest area.

import * as THREE from 'three';

export function buildForest(scene, materials, zone = null) {
  // More trees deeper in
  const extras = [[6,28,1.1],[10,32,0.9],[-6,30,1.2],[14,24,1],[18,30,1.1],[-10,32,1]];
  for (const [x, z, s] of extras) {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25 * s, 0.35 * s, 2 * s, 6),
      materials.toon(0x8b5a2b)
    );
    trunk.position.y = 1 * s; trunk.castShadow = true;
    const crown = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.4 * s, 1),
      materials.toon(0x3d8b3d)
    );
    crown.position.y = 2.6 * s; crown.castShadow = true;
    g.add(trunk, crown);
    g.position.set(x, 0, z);
    scene.add(g);
  }

  // Mist planes
  const tex = (() => {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 4, 32, 32, 30);
    g.addColorStop(0, 'rgba(255,255,255,0.6)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.4 });
  for (let i = 0; i < 10; i++) {
    const s = new THREE.Sprite(mat);
    s.position.set(Math.random() * 30 - 6, 1 + Math.random() * 2, 22 + Math.random() * 6);
    s.scale.set(6, 6, 1);
    scene.add(s);
  }
}
