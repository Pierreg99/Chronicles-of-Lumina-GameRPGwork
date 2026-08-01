// engine/camera.js — third-person follow camera with:
//   - velocity-based lag (heavier feel when player sprints/dodges)
//   - additive kick impulse that decays over time
//   - yaw controlled by input

import * as THREE from 'three';
import { Tween, tween } from '../utils/tween.js';

const FOV = 55;
const NEAR = 0.1;
const FAR = 200;
const DISTANCE = 8;
const HEIGHT = 6;
const BASE_LERP = 0.08;          // standard follow
const SLOW_LERP  = 0.04;          // heavier lag during fast movement
const FAST_LERP  = 0.18;          // snap back when player stops
const SPEED_LERP_THRESHOLD = 0.5;

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, NEAR, FAR);
  camera.position.set(0, HEIGHT, DISTANCE);
  const _target = new THREE.Vector3();
  const _desired = new THREE.Vector3();
  const _current = new THREE.Vector3();
  const _kickOffset = new THREE.Vector3();
  const _lookAt = new THREE.Vector3();
  let _kickTween = null;

  const rig = {
    camera,
    yaw: 0,
    setAspect(a) {
      camera.aspect = a;
      camera.updateProjectionMatrix();
    },
    // Smooth-tween a directional kick (units in world space).
    // direction is the world vector the camera should be pushed in (e.g. away from a slam).
    kickToward(direction, intensity = 0.6, duration = 0.25) {
      const k = (direction && direction.lengthSq() > 0) ? direction.clone().normalize().multiplyScalar(intensity) : _kickOffset.clone().multiplyScalar(-1).setLength(intensity);
      // Decay: lerp _kickOffset back to zero over `duration`.
      if (_kickTween) _kickTween.cancel();
      _kickTween = tween({
        from: { x: k.x, y: k.y, z: k.z },
        to:   { x: 0,   y: 0,   z: 0 },
        duration,
        ease: 'easeOutCubic',
        onUpdate: (v) => { _kickOffset.set(v.x, v.y, v.z); },
      });
      // Make kick immediately visible (don't wait for first onUpdate)
      _kickOffset.set(k.x, k.y, k.z);
    },
    update(dt, target, playerVelocity = 0) {
      const cx = target.x - Math.sin(this.yaw) * DISTANCE;
      const cz = target.z - Math.cos(this.yaw) * DISTANCE;
      _desired.set(cx, HEIGHT, cz);
      _current.copy(camera.position);

      // Velocity-aware lerp factor
      let lerp = BASE_LERP;
      if (playerVelocity > SPEED_LERP_THRESHOLD * 4) lerp = SLOW_LERP;  // fast → lag
      else if (playerVelocity < SPEED_LERP_THRESHOLD) lerp = FAST_LERP; // idle → snap

      camera.position.lerp(_desired, lerp);

      // Apply kick offset (additive on top of follow)
      camera.position.x += _kickOffset.x;
      camera.position.y += _kickOffset.y;
      camera.position.z += _kickOffset.z;

      // Drive kick tween
      if (_kickTween) {
        _kickTween.step(dt);
        if (_kickTween.done) _kickTween = null;
      }

      _lookAt.set(target.x, 1.5, target.z);
      camera.lookAt(_lookAt);
    },
  };

  return rig;
}
