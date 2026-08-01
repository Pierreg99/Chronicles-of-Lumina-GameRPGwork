// world/shrine.js — the corrupted shrine at the end of the path.

import * as THREE from 'three';

export const SHRINE_POS = new THREE.Vector3(4, 0, 26);

export function buildShrine(scene, materials) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(2.2, 2.6, 1, 8),
    materials.toon(0x8f9aa8)
  );
  base.position.y = 0.5; base.castShadow = true;
  const pillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.8, 3, 8),
    materials.toon(0xb8c4d4)
  );
  pillar.position.y = 2.5; pillar.castShadow = true;
  const orb = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.7, 1),
    new THREE.MeshToonMaterial({ color: 0x7a4fb3, emissive: 0x4a2b73 })
  );
  orb.position.y = 4.6; orb.name = 'shrineOrb';
  g.add(base, pillar, orb);
  g.position.copy(SHRINE_POS);
  scene.add(g);

  return { group: g, orb, position: SHRINE_POS };
}
