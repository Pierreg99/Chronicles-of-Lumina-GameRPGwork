// world/minimap.js — paints a 2D top-down view to a fixed canvas in the DOM.
// Phase 8: supports zoom (mouse wheel + pinch) and a follow toggle.

export class Minimap {
  constructor(canvas) {
    this.canvas = canvas || document.getElementById('minimap');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.zoom = 1.0;
    this._wireZoom();
  }

  _wireZoom() {
    if (!this.canvas) return;
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.001;
      this.zoom = Math.max(0.5, Math.min(2.5, this.zoom + delta));
    }, { passive: false });
    // Pinch (basic): track two touches
    let lastDist = 0;
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        const t0 = e.touches[0], t1 = e.touches[1];
        lastDist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
      }
    }, { passive: true });
    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        const t0 = e.touches[0], t1 = e.touches[1];
        const dist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
        if (lastDist > 0) {
          const factor = dist / lastDist;
          this.zoom = Math.max(0.5, Math.min(2.5, this.zoom * factor));
        }
        lastDist = dist;
      }
    }, { passive: true });
  }

  draw(player, shrine, crystals, bossActive) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const W = this.canvas.width, H = this.canvas.height;
    const cx = W / 2, cy = H / 2;
    const baseScale = Math.min(W, H) / 100; // pixels per world unit at zoom 1
    const scale = baseScale * this.zoom;
    // Camera-relative origin: center on player.
    const ox = cx - player.x * scale;
    const oy = cy - player.z * scale;
    ctx.save();
    ctx.fillStyle = '#1c1f22'; ctx.fillRect(0, 0, W, H);

    // Path strip (world coords 2±1.5, 10±16)
    ctx.fillStyle = '#d9c79a';
    ctx.fillRect(ox + 0.5 * scale, oy + (-6) * scale, 3 * scale, 32 * scale);

    // Forest area outline
    ctx.strokeStyle = '#3a6b3a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ox + 18 * scale, oy + (-10) * scale, 24 * scale, 0, Math.PI * 2);
    ctx.stroke();

    // Houses
    ctx.fillStyle = '#e8d5b0';
    [[-6,-6],[6,-7],[-11,-3]].forEach(([hx, hz]) => {
      ctx.fillRect(ox + hx * scale - 2, oy + hz * scale - 2, 4, 4);
    });

    // Shrine
    ctx.fillStyle = crystals >= 10 ? '#5ad1ff' : '#a96bff';
    ctx.beginPath();
    ctx.arc(ox + 4 * scale, oy + 26 * scale, 4, 0, Math.PI * 2);
    ctx.fill();

    // Boss
    if (bossActive) {
      ctx.fillStyle = '#ff4a5e';
      ctx.beginPath();
      ctx.arc(ox + 4 * scale, oy + 20 * scale, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Player
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ox + player.x * scale, oy + player.z * scale, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2F7BFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
}
