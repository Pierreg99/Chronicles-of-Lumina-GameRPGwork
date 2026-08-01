// engine/camera.js — third-person follow camera with:
//   - velocity-based lag (heavier feel when player sprints/dodges)
//   - additive kick impulse that decays over time
//   - additive screen-shake driven by the SHAKE bus event (R3)
//   - yaw controlled by input

import * as THREE from 'three';
import { Tween, tween } from '../utils/tween.js';

const FOV = 55;
const NEAR = 0.1;
const FAR = 200;
const DISTANCE = 8;
const HEIGHT = 6;
const BASE_LERP = 0.08;
const SLOW_LERP  = 0.04;
const FAST_LERP  = 0.18;
const SPEED_LERP_THRESHOLD = 0.5;
const FRAME_DT = 1 / 60;          // used for shake decay; OK to approximate

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, NEAR, FAR);
  camera.position.set(0, HEIGHT, DISTANCE);
  const _target = new THREE.Vector3();
  const _desired = new THREE.Vector3();
  const _current = new THREE.Vector3();
  const _kickOffset = new THREE.Vector3();
  const _lookAt = new THREE.Vector3();
  const _shakeOffset = new THREE.Vector3();
  let _kickTween = null;
  const _shakes = [];   // { intensity, remaining, total }

  const rig = {
    camera,
    yaw: 0,
    setAspect(a) {
      camera.aspect = a;
      camera.updateProjectionMatrix();
    },
    addShake(intensity, duration) {
      _shakes.push({ intensity, remaining: duration, total: duration });
    },
    kickToward(direction, intensity = 0.6, duration = 0.25) {
      const k = (direction && direction.lengthSq() > 0)
        ? direction.clone().normalize().multiplyScalar(intensity)
        : _kickOffset.clone().multiplyScalar(-1).setLength(intensity);
      if (_kickTween) _kickTween.cancel();
      _kickTween = tween({
        from: { x: k.x, y: k.y, z: k.z },
        to:   { x: 0,   y: 0,   z: 0 },
        duration,
        ease: 'easeOutCubic',
        onUpdate: (v) => { _kickOffset.set(v.x, v.y, v.z); },
      });
      _kickOffset.set(k.x, k.y, k.z);
    },
    update(dt, target, playerVelocity = 0) {
      const cx = target.x - Math.sin(this.yaw) * DISTANCE;
      const cz = target.z - Math.cos(this.yaw) * DISTANCE;
      _desired.set(cx, HEIGHT, cz);
      _current.copy(camera.position);

      let lerp = BASE_LERP;
      if (playerVelocity > SPEED_LERP_THRESHOLD * 4) lerp = SLOW_LERP;
      else if (playerVelocity < SPEED_LERP_THRESHOLD) lerp = FAST_LERP;

      camera.position.lerp(_desired, lerp);

      // Decay shake, sum residual offsets.
      _shakeOffset.set(0, 0, 0);
      for (let i = _shakes.length - 1; i >= 0; i--) {
        const s = _shakes[i];
        s.remaining -= FRAME_DT;
        const decay = s.remaining / s.total;
        const k = s.intensity * decay;
        _shakeOffset.x += (Math.random() - 0.5) * k;
        _shakeOffset.y += (Math.random() - 0.5) * k;
        _shakeOffset.z += (Math.random() - 0.5) * k;
        if (s.remaining <= 0) _shakes.splice(i, 1);
      }
      camera.position.x += _kickOffset.x + _shakeOffset.x;
      camera.position.y += _kickOffset.y + _shakeOffset.y;
      camera.position.z += _kickOffset.z + _shakeOffset.z;

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
