// engine/voice.js — procedural vocal-style SFX ("barks") via formant
// synthesis. No audio samples — every bark is generated on demand from
// a carrier oscillator + 2-3 formant bandpass filters + ADSR envelope.
//
// Formant synthesis is the classic speech-synthesis approach: a buzz
// source (sawtooth) shaped by resonant filters at vowel-like frequencies.
// We abuse it for non-speech effects: a high-pitched "hah!" for hits,
// a low warning for low HP, a rising sweep for level-ups, etc.

/**
 * Vowel-ish formant frequencies (Hz). Standard approximations for
 * the cardinal vowels. We only use a few — barks don't need full
 * speech intelligibility, just character.
 */
const FORMANTS = {
  A: { f1: 730,  f2: 1090, f3: 2440 },
  E: { f1: 530,  f2: 1840, f3: 2480 },
  I: { f1: 270,  f2: 2290, f3: 3010 },
  O: { f1: 570,  f2: 840,  f3: 2410 },
  U: { f1: 300,  f2: 870,  f3: 2240 },
};

/**
 * Preset barks. Each is { freq, durSec, formants, attackSec, releaseSec, type }.
 * - freq: starting fundamental pitch (Hz)
 * - durSec: total duration
 * - formants: array of 2-3 formant keys from FORMANTS (mixed)
 * - attackSec: time to peak amplitude
 * - releaseSec: time to silence after attack
 * - type: 'sine' / 'sawtooth' / 'square' for the carrier
 * - freqEnd: optional ending pitch (for sweeps)
 */
const BARK_PRESETS = {
  hit:        { freq: 480, freqEnd: 320, durSec: 0.10, formants: ['A','E'],         attackSec: 0.005, releaseSec: 0.09, type: 'sawtooth', gain: 0.18 },
  hit_critical:{ freq: 720, freqEnd: 540, durSec: 0.14, formants: ['A','O'],        attackSec: 0.005, releaseSec: 0.13, type: 'sawtooth', gain: 0.22 },
  miss:       { freq: 200, freqEnd: 180, durSec: 0.08, formants: ['U','O'],         attackSec: 0.005, releaseSec: 0.07, type: 'sine',     gain: 0.10 },
  levelup:    { freq: 400, freqEnd: 880, durSec: 0.45, formants: ['E','I','A'],     attackSec: 0.02,  releaseSec: 0.30, type: 'sawtooth', gain: 0.16 },
  lowhp:      { freq: 220, freqEnd: 200, durSec: 0.30, formants: ['O','U'],         attackSec: 0.01,  releaseSec: 0.25, type: 'square',   gain: 0.14 },
  death:      { freq: 360, freqEnd: 90,  durSec: 0.80, formants: ['O','U'],         attackSec: 0.02,  releaseSec: 0.70, type: 'sawtooth', gain: 0.20 },
  pickup:     { freq: 660, freqEnd: 1320,durSec: 0.18, formants: ['A','E'],         attackSec: 0.005, releaseSec: 0.16, type: 'sine',     gain: 0.18 },
  portal:     { freq: 440, freqEnd: 880, durSec: 0.50, formants: ['I','E'],         attackSec: 0.05,  releaseSec: 0.40, type: 'sine',     gain: 0.16 },
  boss:       { freq: 100, freqEnd: 60,  durSec: 1.20, formants: ['O','U'],         attackSec: 0.05,  releaseSec: 1.10, type: 'sawtooth', gain: 0.30 },
  parry:      { freq: 800, freqEnd: 400, durSec: 0.08, formants: ['A','I'],         attackSec: 0.002, releaseSec: 0.07, type: 'square',   gain: 0.20 },
  combo:      { freq: 540, freqEnd: 720, durSec: 0.12, formants: ['E','I'],         attackSec: 0.005, releaseSec: 0.10, type: 'sawtooth', gain: 0.16 },
  ultimate:   { freq: 200, freqEnd: 1600,durSec: 1.50, formants: ['A','E','I'],     attackSec: 0.05,  releaseSec: 1.30, type: 'sawtooth', gain: 0.25 },
};

let _ctx = null;
let _master = null;
let _muted = false;

/**
 * Lazy-init the AudioContext. Must be called from a user gesture.
 */
export function ensureVoiceContext() {
  if (_ctx) return _ctx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  _ctx = new Ctx();
  _master = _ctx.createGain();
  _master.gain.value = 0.6;
  _master.connect(_ctx.destination);
  return _ctx;
}

export function setVoiceMuted(muted) {
  _muted = !!muted;
  if (_master) {
    const now = _ctx.currentTime;
    _master.gain.cancelScheduledValues(now);
    _master.gain.linearRampToValueAtTime(muted ? 0 : 0.6, now + 0.2);
  }
}

/**
 * Play a bark. Safe to call from anywhere — the function lazy-inits
 * the context on first call.
 *
 * @param {string} name — one of BARK_PRESETS keys
 * @param {object} [opts]
 * @param {number} [opts.pitchShift=0] — semitones to shift the bark (+/- 12)
 * @param {number} [opts.gainMul=1] — multiplier on the preset gain
 */
export function playBark(name, opts = {}) {
  const preset = BARK_PRESETS[name];
  if (!preset) return;
  if (_muted) return;
  const ctx = ensureVoiceContext();
  if (!ctx) return;

  // Small random pitch variation for variety (±2 semitones)
  const jitter = (Math.random() - 0.5) * 2;
  const semitones = (opts.pitchShift || 0) + jitter;
  const freqMul = Math.pow(2, semitones / 12);
  const startFreq = preset.freq * freqMul;
  const endFreq   = preset.freqEnd * freqMul;
  const dur = preset.durSec;
  const now = ctx.currentTime;

  // Carrier oscillator (the buzz)
  const carrier = ctx.createOscillator();
  carrier.type = preset.type;
  carrier.frequency.setValueAtTime(startFreq, now);
  if (endFreq !== startFreq) {
    // Exponential ramp works for downward sweeps; for upward we use linear
    if (endFreq < startFreq) {
      carrier.frequency.exponentialRampToValueAtTime(endFreq, now + dur);
    } else {
      carrier.frequency.linearRampToValueAtTime(endFreq, now + dur);
    }
  }

  // Formant filters — each is a bandpass at the formant frequency
  const filters = preset.formants.map((key) => {
    const f = FORMANTS[key];
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = f.f1;
    filt.Q.value = 8 + Math.random() * 4; // slight Q variation
    // Add second formant if present
    return filt;
  });
  // Wire the first formant, then chain additional formants via parallel sums
  const mixGain = ctx.createGain();
  mixGain.gain.value = 1 / Math.max(1, filters.length);

  // Create a separate bandpass for each formant frequency and sum
  const filterNodes = preset.formants.map((key, idx) => {
    const f = FORMANTS[key];
    const node = ctx.createBiquadFilter();
    node.type = 'bandpass';
    node.frequency.value = idx === 0 ? f.f1 : f.f2;
    node.Q.value = 6;
    const g = ctx.createGain();
    g.gain.value = 0.5;
    return { node, g };
  });

  const finalGain = ctx.createGain();
  const baseGain = preset.gain * (opts.gainMul || 1);
  finalGain.gain.setValueAtTime(0, now);
  finalGain.gain.linearRampToValueAtTime(baseGain, now + preset.attackSec);
  finalGain.gain.linearRampToValueAtTime(0, now + dur);

  // Wire: carrier → each filter → finalGain → master
  for (const { node, g } of filterNodes) {
    carrier.connect(node);
    node.connect(g);
    g.connect(finalGain);
  }
  finalGain.connect(_master);

  carrier.start(now);
  carrier.stop(now + dur + 0.05);
}

// Exported for tests
export { BARK_PRESETS, FORMANTS };
