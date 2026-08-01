// world/world-builder.js — assembles all world sub-systems.

import { buildTerrain } from './terrain.js';
import { buildVillage } from './village.js';
import { buildShrine } from './shrine.js';
import { buildForest } from './forest.js';
import { buildEnvironment } from './environment.js';
import { buildProps } from './props.js';

export function buildWorld({ scene, materials }) {
  buildEnvironment(scene);
  buildTerrain(scene, materials);
  const village = buildVillage(scene, materials);
  buildForest(scene, materials);
  const shrine = buildShrine(scene, materials);
  buildProps(scene, materials);
  return { village, shrine };
}
