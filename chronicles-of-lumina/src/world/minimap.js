// world/minimap.js — paints a 2D top-down view to a fixed canvas in the DOM.

export class Minimap {
  constructor(canvas) {
    this.canvas = canvas || document.getElementById('minimap');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
  }

  draw(player, shrine, crystals, bossActive) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const W = this.canvas.width, H = this.canvas.height;
    ctx.fillStyle = '#24272b'; ctx.fillRect(0, 0, W, H);

    // Path strip
    ctx.fillStyle = '#d9c79a'; ctx.fillRect(55, 10, 10, 100);

    // Houses
    ctx.fillStyle = '#e8d5b0';
    [[-6,-6],[6,-7],[-11,-3]].forEach(([hx, hz]) =>
      ctx.fillRect(60 + hx, 60 + hz, 4, 4)
    );

    // Shrine
    ctx.fillStyle = crystals >= 10 ? '#5ad1ff' : '#8e44ad';
    ctx.beginPath(); ctx.arc(60 + 4, 60 + 26, 4, 0, 7); ctx.fill();

    // Boss
    if (bossActive) {
      ctx.fillStyle = '#ff4a5e';
      ctx.beginPath(); ctx.arc(60 + 4, 60 + 20, 4, 0, 7); ctx.fill();
    }

    // Player
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(60 + player.x, 60 + player.z, 3, 0, 7);
    ctx.fill();
  }
}
