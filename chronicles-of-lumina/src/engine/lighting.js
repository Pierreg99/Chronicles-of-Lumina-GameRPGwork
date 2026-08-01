// engine/lighting.js — sun + hemisphere lighting + shadow config.

import * as THREE from 'three';

export function createLighting(scene) {
  const hemi = new THREE.HemisphereLight(0xffffff, 0x5a7d4a, 0.9);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff4e0, 1.1);
  sun.position.set(20, 30, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -40;
  sun.shadow.camera.right = 40;
  sun.shadow.camera.top = 40;
  sun.shadow.camera.bottom = -40;
  scene.add(sun);

  return { hemi, sun };
}
