// entities/slime-green.js — jumpy aggressive leaf slime.

import { Enemy } from './enemy-base.js';

export class SlimeGreen extends Enemy {
  constructor(scene, materials, x, z) {
    super(scene, materials, 1, x, z);
  }
}
