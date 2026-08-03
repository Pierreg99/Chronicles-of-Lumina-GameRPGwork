// ui/era-transition.js — full-screen animation when the era advances.
// CryoMotion A08: 3-staged transition (warp-in, era-flash, settle).
// Uses pure DOM/CSS for the overlay + a 2D canvas flash for the warp.

import { ERAS, ERA_INFO, currentEra, advanceEra } from '../core/era.js';
import { t } from '../core/i18n.js';

/**
 * @param {number} fromEra
 * @param {number} toEra
 * @param {() => void} onComplete
 * @returns {void}
 */
export function playEraTransition(fromEra, toEra, onComplete) {
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0', zIndex: '9999',
    background: '#000', opacity: '0', pointerEvents: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexDirection: 'column', color: '#9eff9e', textAlign: 'center',
    font: '600 32px/1.2 system-ui',
  });
  document.body.appendChild(overlay);

  // Build a starfield canvas for the warp effect
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  Object.assign(canvas.style, { position: 'absolute', inset: '0' });
  overlay.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  // Title text overlay
  const titleEl = document.createElement('div');
  titleEl.style.cssText = 'position:relative;z-index:1;padding:24px';
  overlay.appendChild(titleEl);

  // Stars
  const stars = [];
  for (let i = 0; i < 200; i++) {
    stars.push({
      x: (Math.random() - 0.5) * canvas.width,
      y: (Math.random() - 0.5) * canvas.height,
      z: Math.random() * 1.0,
      color: ['#fff', '#9eff9e', '#f5d04a', '#3a6fd8'][Math.floor(Math.random() * 4)],
    });
  }

  // Phase 1: warp-in (800ms) — stars zoom toward camera
  const start = performance.now();
  const WARP_MS = 800;
  const FLASH_MS = 600;
  const SETTLE_MS = 800;

  let phase = 'warp';
  function frame() {
    const t = performance.now() - start;
    if (phase === 'warp') {
      overlay.style.opacity = String(Math.min(1, t / 200));
      // Draw stars moving toward viewer
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        s.z += 0.04;
        if (s.z > 1.5) {
          s.z = 0;
          s.x = (Math.random() - 0.5) * canvas.width;
          s.y = (Math.random() - 0.5) * canvas.height;
        }
        const sx = canvas.width / 2 + s.x * (1 + s.z * 2);
        const sy = canvas.height / 2 + s.y * (1 + s.z * 2);
        const size = s.z * 4;
        ctx.fillStyle = s.color;
        ctx.fillRect(sx - size/2, sy - size/2, size, size);
      }
      if (t < WARP_MS) {
        requestAnimationFrame(frame);
      } else {
        phase = 'flash';
        titleEl.innerHTML = `<div style="font-size:48px;letter-spacing:8px;animation:era-flash 0.6s ease-in">\u00c4RA ${toEra}</div><div style="font-size:18px;margin-top:12px;opacity:.8">${ERA_INFO[toEra].title}</div>`;
        requestAnimationFrame(frame);
      }
    } else if (phase === 'flash') {
      const flashProgress = (t - WARP_MS) / FLASH_MS;
      overlay.style.background = `rgba(255, 255, 255, ${1 - flashProgress})`;
      overlay.style.opacity = String(1);
      if (t < WARP_MS + FLASH_MS) {
        requestAnimationFrame(frame);
      } else {
        phase = 'settle';
        overlay.style.background = '#000';
        titleEl.innerHTML = `<div style="font-size:18px;letter-spacing:2px;color:#9eff9e">Willkommen in der \u00c4ra</div><div style="font-size:36px;font-weight:700;margin:6px 0">${ERA_INFO[toEra].title}</div><div style="font-size:13px;opacity:.65;max-width:380px">${ERA_INFO[toEra].subtitle}</div>`;
        requestAnimationFrame(frame);
      }
    } else if (phase === 'settle') {
      const settleProgress = (t - WARP_MS - FLASH_MS) / SETTLE_MS;
      overlay.style.opacity = String(Math.max(0, 1 - settleProgress));
      if (t < WARP_MS + FLASH_MS + SETTLE_MS) {
        requestAnimationFrame(frame);
      } else {
        overlay.remove();
        if (onComplete) onComplete();
      }
    }
  }
  requestAnimationFrame(frame);
}
