// world/props.js — small props: signs, flower beds.

import * as THREE from 'three';

export function buildProps(scene, materials) {
  // Welcome sign on the path
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 0.1), materials.toon(0x5a3a1a));
  post.position.set(-2, 0.7, 8);
  scene.add(post);
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 0.1), materials.toon(0xc8a877));
  board.position.set(-2, 1.3, 8);
  scene.add(board);

  // Decorative flower beds near houses
  const colors = [0xff6fb1, 0xffd23f, 0x7ad7ff, 0xa4ff7a];
  for (let i = 0; i < 14; i++) {
    const f = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 6, 5),
      new THREE.MeshBasicMaterial({ color: colors[i % colors.length] })
    );
    f.position.set(Math.random() * 14 - 12, 0.12, Math.random() * 8 - 4);
    scene.add(f);
  }
}
