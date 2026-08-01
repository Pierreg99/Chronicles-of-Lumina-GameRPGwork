// engine/camera.js — third-person follow camera driven by yaw + dt.

import * as THREE from 'three';

const FOV = 55;
const NEAR = 0.1;
const FAR = 200;
const DISTANCE = 8;
const HEIGHT = 6;
const FOLLOW_LERP = 0.08;

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, NEAR, FAR);
  camera.position.set(0, HEIGHT, DISTANCE);
  const _target = new THREE.Vector3();
  const _desired = new THREE.Vector3();
  return {
    camera,
    yaw: 0,
    setAspect(a) {
      camera.aspect = a;
      camera.updateProjectionMatrix();
    },
    update(dt, target) {
      const cx = target.x - Math.sin(this.yaw) * DISTANCE;
      const cz = target.z - Math.cos(this.yaw) * DISTANCE;
      _desired.set(cx, HEIGHT, cz);
      camera.position.lerp(_desired, FOLLOW_LERP);
      _target.set(target.x, 1.5, target.z);
      camera.lookAt(_target);
    },
  };
}
