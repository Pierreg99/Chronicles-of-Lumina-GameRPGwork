// entities/era-portal.js — interactable portal that advances the player to the
// next era. In era 3, the portal disappears (you're at the final form).

import * as THREE from 'three';
import { advanceEra, currentEra, ERAS, ERA_INFO, allEras } from '../core/era.js';
import { t } from '../core/i18n.js';

export class EraPortal {
  /**
   * @param {THREE.Scene} scene
   * @param {{ x: number, z: number }} pos
   */
  constructor(scene, pos) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.set(pos.x, 0, pos.z);

    // Glowing pillar (visual cue)
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.8, 3.5, 16),
      new THREE.MeshBasicMaterial({ color: 0x9eff9e, transparent: true, opacity: 0.6 })
    );
    pillar.position.y = 1.75;
    this.group.add(pillar);

    // Floating crystal on top
    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.35, 0),
      new THREE.MeshBasicMaterial({ color: 0xf5d04a })
    );
    crystal.position.y = 4.1;
    crystal.name = 'era-crystal';
    this.group.add(crystal);

    scene.add(this.group);
    this._t = 0;
  }

  update(dt) {
    this._t += dt;
    const c = this.group.getObjectByName('era-crystal');
    if (c) {
      c.position.y = 4.1 + Math.sin(this._t * 2) * 0.18;
      c.rotation.y = this._t * 1.2;
    }
  }

  /** Interact: advance to next era. Returns true if it happened. */
  interact() {
    if (currentEra() >= ERAS.THREE_D) return false;
    const next = advanceEra();
    if (next === null) return false;
    this.scene.dispatchEvent && this.scene.dispatchEvent({ type: 'era:changed' });
    return true;
  }

  /**
   * @param {THREE.Vector3} playerPos
   * @returns {boolean}
   */
  isPlayerNear(playerPos, dist = 2.5) {
    const dx = this.group.position.x - playerPos.x;
    const dz = this.group.position.z - playerPos.z;
    return Math.hypot(dx, dz) < dist;
  }

  get prompt() {
    if (currentEra() >= ERAS.THREE_D) return null;
    const next = currentEra() + 1;
    const nextInfo = ERA_INFO[next];
    return `[E] \u00c4ra \u00e4ndern: ${nextInfo.title}`;
  }
}
