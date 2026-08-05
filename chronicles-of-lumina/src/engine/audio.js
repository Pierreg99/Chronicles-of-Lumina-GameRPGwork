// engine/audio.js — Web Audio API engine.
//
// Phase 4 expansion: layered music with crossfade. Each layer is a long-
// running oscillator/gain node tree that can be faded in or out without
// re-triggering. SFX use one-shot oscillators as before.
//
// Phase 18: SFX are pre-rendered into a single AudioBuffer ("audio sprite")
// at first use. Each preset occupies a fixed slice; playback uses
// `BufferSource.start(when, offset, duration)` which avoids per-shot
// oscillator allocation entirely.

import { CONFIG } from '../core/config.js';

const SAMPLE_RATE_FALLBACK = 44100;
const SPRITE_PADDING_SEC    = 0.05; // small gap between slices to avoid overlap artefacts

import { ERAS, currentEra } from '../core/era.js';

// Each era has its own SFX palette. Era 1 = chiptune (square wave, low pitch).
// Era 2 = richer 16-bit (sawtooth + small vibrato). Era 3 = modern orchestral
// (sine + longer attack). Same logical names, different sound.
const SFX_PRESETS = {
  [ERAS.EIGHT_BIT]: {
    swing:    [220,   90, 0.10, 'square'],
    hit:      [180,   60, 0.12, 'square'],
    pickup:   [660,  990, 0.15, 'square'],
    interact: [440,  550, 0.12, 'square'],
    shrine:   [330,  880, 0.90, 'square'],
    era_advance: [440, 220, 0.50, 'square'],   // 8-bit warp
  },
  [ERAS.SIXTEEN_BIT]: {
    swing:    [220,   90, 0.12, 'sawtooth'],
    hit:      [180,   60, 0.15, 'square'],
    pickup:   [660,  990, 0.20, 'sine'],
    interact: [440,  550, 0.15, 'sine'],
    shrine:   [330,  880, 1.20, 'sine'],
    era_advance: [330, 880, 0.80, 'sawtooth'], // 16-bit warp
  },
  [ERAS.THREE_D]: {
    swing:    [330,  110, 0.15, 'sawtooth'],
    hit:      [220,   80, 0.18, 'square'],
    pickup:   [880, 1320, 0.25, 'sine'],
    interact: [550,  660, 0.18, 'sine'],
    shrine:   [440, 1100, 1.50, 'sine'],
    era_advance: [110, 880, 1.20, 'sine'],     // 3D warp (sweep)
  },
};

let _ctx = null;
let _muted = false;
let _master = null;
let _sfxGain = null;
let _musicGain = null;
let _layers = new Map();   // name → { nodes: [], gain: GainNode, currentGain: number, targetGain: number }

// ── SFX sprite (Phase 18) ─────────────────────────────────
// _sprite = AudioBuffer with all presets concatenated; _spriteIndex = name → [offset, duration]
let _sprite = /** @type {AudioBuffer | null} */ (null);
let _spriteIndex = /** @type {Record<string, [number, number]>} */ ({});

function ensure() {
  if (_ctx) return _ctx;
  const AC = /** @type {any} */ (window).AudioContext || /** @type {any} */ (window).webkitAudioContext;
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
  _buildSfxSprite();
  return _ctx;
}

/** Renders one preset (pitch1, pitch2, durSec, type) into a Float32Array. */
function _renderPreset(p1, p2, dur, type, sampleRate) {
  const n = Math.max(1, Math.floor(dur * sampleRate));
  const out = new Float32Array(n);
  // Standard ADSR-ish: instant attack, exponential decay.
  // Frequency sweep from p1 to p2 (exponential).
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const k = t / dur;
    const freq = p1 * Math.pow(p2 / p1, k);
    const phase = 2 * Math.PI * freq * t;
    let s;
    switch (type) {
      case 'square':   s = Math.sign(Math.sin(phase)); break;
      case 'sawtooth': s = 2 * (phase / (2 * Math.PI) - Math.floor(0.5 + phase / (2 * Math.PI))); break;
      case 'sine':
      default:         s = Math.sin(phase);
    }
    // Exponential decay envelope
    const env = Math.exp(-k * 4);
    out[i] = s * env * 0.18;
  }
  return out;
}

/** Builds the combined SFX buffer; safe to call multiple times. */
function _buildSfxSprite() {
  if (!_ctx) return;
  // Re-build on every era change (the sprite is era-specific)
  _sprite = null;
  _spriteIndex = {};
  const sr = _ctx.sampleRate || SAMPLE_RATE_FALLBACK;
  // Use the CURRENT era's SFX presets (so era 1, 2, 3 each get their own sprite)
  const era = currentEra();
  const eraPresets = SFX_PRESETS[era] || {};
  // First pass: compute durations to know the total length
  let total = 0;
  /** @type {Array<{name: string, dur: number, p1: number, p2: number, type: string}>} */
  const meta = [];
  for (const [name, cfg] of Object.entries(eraPresets)) {
    const p1 = /** @type {number} */ (cfg[0]);
    const p2 = /** @type {number} */ (cfg[1]);
    const dur = /** @type {number} */ (cfg[2]);
    const type = /** @type {string} */ (cfg[3]);
    const padded = dur + SPRITE_PADDING_SEC;
    meta.push({ name, dur, p1, p2, type });
    _spriteIndex[name] = [total, dur];
    total += padded;
  }
  // Allocate one buffer + fill
  const buf = _ctx.createBuffer(1, Math.ceil(total * sr), sr);
  const data = buf.getChannelData(0);
  let cursor = 0;
  for (const m of meta) {
    const slice = _renderPreset(m.p1, m.p2, m.dur, m.type, sr);
    const offsetSamples = Math.floor(cursor * sr);
    for (let i = 0; i < slice.length; i++) data[offsetSamples + i] = slice[i];
    cursor += m.dur + SPRITE_PADDING_SEC;
  }
  _sprite = buf;
}

// ── SFX (Phase 18: from sprite) ───────────────────────────
export function playSfx(name) {
  if (_muted) return;
  const ctx = ensure();
  if (!ctx || !_sprite) {
    // Fallback: synthesize live if sprite build failed (e.g. very old browser)
    _playSfxLegacy(name, ctx);
    return;
  }
  // Lazy-rebuild sprite on era change (era 1 -> 2 -> 3 -> 1, etc.)
  if (!_sprite || (_lastBuiltEra !== undefined && _lastBuiltEra !== currentEra())) {
    _buildSfxSprite();
    _lastBuiltEra = currentEra();
  }
  const slot = _spriteIndex[name];
  if (!slot) return;
  const [offset, dur] = slot;
  const src = ctx.createBufferSource();
  src.buffer = _sprite;
  const g = ctx.createGain();
  g.gain.setValueAtTime(1, ctx.currentTime);
  src.connect(g).connect(_sfxGain);
  src.start(ctx.currentTime, offset, dur);
}

/** Fallback path for browsers without reliable AudioBuffer rendering. */
function _playSfxLegacy(name, ctx) {
  if (!ctx) return;
  const cfg = (SFX_PRESETS[currentEra()] || {})[name] || [440, 440, 0.10, 'sine'];
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

/** Number of SFX presets baked into the sprite. Exposed for diagnostics. */
export function sfxSpriteSize() {
  const eraPresets = SFX_PRESETS[currentEra()] || {};
  return Object.keys(eraPresets).length;
}

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
