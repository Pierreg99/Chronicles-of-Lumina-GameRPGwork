// world/terrain.js — ground plane + path. Phase 19+: zone-aware colors.

import * as THREE from 'three';
import { getZone } from './zones/index.js';

export function buildTerrain(scene, materials, zoneId = 'verdant') {
  const zone = getZone(zoneId);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 120, 40, 40),
    materials.toon(zone.ground)
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;

  // Add gentle vertex noise away from the village hub
  const p = ground.geometry.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    const d = Math.hypot(x, y);
    if (d > 15) p.setZ(i, Math.sin(x * 0.15) * Math.cos(y * 0.15) * 1.2 * (d / 60));
  }
  ground.geometry.computeVertexNormals();
  scene.add(ground);

  // Path strip from hub toward the boss/shrine
  const path = new THREE.Mesh(new THREE.PlaneGeometry(3, 32), materials.toon(zone.path));
  path.rotation.x = -Math.PI / 2;
  path.position.set(2, 0.02, 10);
  scene.add(path);

  return { ground, path };
}
