// ui/perf-overlay.js — tiny FPS / frame-time / memory overlay.
//
// Activated by appending `?debug=perf` to the URL. Renders into a fixed
// <div> in the top-left. Updated every ~250ms to stay readable and cheap.

const SAMPLE_WINDOW_MS = 250;
const DECIMALS = 1;
const MAX_SAMPLES = 120; // ~30s at 4Hz

function fmtMs(ms) { return ms.toFixed(DECIMALS); }
function fmtMb(bytes) { return (bytes / 1_048_576).toFixed(1); }
function supportsMemory() {
  return typeof performance !== 'undefined'
    && /** @type {any} */ (performance).memory
    && typeof /** @type {any} */ (performance).memory.usedJSHeapSize === 'number';
}

/**
 * @param {Document} doc
 * @returns {{ el: HTMLElement, tick: (nowMs: number) => void, destroy: () => void }}
 */
export function createPerfOverlay(doc) {
  const el = doc.createElement('div');
  el.id = 'perf-overlay';
  Object.assign(el.style, {
    position: 'fixed', top: '8px', left: '8px', zIndex: '9999',
    padding: '6px 10px', borderRadius: '6px',
    background: 'rgba(0,0,0,0.65)', color: '#9eff9e',
    font: '12px/1.35 ui-monospace, Menlo, Consolas, monospace',
    pointerEvents: 'none', userSelect: 'none',
    whiteSpace: 'pre', minWidth: '170px',
    textShadow: '0 0 4px rgba(0,255,0,0.45)',
  });
  doc.body.appendChild(el);

  /** @type {number[]} */
  const samples = [];
  let lastUpdate = 0;
  let lastNow = 0;
  let maxFrame = 0;

  function updateDisplay() {
    if (samples.length === 0) {
      el.textContent = 'FPS:   --\nFrame: -- ms\nMax:   -- ms';
      return;
    }
    const sum = samples.reduce((a, b) => a + b, 0);
    const avg = sum / samples.length;
    const fps = 1000 / avg;
    let line = `FPS:   ${fps.toFixed(0)} (avg ${fmtMs(avg)} ms)\nFrame: ${fmtMs(samples[samples.length - 1])} ms\nMax:   ${fmtMs(maxFrame)} ms`;
    if (supportsMemory()) {
      const mem = /** @type {any} */ (performance).memory;
      line += `\nMem:   ${fmtMb(mem.usedJSHeapSize)} / ${fmtMb(mem.jsHeapSizeLimit)} MB`;
    }
    el.textContent = line;
  }

  return {
    el,
    /** @param {number} nowMs */
    tick(nowMs) {
      if (lastNow > 0) {
        const dt = nowMs - lastNow;
        if (dt > 0 && Number.isFinite(dt)) {
          samples.push(dt);
          if (dt > maxFrame) maxFrame = dt;
          if (samples.length > MAX_SAMPLES) samples.shift();
        }
      }
      lastNow = nowMs;
      if (nowMs - lastUpdate >= SAMPLE_WINDOW_MS) {
        lastUpdate = nowMs;
        updateDisplay();
      }
    },
    destroy() {
      el.remove();
      samples.length = 0;
    },
  };
}

/** True if the current page URL asks for the perf overlay. */
export function wantsPerfOverlay() {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('debug') === 'perf';
  } catch {
    return false;
  }
}
