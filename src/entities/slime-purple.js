// entities/slime-purple.js — ranged mist slime.

import { Enemy } from './enemy-base.js';

export class SlimePurple extends Enemy {
  constructor(scene, materials, x, z) {
    super(scene, materials, 2, x, z);
  }
}
