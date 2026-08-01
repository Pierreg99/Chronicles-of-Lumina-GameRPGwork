// world/terrain.js — ground plane + path.

import * as THREE from 'three';

export function buildTerrain(scene, materials) {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 120, 40, 40),
    materials.toon(0x6ab04c)
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;

  // Add gentle vertex noise away from the village
  const p = ground.geometry.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    const d = Math.hypot(x, y);
    if (d > 15) p.setZ(i, Math.sin(x * 0.15) * Math.cos(y * 0.15) * 1.2 * (d / 60));
  }
  ground.geometry.computeVertexNormals();
  scene.add(ground);

  // Path strip from village toward shrine
  const path = new THREE.Mesh(new THREE.PlaneGeometry(3, 32), materials.toon(0xd9c79a));
  path.rotation.x = -Math.PI / 2;
  path.position.set(2, 0.02, 10);
  scene.add(path);

  return { ground, path };
}
