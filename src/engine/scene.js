// engine/scene.js — Three.js scene + fog + background.

import * as THREE from 'three';

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87c5e8);
  scene.fog = new THREE.Fog(0x87c5e8, 40, 90);
  return scene;
}
