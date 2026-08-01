// src/utils/asset-gen.js
// Prozedurale Canvas-2D Asset-Generierung zur Laufzeit.
// Visuelles Zielniveau: Granblue Fantasy / Star Ocean UI-Stil
//   - dicke, dunkle Outlines (3-4px)
//   - saturierte Farben, 2-3 Töne pro Objekt (Cell-Shading)
//   - Glanzpunkte, Sparkles, Glows auf UI-Items
//   - anime-/portrait-Stil für Charaktere
//
// API: AssetGen.atlas()         → 512×512 Canvas (4×4 grid, 16 Zellen)
//      AssetGen.generateAll()   → Map<name, HTMLCanvasElement> für alle 21 Dateien
//      AssetGen.{atlas,portraits,icons,ui}.* → einzelne Canvas-Funktionen
//
// Verbraucher:
//   - engine/materials.js nutzt AssetGen.atlas() als THREE.CanvasTexture
//   - alle übrigen 20 Einträge existieren als Map für die Codex-UI / Inspektion

// =============================================================
// HELPERS
// =============================================================

function makeCanvas(size = 128) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return c;
}

function ctxOf(c) { return c.getContext('2d'); }

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {() => void} pathFn
 * @param {{fill?: string, stroke?: string, strokeWidth?: number, lineJoin?: CanvasLineJoin}} [opts]
 * @returns {void}
 */
function strokeFill(ctx, pathFn, { fill, stroke = '#0e0a14', strokeWidth = 4, lineJoin = 'round' } = {}) {
  ctx.save();
  if (lineJoin) ctx.lineJoin = lineJoin;
  ctx.lineCap = 'round';
  if (fill) { ctx.fillStyle = fill; pathFn(); ctx.fill(); }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    pathFn();
    ctx.stroke();
  }
  ctx.restore();
}

function toonShade(ctx, x, y, w, h, light, base, dark, hlY = 0.35, shY = 0.65) {
  // Light side (top), base, dark (bottom) — three horizontal bands.
  ctx.fillStyle = base;   ctx.fillRect(x, y, w, h);
  ctx.fillStyle = light;  ctx.fillRect(x, y, w, h * hlY);
  ctx.fillStyle = dark;   ctx.fillRect(x, y + h * shY, w, h * (1 - shY));
}

function radialGlow(ctx, x, y, r, inner, outer = 'rgba(0,0,0,0)') {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}

function sparkle(ctx, cx, cy, size, color = '#ffffff') {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = color;
  ctx.beginPath();
  const s = size;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const r = (i % 2 === 0) ? s : s * 0.32;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawFrame(ctx, x, y, w, h, { outer = '#3a1f0a', mid = '#caa14a', inner = '#fff2c5', pad = 4 } = {}) {
  // Outer dark border
  ctx.fillStyle = outer;
  ctx.fillRect(x, y, w, h);
  // Gold mid band
  ctx.fillStyle = mid;
  ctx.fillRect(x + pad, y + pad, w - pad * 2, h - pad * 2);
  // Inner parchment
  ctx.fillStyle = inner;
  ctx.fillRect(x + pad * 2, y + pad * 2, w - pad * 4, h - pad * 4);
  // Corner studs
  ctx.fillStyle = outer;
  const cs = 4;
  for (const [cx, cy] of [[x + 6, y + 6], [x + w - 6, y + 6], [x + 6, y + h - 6], [x + w - 6, y + h - 6]]) {
    ctx.beginPath(); ctx.arc(cx, cy, cs, 0, Math.PI * 2); ctx.fill();
  }
}

function drawEye(ctx, cx, cy, size, color = '#0e0a14') {
  // Anime eye: white sclera + black pupil + highlight
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.ellipse(cx, cy, size, size * 1.25, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(cx, cy, size * 0.7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(cx - size * 0.3, cy - size * 0.3, size * 0.32, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// =============================================================
// ATLAS CELLS (16 × 128×128, layout matches utils/uv_helper.js)
// =============================================================

function grassTile() {
  const c = makeCanvas(128); const x = ctxOf(c);
  // Base grass
  toonShade(x, 0, 0, 128, 128, '#7fc95a', '#4ea43a', '#2d6e21');
  // Grass tufts
  x.strokeStyle = '#1d4a18'; x.lineWidth = 2; x.lineCap = 'round';
  const tufts = [[18, 26], [42, 14], [78, 32], [104, 22], [60, 80], [24, 96], [96, 92], [112, 70]];
  for (const [tx, ty] of tufts) {
    x.beginPath(); x.moveTo(tx, ty + 6);
    x.lineTo(tx - 3, ty - 4); x.moveTo(tx, ty + 6); x.lineTo(tx, ty - 5);
    x.moveTo(tx, ty + 6); x.lineTo(tx + 3, ty - 4);
    x.stroke();
  }
  // Small yellow flowers
  const flowers = [[34, 60], [88, 50], [52, 100]];
  for (const [fx, fy] of flowers) {
    x.fillStyle = '#f5d04a';
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      x.beginPath(); x.arc(fx + Math.cos(a) * 3, fy + Math.sin(a) * 3, 2, 0, Math.PI * 2); x.fill();
    }
    x.fillStyle = '#b8830a'; x.beginPath(); x.arc(fx, fy, 1.6, 0, Math.PI * 2); x.fill();
  }
  // Tile border (subtle)
  x.strokeStyle = 'rgba(0,0,0,0.18)'; x.lineWidth = 1;
  x.strokeRect(0.5, 0.5, 127, 127);
  return c;
}

function pathTile() {
  const c = makeCanvas(128); const x = ctxOf(c);
  // Packed earth base
  toonShade(x, 0, 0, 128, 128, '#d9b785', '#b08957', '#7a5631');
  // Irregular stepping stones
  const stones = [[22, 28, 22, 18], [70, 22, 28, 16], [40, 60, 26, 20], [86, 70, 22, 22], [20, 88, 24, 18], [80, 102, 20, 14]];
  for (const [sx, sy, sw, sh] of stones) {
    x.fillStyle = '#9b7a4f';
    x.beginPath();
    x.moveTo(sx + 4, sy);
    x.lineTo(sx + sw - 2, sy + 2);
    x.lineTo(sx + sw, sy + sh - 3);
    x.lineTo(sx + 3, sy + sh);
    x.closePath(); x.fill();
    x.fillStyle = '#c4a06c';
    x.beginPath();
    x.moveTo(sx + 4, sy);
    x.lineTo(sx + sw - 2, sy + 2);
    x.lineTo(sx + sw - 4, sy + 4);
    x.lineTo(sx + 5, sy + 4);
    x.closePath(); x.fill();
    x.strokeStyle = '#5a3a1f'; x.lineWidth = 1.2;
    x.beginPath();
    x.moveTo(sx + 4, sy); x.lineTo(sx + sw - 2, sy + 2);
    x.lineTo(sx + sw, sy + sh - 3); x.lineTo(sx + 3, sy + sh); x.closePath();
    x.stroke();
  }
  // Speckle (sand grains)
  x.fillStyle = 'rgba(255,255,255,0.15)';
  for (let i = 0; i < 40; i++) {
    x.fillRect(Math.random() * 128, Math.random() * 128, 1, 1);
  }
  x.strokeStyle = 'rgba(0,0,0,0.18)'; x.lineWidth = 1;
  x.strokeRect(0.5, 0.5, 127, 127);
  return c;
}

function waterTile() {
  const c = makeCanvas(128); const x = ctxOf(c);
  // Water gradient
  toonShade(x, 0, 0, 128, 128, '#5fb3ff', '#2f7dc4', '#1a4f8a');
  // Wave lines (lighter blue)
  x.strokeStyle = '#a4d4ff'; x.lineWidth = 1.8; x.lineCap = 'round';
  const waves = [
    [10, 30, 50, 0.3], [60, 22, 60, 0.5], [16, 70, 100, 0.4],
    [40, 100, 70, 0.6], [80, 110, 40, 0.3],
  ];
  for (const [y0, y1, len, amp] of waves) {
    x.beginPath();
    x.moveTo(8, y0);
    for (let dx = 0; dx <= len; dx += 4) {
      const yy = y0 + Math.sin(dx * 0.18) * 4 * amp;
      x.lineTo(8 + dx, yy);
    }
    x.stroke();
  }
  // Sparkles on water
  sparkle(x, 30, 26, 2.2, '#ffffff');
  sparkle(x, 84, 18, 1.6, '#ffffff');
  sparkle(x, 96, 90, 2.4, '#ffffff');
  // Foam on bottom edge
  x.fillStyle = 'rgba(255,255,255,0.12)';
  for (let dx = 0; dx < 128; dx += 6) {
    x.beginPath();
    x.arc(dx, 124 + Math.sin(dx * 0.4) * 1, 2.5, 0, Math.PI * 2);
    x.fill();
  }
  x.strokeStyle = 'rgba(0,0,0,0.18)'; x.lineWidth = 1;
  x.strokeRect(0.5, 0.5, 127, 127);
  return c;
}

function rock() {
  const c = makeCanvas(128); const x = ctxOf(c);
  x.clearRect(0, 0, 128, 128);
  // Base boulder shape
  const rock = () => {
    x.beginPath();
    x.moveTo(22, 90);
    x.lineTo(14, 60);
    x.lineTo(28, 30);
    x.lineTo(58, 16);
    x.lineTo(90, 22);
    x.lineTo(110, 50);
    x.lineTo(116, 84);
    x.lineTo(96, 108);
    x.lineTo(56, 112);
    x.lineTo(28, 102);
    x.closePath();
  };
  strokeFill(x, rock, { fill: '#a3a8b0', stroke: '#1a1d22', strokeWidth: 4 });
  // Cell-shade: light side top-left, dark side bottom-right
  x.save();
  x.clip(rock);
  // Light
  const lg = x.createLinearGradient(0, 0, 0, 128);
  lg.addColorStop(0, 'rgba(255,255,255,0.45)');
  lg.addColorStop(0.45, 'rgba(255,255,255,0)');
  lg.fillStyle = lg; x.fillRect(0, 0, 128, 128);
  // Dark
  const dg = x.createLinearGradient(0, 0, 0, 128);
  dg.addColorStop(0.5, 'rgba(0,0,0,0)');
  dg.addColorStop(1, 'rgba(0,0,0,0.4)');
  x.fillStyle = dg; x.fillRect(0, 0, 128, 128);
  // Cracks
  x.strokeStyle = '#1a1d22'; x.lineWidth = 1.4; x.lineCap = 'round';
  x.beginPath();
  x.moveTo(40, 36); x.lineTo(54, 56); x.lineTo(46, 78);
  x.moveTo(76, 30); x.lineTo(70, 50);
  x.moveTo(88, 60); x.lineTo(98, 80);
  x.stroke();
  x.restore();
  // Moss patches
  x.fillStyle = '#4ea43a';
  for (const [mx, my] of [[26, 96], [100, 92], [56, 108]]) {
    x.beginPath(); x.ellipse(mx, my, 10, 4, 0, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#7fc95a';
    x.beginPath(); x.ellipse(mx - 2, my - 1, 6, 2, 0, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#4ea43a';
  }
  return c;
}

function tree() {
  const c = makeCanvas(128); const x = ctxOf(c);
  x.clearRect(0, 0, 128, 128);
  // Trunk
  x.fillStyle = '#6e4a2a';
  x.beginPath();
  x.moveTo(56, 128); x.lineTo(54, 70);
  x.lineTo(50, 60); x.lineTo(78, 60);
  x.lineTo(74, 70); x.lineTo(72, 128);
  x.closePath(); x.fill();
  // Trunk highlight
  x.fillStyle = '#a6743e';
  x.beginPath();
  x.moveTo(58, 128); x.lineTo(56, 70); x.lineTo(60, 60); x.lineTo(66, 60);
  x.lineTo(64, 70); x.lineTo(64, 128);
  x.closePath(); x.fill();
  // Trunk outline
  x.strokeStyle = '#2a1a0e'; x.lineWidth = 3; x.lineJoin = 'round';
  x.beginPath();
  x.moveTo(56, 128); x.lineTo(54, 70); x.lineTo(50, 60); x.lineTo(78, 60);
  x.lineTo(74, 70); x.lineTo(72, 128);
  x.stroke();
  // Foliage — three layers of cloud shapes
  const drawCloud = (cx, cy, r) => {
    x.beginPath();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const rr = r * (0.85 + Math.sin(i * 1.7) * 0.15);
      const px = cx + Math.cos(a) * rr;
      const py = cy + Math.sin(a) * rr * 0.75;
      if (i === 0) x.moveTo(px, py); else x.lineTo(px, py);
    }
    x.closePath();
  };
  // Back layer (dark)
  x.fillStyle = '#2d6e21';
  drawCloud(64, 36, 50); x.fill();
  // Mid layer (base)
  x.fillStyle = '#4ea43a';
  drawCloud(60, 32, 46); x.fill();
  // Front highlight
  x.fillStyle = '#7fc95a';
  drawCloud(54, 24, 34); x.fill();
  // Outline
  x.strokeStyle = '#1d4a18'; x.lineWidth = 3;
  drawCloud(64, 36, 50); x.stroke();
  return c;
}

function house() {
  const c = makeCanvas(128); const x = ctxOf(c);
  x.clearRect(0, 0, 128, 128);
  // Body (tan wall)
  x.fillStyle = '#e8d5b0';
  x.fillRect(28, 60, 72, 56);
  // Wall texture (planks)
  x.strokeStyle = '#a48a5a'; x.lineWidth = 1;
  for (let yy = 60; yy < 116; yy += 10) {
    x.beginPath(); x.moveTo(28, yy); x.lineTo(100, yy); x.stroke();
  }
  // Wall outline
  x.strokeStyle = '#1d1108'; x.lineWidth = 3; x.lineJoin = 'round';
  x.strokeRect(28, 60, 72, 56);
  // Roof (red triangle)
  x.fillStyle = '#c0392b';
  x.beginPath();
  x.moveTo(22, 62); x.lineTo(64, 18); x.lineTo(106, 62); x.closePath(); x.fill();
  // Roof shingle lines
  x.strokeStyle = '#7a1f15'; x.lineWidth = 1.2;
  for (let yy = 30; yy < 64; yy += 6) {
    x.beginPath();
    x.moveTo(28 + (64 - 28) * ((yy - 18) / (62 - 18)), yy);
    x.lineTo(100 - (100 - 64) * ((yy - 18) / (62 - 18)), yy);
    x.stroke();
  }
  // Roof highlight
  x.fillStyle = '#e74c3c';
  x.beginPath();
  x.moveTo(32, 60); x.lineTo(64, 26); x.lineTo(64, 60); x.closePath(); x.fill();
  // Roof outline
  x.strokeStyle = '#1d1108'; x.lineWidth = 3; x.lineJoin = 'round';
  x.beginPath(); x.moveTo(22, 62); x.lineTo(64, 18); x.lineTo(106, 62); x.closePath(); x.stroke();
  // Chimney
  x.fillStyle = '#7a1f15'; x.fillRect(86, 30, 10, 18);
  x.strokeStyle = '#1d1108'; x.lineWidth = 2;
  x.strokeRect(86, 30, 10, 18);
  // Door
  x.fillStyle = '#6e4a2f';
  x.fillRect(56, 82, 16, 34);
  x.fillStyle = '#a6743e'; x.fillRect(58, 84, 5, 30);
  x.strokeStyle = '#1d1108'; x.lineWidth = 2;
  x.strokeRect(56, 82, 16, 34);
  // Door knob
  x.fillStyle = '#f5d04a';
  x.beginPath(); x.arc(68, 100, 1.5, 0, Math.PI * 2); x.fill();
  // Window (left of door)
  x.fillStyle = '#f5d04a';
  x.fillRect(34, 76, 14, 12);
  x.strokeStyle = '#1d1108'; x.lineWidth = 2;
  x.strokeRect(34, 76, 14, 12);
  x.beginPath(); x.moveTo(41, 76); x.lineTo(41, 88); x.stroke();
  // Window (right of door)
  x.fillStyle = '#f5d04a';
  x.fillRect(80, 76, 14, 12);
  x.strokeStyle = '#1d1108'; x.lineWidth = 2;
  x.strokeRect(80, 76, 14, 12);
  x.beginPath(); x.moveTo(87, 76); x.lineTo(87, 88); x.stroke();
  return c;
}

function shrine() {
  const c = makeCanvas(128); const x = ctxOf(c);
  x.clearRect(0, 0, 128, 128);
  // Base platform
  x.fillStyle = '#6b5a3e';
  x.fillRect(14, 110, 100, 10);
  x.fillStyle = '#a08860';
  x.fillRect(14, 110, 100, 4);
  x.strokeStyle = '#1d1108'; x.lineWidth = 2;
  x.strokeRect(14, 110, 100, 10);
  // Two pillars (red)
  x.fillStyle = '#c0392b';
  x.fillRect(26, 40, 12, 76);
  x.fillRect(90, 40, 12, 76);
  // Pillar light side
  x.fillStyle = '#e74c3c';
  x.fillRect(26, 40, 4, 76);
  x.fillRect(90, 40, 4, 76);
  // Pillar outline
  x.strokeStyle = '#1d1108'; x.lineWidth = 3; x.lineJoin = 'round';
  x.strokeRect(26, 40, 12, 76);
  x.strokeRect(90, 40, 12, 76);
  // Top beam 1 (kasagi, curved)
  x.fillStyle = '#1d1108';
  x.beginPath();
  x.moveTo(12, 30); x.lineTo(116, 30); x.lineTo(116, 22); x.lineTo(64, 14); x.lineTo(12, 22);
  x.closePath(); x.fill();
  // Top beam 2 (nuki, straight)
  x.fillStyle = '#c0392b';
  x.fillRect(16, 36, 96, 10);
  x.fillStyle = '#e74c3c'; x.fillRect(16, 36, 96, 3);
  x.strokeStyle = '#1d1108'; x.lineWidth = 2;
  x.strokeRect(16, 36, 96, 10);
  // Center plaque (gakuzuka)
  x.fillStyle = '#f5d04a';
  x.fillRect(56, 56, 16, 18);
  x.strokeStyle = '#1d1108'; x.lineWidth = 2;
  x.strokeRect(56, 56, 16, 18);
  // Plaque character (stylized "神" / kami)
  x.fillStyle = '#1d1108';
  x.font = 'bold 12px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText('神', 64, 65);
  // Rope (shimenawa) — yellow with tassels
  x.strokeStyle = '#f5d04a'; x.lineWidth = 2.4;
  x.beginPath();
  x.moveTo(20, 50); x.quadraticCurveTo(64, 70, 108, 50); x.stroke();
  // Tassels
  for (const tx of [30, 48, 64, 80, 98]) {
    x.fillStyle = '#f5d04a';
    x.fillRect(tx - 1.2, 60, 2.4, 6);
    x.fillStyle = '#b8830a'; x.fillRect(tx - 1.2, 66, 2.4, 1.5);
  }
  return c;
}

function minimap() {
  const c = makeCanvas(128); const x = ctxOf(c);
  // Old paper background
  const g = x.createRadialGradient(64, 64, 10, 64, 64, 80);
  g.addColorStop(0, '#fff2c5');
  g.addColorStop(0.7, '#e6cfa0');
  g.addColorStop(1, '#a48a5a');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  // Parchment texture (fibrous lines)
  x.strokeStyle = 'rgba(120,90,40,0.18)'; x.lineWidth = 0.6;
  for (let i = 0; i < 30; i++) {
    x.beginPath();
    const sx = Math.random() * 128, sy = Math.random() * 128;
    x.moveTo(sx, sy);
    x.lineTo(sx + (Math.random() - 0.5) * 30, sy + (Math.random() - 0.5) * 30);
    x.stroke();
  }
  // Ornate frame
  drawFrame(x, 4, 4, 120, 120, { outer: '#3a1f0a', mid: '#caa14a', inner: '#fff2c5', pad: 4 });
  // Compass rose
  x.save();
  x.translate(64, 64);
  // Outer ring
  x.strokeStyle = '#3a1f0a'; x.lineWidth = 1.5;
  x.beginPath(); x.arc(0, 0, 24, 0, Math.PI * 2); x.stroke();
  // 8-point star
  x.fillStyle = '#7a5631';
  for (let i = 0; i < 8; i++) {
    x.save(); x.rotate((i / 8) * Math.PI * 2);
    x.beginPath();
    x.moveTo(0, 0); x.lineTo(2, 22); x.lineTo(0, 26); x.lineTo(-2, 22); x.closePath();
    x.fill();
    x.restore();
  }
  // Center dot
  x.fillStyle = '#c0392b';
  x.beginPath(); x.arc(0, 0, 3, 0, Math.PI * 2); x.fill();
  x.restore();
  // Corner rune marks
  x.fillStyle = '#7a5631';
  x.font = 'bold 10px serif'; x.textAlign = 'center';
  for (const [px, py, ch] of [[20, 18, 'N'], [108, 18, 'O'], [20, 116, 'W'], [108, 116, 'S']]) {
    x.fillText(ch, /** @type {number} */ (px), /** @type {number} */ (py) + 4);
  }
  return c;
}

function heartFull() {
  const c = makeCanvas(128); const x = ctxOf(c);
  x.clearRect(0, 0, 128, 128);
  // Heart path
  const heart = () => {
    x.beginPath();
    x.moveTo(64, 116);
    x.bezierCurveTo(0, 80, 4, 16, 38, 16);
    x.bezierCurveTo(54, 16, 60, 26, 64, 36);
    x.bezierCurveTo(68, 26, 74, 16, 90, 16);
    x.bezierCurveTo(124, 16, 128, 80, 64, 116);
    x.closePath();
  };
  strokeFill(x, heart, { fill: '#e74c3c', stroke: '#3a0a08', strokeWidth: 5 });
  // Light side (top-left of heart)
  x.save(); x.clip(heart);
  const lg = x.createLinearGradient(0, 0, 128, 128);
  lg.addColorStop(0, 'rgba(255,255,255,0.55)');
  lg.addColorStop(0.5, 'rgba(255,255,255,0)');
  x.fillStyle = lg; x.fillRect(0, 0, 128, 128);
  // Dark side (bottom-right)
  const dg = x.createLinearGradient(0, 0, 128, 128);
  dg.addColorStop(0.4, 'rgba(0,0,0,0)');
  dg.addColorStop(1, 'rgba(80,0,0,0.4)');
  x.fillStyle = dg; x.fillRect(0, 0, 128, 128);
  x.restore();
  // Big shine highlight
  x.fillStyle = 'rgba(255,255,255,0.7)';
  x.beginPath();
  x.ellipse(40, 36, 12, 7, -0.5, 0, Math.PI * 2); x.fill();
  x.fillStyle = 'rgba(255,255,255,0.4)';
  x.beginPath();
  x.ellipse(46, 44, 6, 3, -0.5, 0, Math.PI * 2); x.fill();
  // Sparkles
  sparkle(x, 92, 32, 3, '#fff8d4');
  sparkle(x, 80, 90, 2, '#fff8d4');
  return c;
}

function heartEmpty() {
  const c = makeCanvas(128); const x = ctxOf(c);
  x.clearRect(0, 0, 128, 128);
  const heart = () => {
    x.beginPath();
    x.moveTo(64, 116);
    x.bezierCurveTo(0, 80, 4, 16, 38, 16);
    x.bezierCurveTo(54, 16, 60, 26, 64, 36);
    x.bezierCurveTo(68, 26, 74, 16, 90, 16);
    x.bezierCurveTo(124, 16, 128, 80, 64, 116);
    x.closePath();
  };
  // Dark outline only
  x.save();
  x.fillStyle = 'rgba(40,30,40,0.5)';
  heart(); x.fill();
  x.strokeStyle = '#3a0a08'; x.lineWidth = 5; heart(); x.stroke();
  // Crack down the middle
  x.strokeStyle = '#1a0504'; x.lineWidth = 2; x.lineCap = 'round';
  x.beginPath();
  x.moveTo(64, 38); x.lineTo(62, 60); x.lineTo(66, 82); x.lineTo(60, 104);
  x.stroke();
  x.restore();
  return c;
}

function crystal() {
  const c = makeCanvas(128); const x = ctxOf(c);
  x.clearRect(0, 0, 128, 128);
  // Outer glow
  radialGlow(x, 64, 64, 70, 'rgba(120, 200, 255, 0.45)');
  radialGlow(x, 64, 64, 40, 'rgba(180, 230, 255, 0.55)');
  // Diamond shape
  const diamond = () => {
    x.beginPath();
    x.moveTo(64, 14);
    x.lineTo(108, 56);
    x.lineTo(64, 116);
    x.lineTo(20, 56);
    x.closePath();
  };
  strokeFill(x, diamond, { fill: '#5fb3ff', stroke: '#0a1d3a', strokeWidth: 4 });
  // Facets
  x.save(); x.clip(diamond);
  // Top-left light facet
  x.fillStyle = 'rgba(255,255,255,0.55)';
  x.beginPath();
  x.moveTo(64, 14); x.lineTo(108, 56); x.lineTo(64, 64); x.closePath(); x.fill();
  // Bottom-right dark facet
  x.fillStyle = 'rgba(0,30,80,0.45)';
  x.beginPath();
  x.moveTo(64, 116); x.lineTo(108, 56); x.lineTo(64, 64); x.closePath(); x.fill();
  x.restore();
  // Inner facet lines
  x.strokeStyle = '#0a1d3a'; x.lineWidth = 1.5; x.lineJoin = 'round';
  x.beginPath();
  x.moveTo(64, 14); x.lineTo(64, 116);
  x.moveTo(20, 56); x.lineTo(108, 56);
  x.moveTo(64, 64); x.lineTo(20, 56);
  x.moveTo(64, 64); x.lineTo(108, 56);
  x.stroke();
  // Inner small triangle highlight
  x.fillStyle = 'rgba(255,255,255,0.85)';
  x.beginPath();
  x.moveTo(64, 22); x.lineTo(80, 48); x.lineTo(64, 50); x.closePath(); x.fill();
  // Sparkles
  sparkle(x, 30, 30, 4, '#fff');
  sparkle(x, 100, 90, 3, '#fff');
  sparkle(x, 92, 28, 2, '#fff');
  sparkle(x, 28, 100, 2.4, '#fff');
  return c;
}

function berry() {
  const c = makeCanvas(128); const x = ctxOf(c);
  x.clearRect(0, 0, 128, 128);
  // Leaf (behind berry)
  const leaf = () => {
    x.beginPath();
    x.moveTo(64, 22);
    x.bezierCurveTo(96, 12, 108, 32, 92, 44);
    x.bezierCurveTo(78, 50, 70, 42, 64, 36);
    x.closePath();
  };
  strokeFill(x, leaf, { fill: '#4ea43a', stroke: '#1d4a18', strokeWidth: 3 });
  // Leaf vein
  x.save(); x.clip(leaf);
  x.strokeStyle = '#1d4a18'; x.lineWidth = 1.4;
  x.beginPath(); x.moveTo(64, 24); x.lineTo(88, 40); x.stroke();
  x.restore();
  // Berry body
  const berry = () => {
    x.beginPath();
    x.moveTo(64, 40);
    x.bezierCurveTo(28, 40, 22, 84, 36, 102);
    x.bezierCurveTo(50, 118, 78, 118, 92, 102);
    x.bezierCurveTo(106, 84, 100, 40, 64, 40);
    x.closePath();
  };
  strokeFill(x, berry, { fill: '#d63031', stroke: '#3a0a08', strokeWidth: 4 });
  // Highlight
  x.save(); x.clip(berry);
  const lg = x.createRadialGradient(46, 60, 0, 46, 60, 60);
  lg.addColorStop(0, 'rgba(255,255,255,0.6)');
  lg.addColorStop(0.5, 'rgba(255,255,255,0)');
  x.fillStyle = lg; x.fillRect(0, 0, 128, 128);
  const dg = x.createRadialGradient(96, 102, 0, 96, 102, 60);
  dg.addColorStop(0, 'rgba(80,0,0,0.5)');
  dg.addColorStop(0.6, 'rgba(80,0,0,0)');
  x.fillStyle = dg; x.fillRect(0, 0, 128, 128);
  x.restore();
  // Stem
  x.strokeStyle = '#3a1f0a'; x.lineWidth = 4; x.lineCap = 'round';
  x.beginPath(); x.moveTo(64, 38); x.lineTo(60, 24); x.stroke();
  // Sparkle
  sparkle(x, 44, 56, 2.6, '#fff8d4');
  return c;
}

// --- Slime bodies (shared) ---
function drawSlimeBody(ctx, cx, cy, r, palette) {
  const { base, light, dark, outline = '#0a2410' } = palette;
  const blob = () => {
    ctx.beginPath();
    // Slightly squashed dome
    ctx.moveTo(cx - r, cy + r * 0.4);
    ctx.bezierCurveTo(cx - r, cy - r * 0.3, cx - r * 0.5, cy - r, cx, cy - r);
    ctx.bezierCurveTo(cx + r * 0.5, cy - r, cx + r, cy - r * 0.3, cx + r, cy + r * 0.4);
    ctx.bezierCurveTo(cx + r * 0.7, cy + r * 0.9, cx - r * 0.7, cy + r * 0.9, cx - r, cy + r * 0.4);
    ctx.closePath();
  };
  strokeFill(ctx, blob, { fill: base, stroke: outline, strokeWidth: 4 });
  // Light highlight
  ctx.save(); ctx.clip(blob);
  const lg = ctx.createRadialGradient(cx - r * 0.4, cy - r * 0.4, 0, cx - r * 0.4, cy - r * 0.4, r * 1.2);
  lg.addColorStop(0, light);
  lg.addColorStop(0.5, 'rgba(255,255,255,0)');
  ctx.fillStyle = lg; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  // Dark shadow at base
  const dg = ctx.createRadialGradient(cx, cy + r * 0.7, 0, cx, cy + r * 0.7, r);
  dg.addColorStop(0, dark);
  dg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = dg; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
}

function drawSlimeEyes(ctx, cx, cy, r, eyeR = 0.15) {
  // Two anime eyes
  const er = r * eyeR;
  const sep = r * 0.32;
  const ey = cy - r * 0.12;
  drawEye(ctx, cx - sep, ey, er);
  drawEye(ctx, cx + sep, ey, er);
  // Mouth — small smile
  ctx.strokeStyle = '#0a2410'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.18, r * 0.15, 0.1, Math.PI - 0.1);
  ctx.stroke();
}

function slimeBody(base, light, dark, size = 96) {
  const c = makeCanvas(128); const x = ctxOf(c);
  x.clearRect(0, 0, 128, 128);
  drawSlimeBody(x, 64, 72, size / 2, { base, light, dark });
  return c;
}

function slimeBlueIcon() {
  const c = makeCanvas(128); const x = ctxOf(c);
  x.clearRect(0, 0, 128, 128);
  drawSlimeBody(x, 64, 76, 50, { base: '#5fb3ff', light: 'rgba(180,225,255,0.85)', dark: 'rgba(20,80,160,0.7)' });
  drawSlimeEyes(x, 64, 70, 50, 0.22);
  // Shine on top
  x.fillStyle = 'rgba(255,255,255,0.7)';
  x.beginPath(); x.ellipse(48, 48, 10, 4, -0.4, 0, Math.PI * 2); x.fill();
  return c;
}
function slimeGreenIcon() {
  const c = makeCanvas(128); const x = ctxOf(c);
  x.clearRect(0, 0, 128, 128);
  drawSlimeBody(x, 64, 76, 50, { base: '#7fc95a', light: 'rgba(200,255,180,0.85)', dark: 'rgba(30,80,20,0.7)' });
  drawSlimeEyes(x, 64, 70, 50, 0.22);
  x.fillStyle = 'rgba(255,255,255,0.7)';
  x.beginPath(); x.ellipse(48, 48, 10, 4, -0.4, 0, Math.PI * 2); x.fill();
  return c;
}
function slimePurpleIcon() {
  const c = makeCanvas(128); const x = ctxOf(c);
  x.clearRect(0, 0, 128, 128);
  drawSlimeBody(x, 64, 76, 50, { base: '#9d6cff', light: 'rgba(210,180,255,0.85)', dark: 'rgba(50,20,120,0.7)' });
  drawSlimeEyes(x, 64, 70, 50, 0.22);
  x.fillStyle = 'rgba(255,255,255,0.7)';
  x.beginPath(); x.ellipse(48, 48, 10, 4, -0.4, 0, Math.PI * 2); x.fill();
  return c;
}

function slimeBluePortrait() {
  const c = makeCanvas(128); const x = ctxOf(c);
  x.clearRect(0, 0, 128, 128);
  // Background — soft round vignette
  radialGlow(x, 64, 64, 80, 'rgba(180, 220, 255, 0.35)');
  // Big slime
  drawSlimeBody(x, 64, 76, 56, { base: '#5fb3ff', light: 'rgba(200,235,255,0.9)', dark: 'rgba(20,80,160,0.7)' });
  // Larger eyes
  drawSlimeEyes(x, 64, 70, 56, 0.2);
  // Big shine
  x.fillStyle = 'rgba(255,255,255,0.8)';
  x.beginPath(); x.ellipse(46, 46, 14, 6, -0.5, 0, Math.PI * 2); x.fill();
  // Tiny shadow under slime
  x.fillStyle = 'rgba(0,0,0,0.18)';
  x.beginPath(); x.ellipse(64, 120, 30, 5, 0, 0, Math.PI * 2); x.fill();
  // Sparkles
  sparkle(x, 100, 40, 3, '#fff');
  sparkle(x, 24, 100, 2.4, '#fff');
  return c;
}

// =============================================================
// STANDALONE PORTRAITS + ICONS
// =============================================================

function slimeGreenPortrait() {
  const c = makeCanvas(128); const x = ctxOf(c);
  x.clearRect(0, 0, 128, 128);
  radialGlow(x, 64, 64, 80, 'rgba(200, 255, 180, 0.4)');
  drawSlimeBody(x, 64, 76, 56, { base: '#7fc95a', light: 'rgba(220,255,200,0.9)', dark: 'rgba(30,80,20,0.7)' });
  drawSlimeEyes(x, 64, 70, 56, 0.2);
  x.fillStyle = 'rgba(255,255,255,0.8)';
  x.beginPath(); x.ellipse(46, 46, 14, 6, -0.5, 0, Math.PI * 2); x.fill();
  x.fillStyle = 'rgba(0,0,0,0.18)';
  x.beginPath(); x.ellipse(64, 120, 30, 5, 0, 0, Math.PI * 2); x.fill();
  // Two leaf sprouts on top (the "Blatt-Schleim")
  const sprout = (sx) => {
    x.strokeStyle = '#1d4a18'; x.lineWidth = 3; x.lineCap = 'round';
    x.beginPath(); x.moveTo(sx, 30); x.quadraticCurveTo(sx - 4, 16, sx - 8, 10); x.stroke();
    x.fillStyle = '#4ea43a';
    x.beginPath(); x.ellipse(sx - 8, 10, 6, 3, -0.5, 0, Math.PI * 2); x.fill();
  };
  sprout(58); sprout(70);
  sparkle(x, 100, 40, 3, '#fff');
  return c;
}

function slimePurplePortrait() {
  const c = makeCanvas(128); const x = ctxOf(c);
  x.clearRect(0, 0, 128, 128);
  radialGlow(x, 64, 64, 80, 'rgba(210, 180, 255, 0.45)');
  drawSlimeBody(x, 64, 76, 56, { base: '#9d6cff', light: 'rgba(220,200,255,0.9)', dark: 'rgba(50,20,120,0.7)' });
  // Angry eyes (slanted) + frown — the "Nebel-Schleim" is angrier
  const er = 11, sep = 18, ey = 70;
  x.fillStyle = '#fff';
  x.beginPath(); x.ellipse(64 - sep, ey, er, er * 1.25, 0.2, 0, Math.PI * 2); x.fill();
  x.beginPath(); x.ellipse(64 + sep, ey, er, er * 1.25, -0.2, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#0a2410';
  x.beginPath(); x.arc(64 - sep, ey + 1, er * 0.65, 0, Math.PI * 2); x.fill();
  x.beginPath(); x.arc(64 + sep, ey + 1, er * 0.65, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#fff';
  x.beginPath(); x.arc(64 - sep - 3, ey - 3, er * 0.3, 0, Math.PI * 2); x.fill();
  x.beginPath(); x.arc(64 + sep - 3, ey - 3, er * 0.3, 0, Math.PI * 2); x.fill();
  // Frown
  x.strokeStyle = '#0a2410'; x.lineWidth = 2.5; x.lineCap = 'round';
  x.beginPath(); x.arc(64, 92, 6, Math.PI + 0.4, -0.4, true); x.stroke();
  x.fillStyle = 'rgba(255,255,255,0.8)';
  x.beginPath(); x.ellipse(46, 46, 14, 6, -0.5, 0, Math.PI * 2); x.fill();
  x.fillStyle = 'rgba(0,0,0,0.18)';
  x.beginPath(); x.ellipse(64, 120, 30, 5, 0, 0, Math.PI * 2); x.fill();
  // Mist particles around
  x.fillStyle = 'rgba(180, 160, 220, 0.5)';
  for (const [mx, my, mr] of [[20, 30, 6], [108, 24, 5], [16, 90, 7], [114, 96, 6]]) {
    x.beginPath(); x.arc(mx, my, mr, 0, Math.PI * 2); x.fill();
  }
  sparkle(x, 96, 36, 2.6, '#fff');
  return c;
}

function bossNebelkolossPortrait() {
  const c = makeCanvas(128); const x = ctxOf(c);
  x.clearRect(0, 0, 128, 128);
  // Dark vignette background
  const bg = x.createRadialGradient(64, 64, 10, 64, 64, 80);
  bg.addColorStop(0, '#5d4d7a');
  bg.addColorStop(0.6, '#2a1f3a');
  bg.addColorStop(1, '#0a0510');
  x.fillStyle = bg; x.fillRect(0, 0, 128, 128);
  // Mist around boss
  x.fillStyle = 'rgba(180, 160, 220, 0.45)';
  for (const [mx, my, mr] of [[16, 30, 14], [112, 28, 12], [12, 100, 18], [116, 96, 14], [22, 64, 10], [106, 64, 10]]) {
    x.beginPath(); x.arc(mx, my, mr, 0, Math.PI * 2); x.fill();
  }
  // Body (hulking silhouette)
  const body = () => {
    x.beginPath();
    x.moveTo(28, 122);
    x.bezierCurveTo(20, 90, 22, 60, 36, 50);
    x.bezierCurveTo(28, 36, 40, 14, 64, 16);
    x.bezierCurveTo(88, 14, 100, 36, 92, 50);
    x.bezierCurveTo(106, 60, 108, 90, 100, 122);
    x.closePath();
  };
  strokeFill(x, body, { fill: '#3a2a5a', stroke: '#0a0510', strokeWidth: 4 });
  // Body shading
  x.save(); x.clip(body);
  const dg = x.createLinearGradient(0, 0, 128, 0);
  dg.addColorStop(0, 'rgba(120,90,180,0.5)');
  dg.addColorStop(0.5, 'rgba(0,0,0,0)');
  dg.addColorStop(1, 'rgba(0,0,0,0.5)');
  x.fillStyle = dg; x.fillRect(0, 0, 128, 128);
  // Chest core (glowing)
  radialGlow(x, 64, 76, 24, 'rgba(180, 130, 255, 0.85)');
  radialGlow(x, 64, 76, 12, 'rgba(255, 240, 255, 0.95)');
  x.fillStyle = '#fff';
  x.beginPath(); x.arc(64, 76, 4, 0, Math.PI * 2); x.fill();
  // Eyes (glowing, angry)
  radialGlow(x, 50, 40, 12, 'rgba(255, 120, 80, 0.8)');
  radialGlow(x, 78, 40, 12, 'rgba(255, 120, 80, 0.8)');
  x.fillStyle = '#ffe0a0';
  x.beginPath(); x.ellipse(50, 40, 5, 3, 0, 0, Math.PI * 2); x.fill();
  x.beginPath(); x.ellipse(78, 40, 5, 3, 0, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#0a0510';
  x.beginPath(); x.ellipse(50, 40, 2.5, 1.5, 0, 0, Math.PI * 2); x.fill();
  x.beginPath(); x.ellipse(78, 40, 2.5, 1.5, 0, 0, Math.PI * 2); x.fill();
  // Horns
  const horn = (hx, hdir) => {
    x.fillStyle = '#1a0e2a';
    x.beginPath();
    x.moveTo(hx, 18);
    x.lineTo(hx + hdir * 6, 8);
    x.lineTo(hx + hdir * 12, 18);
    x.closePath(); x.fill();
    x.strokeStyle = '#0a0510'; x.lineWidth = 1.5;
    x.beginPath();
    x.moveTo(hx, 18); x.lineTo(hx + hdir * 6, 8); x.lineTo(hx + hdir * 12, 18);
    x.stroke();
  };
  horn(50, -1); horn(78, 1);
  // Tattered cloth / shoulder pads
  x.fillStyle = '#4a2a6a';
  x.beginPath();
  x.moveTo(20, 64); x.lineTo(36, 56); x.lineTo(40, 78); x.lineTo(22, 90); x.closePath(); x.fill();
  x.beginPath();
  x.moveTo(108, 64); x.lineTo(92, 56); x.lineTo(88, 78); x.lineTo(106, 90); x.closePath(); x.fill();
  x.strokeStyle = '#0a0510'; x.lineWidth = 1.5;
  x.beginPath();
  x.moveTo(20, 64); x.lineTo(36, 56); x.lineTo(40, 78); x.lineTo(22, 90); x.closePath(); x.stroke();
  x.beginPath();
  x.moveTo(108, 64); x.lineTo(92, 56); x.lineTo(88, 78); x.lineTo(106, 90); x.closePath(); x.stroke();
  x.restore();
  // Sparkles in mist
  sparkle(x, 30, 26, 2, '#fff');
  sparkle(x, 100, 110, 2.4, '#fff');
  sparkle(x, 18, 80, 1.6, '#fff');
  return c;
}

function bossNebelkolossIcon(size = 48) {
  const c = makeCanvas(size); const x = ctxOf(c);
  // Dark vignette
  const bg = x.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  bg.addColorStop(0, '#4a3a6a');
  bg.addColorStop(1, '#0a0510');
  x.fillStyle = bg; x.fillRect(0, 0, size, size);
  const s = size / 128; // scale
  // Body
  x.fillStyle = '#3a2a5a';
  x.beginPath();
  x.moveTo(28*s, 122*s);
  x.bezierCurveTo(20*s, 90*s, 22*s, 60*s, 36*s, 50*s);
  x.bezierCurveTo(28*s, 36*s, 40*s, 14*s, 64*s, 16*s);
  x.bezierCurveTo(88*s, 14*s, 100*s, 36*s, 92*s, 50*s);
  x.bezierCurveTo(106*s, 60*s, 108*s, 90*s, 100*s, 122*s);
  x.closePath(); x.fill();
  x.strokeStyle = '#0a0510'; x.lineWidth = 2; x.stroke();
  // Glowing eyes
  x.fillStyle = '#ffe0a0';
  x.beginPath(); x.ellipse(50*s, 40*s, 3.5*s, 2*s, 0, 0, Math.PI * 2); x.fill();
  x.beginPath(); x.ellipse(78*s, 40*s, 3.5*s, 2*s, 0, 0, Math.PI * 2); x.fill();
  // Chest core
  x.fillStyle = '#fff';
  x.beginPath(); x.arc(64*s, 76*s, 2.5*s, 0, Math.PI * 2); x.fill();
  return c;
}

// =============================================================
// ATLAS ASSEMBLY (4×4 grid, 128px per cell = 512×512)
// Layout matches utils/uv_helper.js LAYOUT exactly.
// =============================================================

const ATLAS_LAYOUT = [
  // row 0
  { col: 0, row: 0, draw: grassTile,        name: 'grass_tile' },
  { col: 1, row: 0, draw: pathTile,         name: 'path_tile' },
  { col: 2, row: 0, draw: waterTile,        name: 'water_tile' },
  { col: 3, row: 0, draw: rock,             name: 'rock' },
  // row 1
  { col: 0, row: 1, draw: tree,             name: 'tree' },
  { col: 1, row: 1, draw: house,            name: 'house' },
  { col: 2, row: 1, draw: shrine,           name: 'shrine' },
  { col: 3, row: 1, draw: minimap,          name: 'minimap' },
  // row 2
  { col: 0, row: 2, draw: heartFull,        name: 'heart_full' },
  { col: 1, row: 2, draw: heartEmpty,       name: 'heart_empty' },
  { col: 2, row: 2, draw: crystal,          name: 'crystal' },
  { col: 3, row: 2, draw: berry,            name: 'berry' },
  // row 3
  { col: 0, row: 3, draw: slimeBlueIcon,    name: 'slime_blue_icon' },
  { col: 1, row: 3, draw: slimeGreenIcon,   name: 'slime_green_icon' },
  { col: 2, row: 3, draw: slimePurpleIcon,  name: 'slime_purple_icon' },
  { col: 3, row: 3, draw: slimeBluePortrait, name: 'slime_blue_portrait' },
];

function buildAtlas() {
  const c = makeCanvas(512); const x = ctxOf(c);
  for (const cell of ATLAS_LAYOUT) {
    const sub = cell.draw();
    x.drawImage(sub, cell.col * 128, cell.row * 128);
  }
  return c;
}

// =============================================================
// EXPORTS
// =============================================================

export const AssetGen = {
  /**
   * Generate the 512×512 texture atlas (16 cells) as one canvas.
   * Use as the source for THREE.CanvasTexture.
   */
  atlas() { return buildAtlas(); },

  /**
   * Generate all 21 named assets and return them in a Map.
   * Keys match the original PNG filenames so consumers can keep
   * using their existing names without code changes.
   */
  generateAll() {
    const map = new Map();
    map.set('texture_atlas.png', buildAtlas());
    // 12 atlas cells that also have standalone files
    const cells = ATLAS_LAYOUT.filter((c) => c.name !== 'slime_blue_portrait');
    for (const cell of cells) {
      map.set(`${cell.name}.png`, cell.draw());
    }
    // slime_blue_portrait.png is the cell at (3,3) of the atlas
    map.set('slime_blue_portrait.png', slimeBluePortrait());
    // Standalone portraits & icon (not in atlas)
    map.set('slime_green_portrait.png', slimeGreenPortrait());
    map.set('slime_purple_portrait.png', slimePurplePortrait());
    map.set('boss_nebelkoloss_portrait.png', bossNebelkolossPortrait());
    map.set('boss_nebelkoloss_icon.png', bossNebelkolossIcon(48));
    return map;
  },

  /** 16 atlas cell functions. */
  cells: {
    grassTile, pathTile, waterTile, rock,
    tree, house, shrine, minimap,
    heartFull, heartEmpty, crystal, berry,
    slimeBlueIcon, slimeGreenIcon, slimePurpleIcon, slimeBluePortrait,
  },

  /** 5 standalone portrait/icon functions. */
  portraits: {
    slimeGreen: slimeGreenPortrait,
    slimeBlue: slimeBluePortrait,
    slimePurple: slimePurplePortrait,
    bossNebelkoloss: bossNebelkolossPortrait,
  },
  icons: {
    bossNebelkoloss: bossNebelkolossIcon,
  },

  /**
   * Generate a PWA icon (192 or 512 px). Stylized Lumina emblem:
   * blue crystal on dark background with a gold ring and rune marks.
   * Used for manifest.webmanifest (run `AssetGen.exportAll()` in the
   * browser console once to write assets/icon-{192,512}.png to disk).
   */
  pwaIcon(size = 192) {
    const c = makeCanvas(size); const x = ctxOf(c);
    // Dark vignette
    const bg = x.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    bg.addColorStop(0, '#1d4d8a');
    bg.addColorStop(0.6, '#0c1118');
    bg.addColorStop(1, '#020407');
    x.fillStyle = bg; x.fillRect(0, 0, size, size);
    // Outer gold ring
    x.strokeStyle = '#caa14a';
    x.lineWidth = size * 0.03;
    x.beginPath(); x.arc(size/2, size/2, size * 0.42, 0, Math.PI * 2); x.stroke();
    x.strokeStyle = '#fff2c5';
    x.lineWidth = size * 0.008;
    x.beginPath(); x.arc(size/2, size/2, size * 0.42, 0, Math.PI * 2); x.stroke();
    // Inner rune ring (4 marks)
    x.fillStyle = '#caa14a';
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
      const px = size/2 + Math.cos(a) * size * 0.36;
      const py = size/2 + Math.sin(a) * size * 0.36;
      x.beginPath();
      x.moveTo(px, py - size * 0.025);
      x.lineTo(px + size * 0.012, py);
      x.lineTo(px, py + size * 0.025);
      x.lineTo(px - size * 0.012, py);
      x.closePath(); x.fill();
    }
    // Central crystal
    const s = size * 0.5; const cx = size/2; const cy = size/2;
    radialGlow(x, cx, cy, s * 0.9, 'rgba(120, 200, 255, 0.4)');
    radialGlow(x, cx, cy, s * 0.5, 'rgba(180, 230, 255, 0.6)');
    const diamond = () => {
      x.beginPath();
      x.moveTo(cx, cy - s * 0.45);
      x.lineTo(cx + s * 0.4, cy);
      x.lineTo(cx, cy + s * 0.45);
      x.lineTo(cx - s * 0.4, cy);
      x.closePath();
    };
    strokeFill(x, diamond, { fill: '#5fb3ff', stroke: '#0a1d3a', strokeWidth: size * 0.02 });
    x.save(); x.clip(diamond);
    x.fillStyle = 'rgba(255,255,255,0.55)';
    x.beginPath();
    x.moveTo(cx, cy - s * 0.45); x.lineTo(cx + s * 0.4, cy); x.lineTo(cx, cy); x.closePath(); x.fill();
    x.fillStyle = 'rgba(0,30,80,0.4)';
    x.beginPath();
    x.moveTo(cx, cy + s * 0.45); x.lineTo(cx + s * 0.4, cy); x.lineTo(cx, cy); x.closePath(); x.fill();
    x.restore();
    x.strokeStyle = '#0a1d3a'; x.lineWidth = size * 0.01; x.lineJoin = 'round';
    x.beginPath();
    x.moveTo(cx, cy - s * 0.45); x.lineTo(cx, cy + s * 0.45);
    x.moveTo(cx - s * 0.4, cy); x.lineTo(cx + s * 0.4, cy);
    x.stroke();
    // Top highlight
    x.fillStyle = 'rgba(255,255,255,0.85)';
    x.beginPath();
    x.moveTo(cx, cy - s * 0.4); x.lineTo(cx + s * 0.18, cy - s * 0.05);
    x.lineTo(cx, cy - s * 0.02); x.closePath(); x.fill();
    // Sparkles
    sparkle(x, cx - s * 0.3, cy - s * 0.3, size * 0.04, '#fff');
    sparkle(x, cx + s * 0.3, cy + s * 0.25, size * 0.03, '#fff');
    return c;
  },

  /**
   * Trigger a browser download for every named asset.
   * Run from the dev-tools console after loading the game:
   *   AssetGen.exportAll();
   * This produces 21 PNGs (atlas + cells + standalone) plus
   * assets/icon-192.png and assets/icon-512.png for the PWA manifest.
   * Useful for screenshots, marketing, or providing actual files for
   * a static host that doesn't run JS.
   */
  exportAll() {
    const map = this.generateAll();
    map.set('icon-192.png', this.pwaIcon(192));
    map.set('icon-512.png', this.pwaIcon(512));
    for (const [name, canvas] of map) {
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = name;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, 'image/png');
    }
    return map.size;
  },
};

// Expose for the dev-tools console in the browser
if (typeof window !== 'undefined') /** @type {any} */ (window).AssetGen = AssetGen;
