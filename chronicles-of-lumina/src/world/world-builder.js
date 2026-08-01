// world/world-builder.js — assembles all world sub-systems. Phase 19+:
// accepts an optional zoneId and threads it through to the children.

import { buildTerrain } from './terrain.js';
import { buildVillage } from './village.js';
import { buildShrine } from './shrine.js';
import { buildForest } from './forest.js';
import { buildEnvironment } from './environment.js';
import { buildProps } from './props.js';
import { buildZonePortals } from './zone-portal.js';
import { getZone } from './zones/index.js';

export function buildWorld({ scene, materials, zoneId = 'verdant' }) {
  const zone = getZone(zoneId);
  buildEnvironment(scene, zoneId);
  buildTerrain(scene, materials, zoneId);
  const village = buildVillage(scene, materials, zone);
  buildForest(scene, materials, zone);
  const shrine = buildShrine(scene, materials, zone);
  buildProps(scene, materials, zone);
  const portals = buildZonePortals(scene, materials, zoneId);
  return { village, shrine, portals, zone };
}
