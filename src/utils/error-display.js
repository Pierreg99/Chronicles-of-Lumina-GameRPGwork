// utils/error-display.js — global error overlay for the deployed game.
// Catches uncaught errors and promise rejections, shows them in a visible
// overlay so the user can see what's broken instead of a black screen.

let _overlay = null;

function ensure() {
  if (_overlay) return _overlay;
  _overlay = document.createElement('div');
  _overlay.id = 'err-overlay';
  Object.assign(_overlay.style, {
    position: 'fixed', left: '12px', right: '12px', top: '12px',
    maxHeight: '60vh', overflow: 'auto', zIndex: '99999',
    background: 'rgba(120,20,20,0.92)', color: '#fff',
    padding: '12px 14px', borderRadius: '8px',
    font: '12px/1.4 ui-monospace, Menlo, Consolas, monospace',
    whiteSpace: 'pre-wrap', display: 'none',
    border: '1px solid #ff8888',
  });
  document.body.appendChild(_overlay);
  return _overlay;
}

function show(title, body) {
  const o = ensure();
  o.style.display = 'block';
  const ts = new Date().toISOString().slice(11, 19);
  o.textContent = `[${ts}] ${title}\n${body}\n\n(Debug-Overlay. Schick den Text an den Entwickler.)`;
}

export function installGlobalErrorDisplay() {
  if (typeof window === 'undefined') return;
  window.addEventListener('error', (ev) => {
    show(`${ev.message || 'Error'} @ ${ev.filename || '?'}:${ev.lineno || '?'}`, ev.error?.stack || '(no stack)');
  });
  window.addEventListener('unhandledrejection', (ev) => {
    show('Unhandled Promise Rejection', String(ev.reason?.stack || ev.reason || ev));
  });
}
