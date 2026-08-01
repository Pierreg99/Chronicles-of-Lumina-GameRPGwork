// entities/npc-elder.js — village elder NPC. Non-combatant, gives intro dialog.

import * as THREE from 'three';

export class NpcElder {
  constructor(scene, materials, position) {
    this.scene = scene;
    this.materials = materials;
    this.group = new THREE.Group();
    this._build();
    this.group.position.copy(position);
    this.scene.add(this.group);
    this.position = this.group.position;
    this.dialog = [
      'Aren, ein dunkler Nebel verdirbt den Schrein im Smaragdwald.',
      'Bringe mir zehn Lichtkristalle — sie reinigen das Land.',
      'Besiege die Schleime im Wald, sie tragen die Kristalle bei sich.',
    ];
  }

  _build() {
    const robe = new THREE.Mesh(
      new THREE.ConeGeometry(0.6, 1.8, 10),
      this.materials.toon(0x5a3a8e)
    );
    robe.position.y = 0.9; robe.castShadow = true;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), this.materials.toon(0xffd9b3));
    head.position.y = 2.0; head.castShadow = true;
    const hood = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
      this.materials.toon(0x4a2b73)
    );
    hood.position.y = 2.0;
    const staff = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 1.6, 6),
      this.materials.toon(0x6e4a2f)
    );
    staff.position.set(0.45, 0.8, 0);
    this.group.add(robe, head, hood, staff);
  }
}
