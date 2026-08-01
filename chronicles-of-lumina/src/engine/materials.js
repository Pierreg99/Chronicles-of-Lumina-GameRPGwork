// materials.js — loads the real texture_atlas.png, exposes toon materials and
// sprite-from-atlas helpers.

import * as THREE from 'three';
import { getUVForAsset } from '../utils/uv_helper.js';

const ATLAS_PATH = 'assets/texture_atlas.png';
const TOON_GRADIENT_STEPS = ['#555', '#999', '#ccc', '#fff'];

function makeToonGradientTexture() {
  const c = document.createElement('canvas');
  c.width = TOON_GRADIENT_STEPS.length;
  c.height = 1;
  const ctx = c.getContext('2d');
  TOON_GRADIENT_STEPS.forEach((col, i) => {
    ctx.fillStyle = col;
    ctx.fillRect(i, 0, 1, 1);
  });
  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  return tex;
}

export class MaterialFactory {
  constructor(renderer) {
    this.renderer = renderer;
    this.atlas = new THREE.TextureLoader().load(ATLAS_PATH);
    this.atlas.magFilter = THREE.NearestFilter;
    this.atlas.minFilter = THREE.NearestFilter;
    this.toonGradient = makeToonGradientTexture();
  }

  toon(color) {
    return new THREE.MeshToonMaterial({ color, gradientMap: this.toonGradient });
  }

  flat(color) {
    return new THREE.MeshBasicMaterial({ color });
  }

  // Build a small plane that samples a single atlas cell. Used for HUD-style props
  // or any time we want a sprite-like billboard from the atlas.
  atlasSprite(name, { color = 0xffffff } = {}) {
    const uv = getUVForAsset(name);
    const geo = new THREE.PlaneGeometry(1, 1);
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      map: this.atlas,
      transparent: true,
      alphaTest: 0.1,
      color,
    }));
  }
}
