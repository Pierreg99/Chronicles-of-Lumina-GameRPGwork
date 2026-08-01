// engine/renderer.js — Three.js WebGL renderer + resize handling + WebGL fallback.

import * as THREE from 'three';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    try {
      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    } catch (err) {
      showFallback(err);
      throw err;
    }
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    window.addEventListener('resize', () => this.resize());
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
