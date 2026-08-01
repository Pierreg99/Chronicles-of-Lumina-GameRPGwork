// entities/player.js — Arena, the hero. Holds HP, combo, invuln, dodge state.
// Animation is delegated to player-animation.js; combat state to player-combat.js.

import * as THREE from 'three';
import { state } from '../core/state.js';
import { PlayerAnimation } from './player-animation.js';
import { PlayerCombat } from './player-combat.js';

export class Player {
  constructor(scene, materials) {
    this.scene = scene;
    this.materials = materials;
    this.group = new THREE.Group();
    this._build();
    scene.add(this.group);

    this.position = this.group.position;
    this.velocity = 0;
    this._lastPos = new THREE.Vector3();

    this.hp = 5;
    this.maxHp = 5;
    this.inv = 0;
    this.atkCd = 0;
    this.rolling = 0;
    this.dir = new THREE.Vector3(0, 0, 1);
    this.kills = 0;
    this.crystals = 0;
    this.atkDmg = 1;

    // Sub-systems (Phase 2)
    this.animation = new PlayerAnimation(this);
    this.combat = new PlayerCombat(this);
  }

  _build() {
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.45, 0.8, 4, 8),
      this.materials.toon(0x2f5fb3)
    );
    body.position.y = 1.1; body.castShadow = true;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), this.materials.toon(0xffd9b3));
    head.position.y = 2.1; head.castShadow = true;
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
      this.materials.toon(0x6e4a2f)
    );
    hair.position.y = 2.18;
    const sword = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.1, 0.22), this.materials.toon(0xc9d4e0));
    sword.name = 'sword';
    sword.position.set(0.65, 1.3, 0);
    sword.rotation.z = -0.4;
    const cape = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1), this.materials.toon(0xb03a3a));
    cape.position.set(0, 1.4, -0.5);
    cape.rotation.x = 0.25;
    this.group.add(body, head, hair, sword, cape);
    this.sword = sword;
    this.group.position.set(0, 0, 2);
  }

  respawn(pos) {
    this.position.set(pos.x, 0, pos.z);
    this.hp = this.maxHp;
    this.inv = 2;
    this.combat.setInvulnerable(2.0);
  }

  // Returns true if the player just landed a hit (resolved by CombatSystem).
  startSwordSwing() {
    if (this.atkCd > 0 || this.rolling > 0) return false;
    this.atkCd = 0.45;
    this.animation.startSwing();
    return true;
  }

  startDodge() {
    if (this.rolling > 0 || this.atkCd > 0) return;
    this.rolling = 0.4;
  }

  takeDamage(dmg = 1) {
    const taken = this.combat.takeDamage(dmg);
    if (taken) state.damageTaken = (state.damageTaken || 0) + dmg;
    return taken;
  }

  heal(n) {
    this.hp = Math.min(this.maxHp, this.hp + n);
  }

  update(dt, t, input) {
    this.atkCd = Math.max(0, this.atkCd - dt);
    this.inv   = Math.max(0, this.inv - dt);
    this.rolling = Math.max(0, this.rolling - dt);

    // Track velocity for camera lag.
    this._lastPos.copy(this.position);
    // (we set this.velocity at end of frame, after position is updated)

    // Movement
    let mx = input.moveX();
    let mz = input.moveZ();
    const len = Math.hypot(mx, mz);
    if (len > 0.05) {
      mx /= Math.max(len, 1);
      mz /= Math.max(len, 1);
      const camYaw = state.cameraYaw || 0;
      const cos = Math.cos(camYaw), sin = Math.sin(camYaw);
      const wx = mx * cos - mz * sin;
      const wz = mx * sin + mz * cos;
      const sp = this.rolling > 0 ? 10 : 5;
      this.position.x += wx * sp * dt;
      this.position.z += wz * sp * dt;
      this.dir.set(wx, 0, wz);
      this.group.rotation.y = Math.atan2(wx, wz);
      this.position.y = Math.abs(Math.sin(t * 0.012)) * 0.08;
    } else {
      this.position.y *= 0.9;
    }
    this.position.x = Math.max(-38, Math.min(38, this.position.x));
    this.position.z = Math.max(-38, Math.min(38, this.position.z));
    if (this.rolling > 0) {
      this.group.rotation.x = (this.rolling > 0) ? Math.sin(this.rolling / Math.PI * 6) * 0.5 : 0;
    } else {
      this.group.rotation.x = 0;
    }
    // Phase 2: animation + combat sub-systems
    this.animation.update(dt);
    this.combat.update(dt);

    // Compute velocity in units/sec for camera lag.
    const moved = Math.hypot(this.position.x - this._lastPos.x, this.position.z - this._lastPos.z);
    this.velocity = dt > 0 ? moved / dt : 0;
  }
}
