// entities/slime-blue.js — re-export of the blue slime, identical mechanics to
// the base. Splitting per spec makes adding variants trivial.

import { Enemy } from './enemy-base.js';

export class SlimeBlue extends Enemy {
  constructor(scene, materials, x, z) {
    super(scene, materials, 0, x, z);
  }
}
