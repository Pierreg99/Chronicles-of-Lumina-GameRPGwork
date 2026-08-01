// world/zone-portal.js — visible portals on the world map that teleport
// the player to a different zone. Each portal is a glowing ring with a
// label. On overlap, the player can press E to step through.
//
// Phase 19+: this is the entry point for custom maps. Every zone (except
// ember, the endgame) spawns 2-3 portals leading to other biomes.

import * as THREE from 'three';
import { ZONES, getZone, listZones } from './zones/index.js';

const PORTAL_HEIGHT = 2.2;
const PORTAL_RADIUS = 1.0;
const PORTAL_COLOR_DEFAULT = 0xA78BFA;
const PORTAL_COLOR_CURRENT = 0xFFD23F; // accent when on this portal's target

/**
 * Build portals for the given zone. Returns a list of { mesh, label, targetZone, position }.
 * @param {THREE.Scene} scene
 * @param {object} materials  (the game's shared material factory)
 * @param {string} zoneId
 */
export function buildZonePortals(scene, materials, zoneId) {
  const current = getZone(zoneId);
  const portals = [];

  // Pick targets: 2-3 random zones (not the current one, not ember unless we're already endgame)
  const candidates = listZones().filter((z) => z.id !== zoneId);
  const numPortals = 2 + (zoneId === 'verdant' ? 1 : 0); // hub gets 3
  const targets = pickTargets(candidates, numPortals, current.difficulty);

  // Position portals in an arc around the hub (the zone.spawns[hub] point).
  const hub = pickHubPosition(current);

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    const angle = (i / targets.length) * Math.PI * 1.5 - Math.PI * 0.75;
    const radius = 8;
    const x = hub.x + Math.cos(angle) * radius;
    const z = hub.z + Math.sin(angle) * radius;
    const portal = makePortal(materials, target, target.accent);
    portal.mesh.position.set(x, PORTAL_HEIGHT / 2, z);
    scene.add(portal.mesh);
    portals.push({
      mesh: portal.mesh,
      label: portal.label,
      targetZone: target.id,
      position: { x, z },
      radius: 1.5,
    });
  }

  return portals;
}

function pickHubPosition(zone) {
  // Try the named spawn points in priority order
  for (const key of Object.keys(zone.spawns || {})) {
    return zone.spawns[key];
  }
  return { x: 0, z: 0 };
}

function pickTargets(candidates, count, fromDifficulty) {
  // Sort by closeness to the source difficulty so progression feels natural
  const sorted = [...candidates].sort(
    (a, b) => Math.abs(a.difficulty - fromDifficulty) - Math.abs(b.difficulty - fromDifficulty)
  );
  return sorted.slice(0, count);
}

function makePortal(materials, targetZone, color) {
  // A torus + emissive ring + floating label sprite
  const group = new THREE.Group();

  // Outer ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(PORTAL_RADIUS, 0.08, 16, 48),
    materials.toon(color)
  );
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  // Inner glow disc (faint)
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(PORTAL_RADIUS * 0.9, 48),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
    })
  );
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 0.02;
  group.add(disc);

  // Label sprite (zone name)
  const labelTex = makeLabelTexture(targetZone.name);
  const labelMat = new THREE.SpriteMaterial({ map: labelTex, transparent: true, depthTest: false });
  const label = new THREE.Sprite(labelMat);
  label.position.set(0, 1.6, 0);
  label.scale.set(3, 0.75, 1);
  group.add(label);

  return { mesh: group, label };
}

function makeLabelTexture(text) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const ctx = c.getContext('2d');
  // Rounded background
  ctx.fillStyle = 'rgba(15, 15, 26, 0.85)';
  roundRect(ctx, 4, 8, 248, 48, 12);
  ctx.fill();
  // Border
  ctx.strokeStyle = '#A78BFA';
  ctx.lineWidth = 2;
  roundRect(ctx, 4, 8, 248, 48, 12);
  ctx.stroke();
  // Text
  ctx.font = 'bold 22px Inter, system-ui, sans-serif';
  ctx.fillStyle = '#E2E8F0';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 33);
  // Arrow
  ctx.font = '16px Inter, system-ui, sans-serif';
  ctx.fillStyle = '#A78BFA';
  ctx.fillText('[E] betreten', 128, 50);

  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter;
  return tex;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Raycast / overlap test helper. Given the player position, return the
// portal whose radius the player is inside (or null).
export function findPortalAt(portals, position, distance = 1.6) {
  for (const p of portals) {
    const dx = p.position.x - position.x;
    const dz = p.position.z - position.z;
    if (dx * dx + dz * dz < distance * distance) return p;
  }
  return null;
}
