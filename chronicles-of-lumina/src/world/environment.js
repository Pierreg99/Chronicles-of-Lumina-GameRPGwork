// world/environment.js — skybox tint, clouds, ambient butterflies.

import * as THREE from 'three';

export function buildEnvironment(scene) {
  // Soft sky tint handled by scene.background; add a few cloud sprites.
  const tex = (() => {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(64, 32, 4, 64, 32, 60);
    g.addColorStop(0, 'rgba(255,255,255,0.9)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 64);
    return new THREE.CanvasTexture(c);
  })();
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.7 });
  for (let i = 0; i < 8; i++) {
    const s = new THREE.Sprite(mat);
    s.position.set(Math.random() * 100 - 50, 25 + Math.random() * 8, Math.random() * 100 - 50);
    s.scale.set(10, 5, 1);
    scene.add(s);
  }
}
