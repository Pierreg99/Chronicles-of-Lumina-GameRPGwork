// main.js — Bootstrap. Game class in core/game.js does the rest.
import { installGlobalErrorDisplay } from './utils/error-display.js';

// Install error overlay FIRST so any subsequent init error is visible
installGlobalErrorDisplay();

try {
  const canvas = document.getElementById('game');
  if (!canvas) {
    document.body.innerHTML = '<div style="padding:24px;color:#fff;background:#0e1116;font-family:system-ui"><h2>Canvas #game nicht gefunden</h2><p>game.html / index.html muss &lt;canvas id="game"&gt; enthalten.</p></div>';
  } else {
    const { Game } = await import('./core/game.js');
    window.__luminaGame = new Game(canvas);
  }
} catch (err) {
  console.error('[lumina] init failed', err);
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;inset:0;display:grid;place-items:center;background:#0e1116;color:#ffaaaa;font-family:system-ui;padding:24px;text-align:center;z-index:99999';
  div.innerHTML = `<div style="max-width:520px"><h2>Spiel-Init fehlgeschlagen</h2><pre style="font-size:11px;background:#200;padding:12px;border-radius:6px;text-align:left;overflow:auto;max-height:50vh">${(err && err.stack) || err}</pre></div>`;
  document.body.appendChild(div);
}
