// engine/renderer.js — Three.js WebGL renderer + resize handling + WebGL fallback.
// v0.13: caps DPR lower on coarse-pointer (mobile) devices; pauses shadow
// quality work isn't needed — just avoid burning fillrate on high-DPI phones.

import * as THREE from 'three';

function pickPixelRatio() {
  const dpr = window.devicePixelRatio || 1;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  // Mobile: hard-cap at 1.5 to keep fillrate sane; desktop: 2
  return Math.min(dpr, coarse ? 1.5 : 2);
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    try {
      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    } catch (err) {
      showFallback(err);
      throw err;
    }
    this.renderer.setPixelRatio(pickPixelRatio());
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    window.addEventListener('resize', () => this.resize());
    // Re-evaluate DPR if the pointer profile changes (rare, but cheap)
    window.matchMedia('(pointer: coarse)').addEventListener?.('change', () => {
      this.renderer.setPixelRatio(pickPixelRatio());
      this.resize();
    });
  }

  resize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render(scene, camera) {
    this.renderer.render(scene, camera);
  }
}

function showFallback(err) {
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;inset:0;display:grid;place-items:center;background:#0e1116;color:#e7ecf3;font-family:system-ui;padding:24px;text-align:center;';
  div.innerHTML = `
    <div style="max-width:520px">
      <h2 style="margin:0 0 8px;font-size:22px">3D nicht verfügbar</h2>
      <p style="opacity:.75;line-height:1.5">Dein Browser unterstützt kein WebGL oder es ist deaktiviert. „Chronicles of Lumina" benötigt WebGL.</p>
      <p style="opacity:.5;font-size:12px;margin-top:16px">${(err && err.message) || 'Unbekannter Fehler'}</p>
    </div>`;
  document.body.appendChild(div);
}
