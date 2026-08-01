// engine/audio.js — single shared audio helper. Web Audio API, no assets.

const PRESETS = {
  swing:    [220,  90, 0.12, 'sawtooth'],
  hit:      [180,  60, 0.15, 'square'],
  pickup:   [660, 990, 0.20, 'sine'],
  interact: [440, 550, 0.15, 'sine'],
  shrine:   [330, 880, 1.20, 'sine'],
};

let _ctx = null;
let _muted = false;

function ensure() {
  if (_ctx) return _ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  _ctx = new AC();
  return _ctx;
}

export function playSfx(name) {
  if (_muted) return;
  const ctx = ensure();
  if (!ctx) return;
  const cfg = PRESETS[name] || [440, 440, 0.10, 'sine'];
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  const t = ctx.currentTime;
  o.type = cfg[3];
  o.frequency.setValueAtTime(cfg[0], t);
  o.frequency.exponentialRampToValueAtTime(cfg[1], t + cfg[2]);
  g.gain.setValueAtTime(0.18, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + cfg[2]);
  o.start(t);
  o.stop(t + cfg[2]);
}

export function setMuted(m) { _muted = !!m; }
export function isMuted() { return _muted; }
export function toggleMute() { _muted = !_muted; return _muted; }
