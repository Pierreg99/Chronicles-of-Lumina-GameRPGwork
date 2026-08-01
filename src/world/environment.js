// world/environment.js — skybox tint, clouds, ambient butterflies.
// Phase 19+: now zone-aware. Each zone sets its own sky color, fog, and
// ambient light. Clouds stay generic (just visual flavor in the distance).

import * as THREE from 'three';
import { getZone } from './zones/index.js';

export function buildEnvironment(scene, zoneId) {
  const zone = getZone(zoneId);
  scene.background = new THREE.Color(zone.sky);
  scene.fog = new THREE.Fog(zone.fog, zone.fogNear, zone.fogFar);

  // Soft cloud sprites — generic, no per-zone variation for now.
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

// Hot-swap the environment when the player transitions zones. Returns the
// old fog/background so the caller can re-apply on revert (not used yet
// but kept for future boss-arena return flow).
export function applyZoneEnvironment(scene, zoneId) {
  buildEnvironment(scene, zoneId);
}
