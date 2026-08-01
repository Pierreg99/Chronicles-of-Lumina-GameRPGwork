// engine/audio.js — Web Audio API engine.
//
// Phase 4 expansion: layered music with crossfade. Each layer is a long-
// running oscillator/gain node tree that can be faded in or out without
// re-triggering. SFX use one-shot oscillators as before.

import { CONFIG } from '../core/config.js';

const SFX_PRESETS = {
  swing:    [220,  90, 0.12, 'sawtooth'],
  hit:      [180,  60, 0.15, 'square'],
  pickup:   [660, 990, 0.20, 'sine'],
  interact: [440, 550, 0.15, 'sine'],
  shrine:   [330, 880, 1.20, 'sine'],
};

let _ctx = null;
let _muted = false;
let _master = null;
let _sfxGain = null;
let _musicGain = null;
let _layers = new Map();   // name → { nodes: [], gain: GainNode, currentGain: number, targetGain: number }

function ensure() {
  if (_ctx) return _ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  _ctx = new AC();
  _master = _ctx.createGain();
  _master.gain.value = CONFIG.audio.masterGain;
  _master.connect(_ctx.destination);
  _sfxGain = _ctx.createGain();
  _sfxGain.gain.value = CONFIG.audio.sfxGain;
  _sfxGain.connect(_master);
  _musicGain = _ctx.createGain();
  _musicGain.gain.value = CONFIG.audio.musicGain;
  _musicGain.connect(_master);
  return _ctx;
}

// ── SFX (unchanged API) ───────────────────────────────────
export function playSfx(name) {
  if (_muted) return;
  const ctx = ensure();
  if (!ctx) return;
  const cfg = SFX_PRESETS[name] || [440, 440, 0.10, 'sine'];
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g); g.connect(_sfxGain);
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

// ── Layered music (Phase 4) ───────────────────────────────
//
// Each layer is a procedural oscillator tree. Layers are created lazily and
// cross-faded. Use case: AMBIENT layer always plays; COMBAT layer fades in
// when an enemy is near and fades out when combat ends.

function _createAmbientLayer() {
  const ctx = ensure();
  if (!ctx) return null;
  const a = ctx.createOscillator(); a.type = 'sine';     a.frequency.value = 220;
  const b = ctx.createOscillator(); b.type = 'sine';     b.frequency.value = 330;
  const filt = ctx.createBiquadFilter();
  filt.type = 'lowpass'; filt.frequency.value = 800;
  const g = ctx.createGain(); g.gain.value = 0;
  a.connect(filt); b.connect(filt); filt.connect(g).connect(_musicGain);
  a.start(); b.start();
  return { nodes: [a, b, filt, g], gain: g, current: 0, target: 0 };
}

function _createCombatLayer() {
  const ctx = ensure();
  if (!ctx) return null;
  // Simple rhythmic pulse: a square at 110Hz pulsed by a low LFO.
  const carrier = ctx.createOscillator(); carrier.type = 'square'; carrier.frequency.value = 110;
  const lfo = ctx.createOscillator();   lfo.type = 'sine';        lfo.frequency.value = 4;
  const lfoGain = ctx.createGain(); lfoGain.gain.value = 40; // ±40Hz vibrato
  const filt = ctx.createBiquadFilter();
  filt.type = 'lowpass'; filt.frequency.value = 600;
  const g = ctx.createGain(); g.gain.value = 0;
  lfo.connect(lfoGain).connect(carrier.frequency);
  carrier.connect(filt).connect(g).connect(_musicGain);
  carrier.start(); lfo.start();
  return { nodes: [carrier, lfo, lfoGain, filt, g], gain: g, current: 0, target: 0 };
}

const LAYER_FACTORIES = {
  ambient: _createAmbientLayer,
  combat:  _createCombatLayer,
};

const LAYER_TARGET_GAIN = {
  ambient: CONFIG.music.ambientGain,
  combat:  CONFIG.music.combatGain,
};

// Per-frame crossfade toward target. dt is real seconds.
export function updateAudio(dt) {
  if (!_ctx) return;
  const fade = Math.min(1, dt / CONFIG.music.crossfadeSec);
  for (const layer of _layers.values()) {
    const next = layer.gain.gain.value + (layer.target - layer.gain.gain.value) * fade;
    layer.gain.gain.setValueAtTime(next, _ctx.currentTime);
    layer.current = next;
  }
}

export function playLayer(name) {
  if (_muted) return;
  const ctx = ensure();
  if (!ctx) return;
  let layer = _layers.get(name);
  if (!layer) {
    const factory = LAYER_FACTORIES[name];
    if (!factory) return;
    layer = factory();
    if (!layer) return;
    _layers.set(name, layer);
  }
  layer.target = LAYER_TARGET_GAIN[name] ?? 0.2;
}

export function stopLayer(name) {
  const layer = _layers.get(name);
  if (!layer) return;
  layer.target = 0;
}

export function stopAllLayers() {
  for (const name of _layers.keys()) stopLayer(name);
}
