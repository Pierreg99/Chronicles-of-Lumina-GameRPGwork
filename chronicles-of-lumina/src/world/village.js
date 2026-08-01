// world/village.js — houses, well, fence, mushrooms, flowers.

import * as THREE from 'three';

function tree(scene, materials, x, z, s = 1) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25 * s, 0.35 * s, 2 * s, 6),
    materials.toon(0x8b5a2b)
  );
  trunk.position.y = 1 * s;
  trunk.castShadow = true;
  const crown = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.4 * s, 1),
    materials.toon(0x3d8b3d)
  );
  crown.position.y = 2.6 * s;
  crown.castShadow = true;
  g.add(trunk, crown);
  g.position.set(x, 0, z);
  scene.add(g);
}

function house(scene, materials, x, z, ry = 0) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(4, 2.8, 3.6), materials.toon(0xe8d5b0));
  body.position.y = 1.4;
  body.castShadow = true;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.8, 4), materials.toon(0xc0392b));
  roof.position.y = 3.7;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 0.1), materials.toon(0x6e4a2f));
  door.position.set(0, 0.7, 1.85);
  g.add(body, roof, door);
  g.position.set(x, 0, z);
  g.rotation.y = ry;
  scene.add(g);
}

function well(scene, materials) {
  const g = new THREE.Group();
  const w = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.1, 1, 8), materials.toon(0x9aa0a6));
  w.position.y = 0.5; w.castShadow = true;
  const r = new THREE.Mesh(new THREE.ConeGeometry(1.4, 0.8, 4), materials.toon(0xc0392b));
  r.position.y = 1.8; r.rotation.y = Math.PI / 4;
  g.add(w, r);
  g.position.set(0, 0, -2);
  scene.add(g);
  return g;
}

export function buildVillage(scene, materials) {
  // Trees scattered around the map
  const trees = [[-14,-8,1.2],[-18,4,1],[12,-14,1.3],[16,6,1],[22,-2,0.9],
                 [-8,16,1.1],[8,20,1],[-24,-16,1],[26,14,1.2]];
  trees.forEach(([x, z, s]) => tree(scene, materials, x, z, s));

  // Houses
  house(scene, materials, -6, -6, 0.3);
  house(scene, materials,  6, -7, -0.2);
  house(scene, materials, -11, -3, 0.8);

  // Well (player respawn point)
  const w = well(scene, materials);

  // Fence ring
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const r = 1.6;
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.6, 0.08),
      materials.toon(0x7a4a2a)
    );
    post.position.set(Math.cos(a) * r, 0.3, -2 + Math.sin(a) * r);
    scene.add(post);
  }

  // Mushrooms around well
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const x = Math.cos(a) * 1.4;
    const z = -2 + Math.sin(a) * 1.4;
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.18, 6),
      materials.toon(0xfff0c2)
    );
    stem.position.set(x, 0.09, z);
    scene.add(stem);
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 6),
      materials.toon(0xe74c3c)
    );
    cap.position.set(x, 0.22, z);
    scene.add(cap);
  }

  return { well, respawn: new THREE.Vector3(0, 0, 2) };
}
