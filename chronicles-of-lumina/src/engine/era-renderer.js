// engine/era-renderer.js — post-process filter that re-styles the rendered scene
// to match the current visual era. The 3D scene itself doesn't change; we
// re-process the pixels before they hit the screen.

import { ERA_INFO, currentEra, ERAS } from '../core/era.js';

/**
 * Apply the era's post-process filter to the rendered WebGL canvas, drawing
 * it back into a 2D canvas with era-specific styling.
 *
 * @param {HTMLCanvasElement} threeCanvas  the WebGL canvas Three.js renders to
 * @param {HTMLCanvasElement} displayCanvas the visible canvas
 * @returns {void}
 */
export function applyEraPostProcess(threeCanvas, displayCanvas) {
  const era = currentEra();
  const info = ERA_INFO[era];
  const ctx = displayCanvas.getContext('2d');
  if (!ctx) return;

  // Match display canvas size
  const w = displayCanvas.width  = threeCanvas.clientWidth  || 1280;
  const h = displayCanvas.height = threeCanvas.clientHeight || 720;
  ctx.clearRect(0, 0, w, h);

  if (era === ERAS.THREE_D) {
    // Era 3: just blit the 3D canvas directly, no filter
    ctx.drawImage(threeCanvas, 0, 0, w, h);
    return;
  }

  // Era 1+2: pixelate + quantize palette
  const pixelSize = info.pixelSize;
  const tmpW = Math.max(1, Math.floor(w / pixelSize));
  const tmpH = Math.max(1, Math.floor(h / pixelSize));

  // Draw 3D scene to a small offscreen canvas (pixelation)
  const off = document.createElement('canvas');
  off.width = tmpW;
  off.height = tmpH;
  const octx = off.getContext('2d');
  if (!octx) return;
  octx.imageSmoothingEnabled = false;
  octx.drawImage(threeCanvas, 0, 0, tmpW, tmpH);

  // Now upscale pixelated + apply palette quantization
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(off, 0, 0, w, h);

  // Palette quantize: take imageData, snap each channel to nearest palette color
  // (very simple posterize: 4 levels per channel for 8-bit feel, 8 for 16-bit)
  const img = ctx.getImageData(0, 0, w, h);
  const data = img.data;
  const levels = era === ERAS.EIGHT_BIT ? 3 : 6; // 8-bit=3 levels, 16-bit=6
  const step = 255 / (levels - 1);
  for (let i = 0; i < data.length; i += 4) {
    // posterize each channel
    for (let c = 0; c < 3; c++) {
      const v = data[i + c];
      data[i + c] = Math.round(v / step) * step;
    }
  }
  ctx.putImageData(img, 0, 0);

  // Era 1 (8-bit): scanlines overlay
  if (era === ERAS.EIGHT_BIT) {
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    for (let y = 0; y < h; y += 2) {
      ctx.fillRect(0, y, w, 1);
    }
  }

  // Era 1+2: vignette (CRT feel)
  if (era === ERAS.EIGHT_BIT || era === ERAS.SIXTEEN_BIT) {
    const grad = ctx.createRadialGradient(w/2, h/2, Math.min(w,h) * 0.3, w/2, h/2, Math.max(w,h) * 0.7);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
}

/**
 * Determine if movement should be locked to cardinal-4 (NES-style).
 * @returns {boolean}
 */
export function movementIsCardinal4() {
  return ERA_INFO[currentEra()].movement === 'cardinal-4';
}

/**
 * Determine if movement should be cardinal-8 (SNES-style, 8 directions).
 * @returns {boolean}
 */
export function movementIsCardinal8() {
  return ERA_INFO[currentEra()].movement === 'cardinal-8';
}
