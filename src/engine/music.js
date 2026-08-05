// engine/music.js — procedural ambient music synthesis.
// No audio assets: every biome gets a unique pad + arpeggio + texture
// layer built from Web Audio API oscillators and noise.
//
// Each "track" is a small chord progression loop. Layer 1 = pad (always),
// Layer 2 = arpeggio (always), Layer 3 = texture (always). Adaptive
// combat layers are added in Phase 21.

const SCALES = {
  verdant:  [220.00, 246.94, 277.18, 329.63, 369.99, 415.30], // A minor pentatonic
  dunes:    [196.00, 220.00, 246.94, 293.66, 329.63, 369.99], // G minor pentatonic
  peaks:    [261.63, 311.13, 349.23, 415.30, 466.16, 523.25], // C major
  mire:     [174.61, 207.65, 233.08, 277.18, 311.13, 349.23], // F minor
  ember:    [146.83, 174.61, 207.65, 246.94, 293.66, 329.63], // D minor
  crystal:  [329.63, 415.30, 466.16, 554.37, 622.25, 698.46], // E Lydian
  sky:      [392.00, 440.00, 523.25, 587.33, 659.25, 783.99], // G major
  reef:     [261.63, 311.13, 349.23, 392.00, 466.16, 523.25], // C mixolydian
  haunted:  [220.00, 246.94, 261.63, 311.13, 349.23, 369.99], // A dorian
  void:     [196.00, 233.08, 261.63, 311.13, 369.99, 392.00], // G phrygian
  default:  [220.00, 246.94, 277.18, 329.63, 369.99, 415.30],
};

// Biomes that share base atmospheric mood. New biomes fall back to
// 'default' (verdant) until a custom scale is defined.
const MOOD = {
  verdant: { waveform: 'sine',     filterFreq: 800,  arpRate: 0.5, padGain: 0.06 },
  dunes:   { waveform: 'triangle', filterFreq: 600,  arpRate: 0.375, padGain: 0.05 },
  peaks:   { waveform: 'sine',     filterFreq: 1400, arpRate: 0.5, padGain: 0.05 },
  mire:    { waveform: 'sawtooth', filterFreq: 500,  arpRate: 0.6, padGain: 0.05 },
  ember:   { waveform: 'sawtooth', filterFreq: 700,  arpRate: 0.4, padGain: 0.06 },
  crystal: { waveform: 'sine',     filterFreq: 2000, arpRate: 0.75, padGain: 0.05 },
  sky:     { waveform: 'sine',     filterFreq: 1200, arpRate: 0.5, padGain: 0.04 },
  reef:    { waveform: 'triangle', filterFreq: 900,  arpRate: 0.5, padGain: 0.05 },
  haunted: { waveform: 'sawtooth', filterFreq: 400,  arpRate: 0.6, padGain: 0.05 },
  void:    { waveform: 'sine',     filterFreq: 350,  arpRate: 0.33, padGain: 0.06 },
  default: { waveform: 'sine',     filterFreq: 800,  arpRate: 0.5, padGain: 0.06 },
};

const CHORD_PROGRESSIONS = {
  // [root note index in scale, intervals in semitones above root]
  minor_pentatonic: [[0, 4, 7], [3, 7, 10], [4, 7, 11], [0, 4, 7]],
  major: [[0, 4, 7], [2, 5, 9], [3, 7, 10], [4, 7, 11]],
  dorian: [[0, 3, 7], [2, 5, 9], [3, 7, 10], [0, 3, 7]],
  phrygian: [[0, 3, 7], [1, 5, 8], [3, 7, 10], [0, 3, 7]],
  lydian: [[0, 4, 7], [2, 6, 9], [4, 7, 11], [0, 4, 7]],
  mixolydian: [[0, 4, 7], [2, 5, 9], [3, 7, 10], [4, 7, 11]],
  default: [[0, 4, 7], [3, 7, 10], [4, 7, 11], [0, 4, 7]],
};

// Map biome -> progression. Phrygian/mixolydian/lydian for the more
// unusual biomes. New biomes fall back to default.
const PROGRESSION = {
  verdant: 'minor_pentatonic',
  dunes:   'minor_pentatonic',
  peaks:   'major',
  mire:    'dorian',
  ember:   'minor_pentatonic',
  crystal: 'lydian',
  sky:     'major',
  reef:    'mixolydian',
  haunted: 'dorian',
  void:    'phrygian',
  default: 'default',
};

export class MusicEngine {
  constructor() {
    /** @type {AudioContext|null} */
    this.ctx = null;
    /** @type {GainNode|null} */
    this.masterGain = null;
    this.currentZone = null;
    /** @type {any} */
    this.activeTrack = null;
    this.muted = false;
    this.started = false;
    // Phase 21+: adaptive combat layer state
    this.tensionLevel = 0;     // 0-1, ramps based on enemy proximity
    this.combatLevel = 0;      // 0-1, ramps based on recent combat
    this.lastCombatAt = -Infinity;
  }

  /**
   * Lazy-init the AudioContext. Must be called from a user gesture
   * (e.g. start button click) to comply with autoplay policies.
   */
  ensureContext() {
    if (this.ctx) return this.ctx;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    this.ctx = new Ctx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.6;
    this.masterGain.connect(this.ctx.destination);
    return this.ctx;
  }

  setMuted(muted) {
    this.muted = !!muted;
    if (this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(muted ? 0 : 0.6, now + 0.3);
    }
  }

  /**
   * Switch the ambient track to a new biome. Crossfades the old one
   * out and the new one in over `fadeSec` seconds.
   * @param {string} zoneId
   * @param {number} [fadeSec=2.5]
   */
  setZone(zoneId, fadeSec = 2.5) {
    if (zoneId === this.currentZone) return;
    this.currentZone = zoneId;
    this.ensureContext();
    if (!this.ctx) return;

    // Stop the old track (if any) with fade
    if (this.activeTrack) {
      const old = this.activeTrack;
      const now = this.ctx.currentTime;
      old.gain.gain.cancelScheduledValues(now);
      old.gain.gain.linearRampToValueAtTime(0, now + fadeSec);
      setTimeout(() => old.stop(), fadeSec * 1000 + 100);
    }

    // Start the new track with fade-in
    const track = this._createTrack(zoneId);
    if (!track) return;
    const now = this.ctx.currentTime;
    track.gain.gain.setValueAtTime(0, now);
    track.gain.gain.linearRampToValueAtTime(this.muted ? 0 : 1, now + fadeSec);
    this.activeTrack = track;
    this.started = true;
    this.tensionLevel = 0;
    this.combatLevel = 0;
  }

  /**
   * Phase 21+: ramp the tension layer (0-1) based on enemy proximity.
   * Called every frame by the game's update loop.
   * @param {number} level 0-1
   */
  setTensionLevel(level) {
    const target = Math.max(0, Math.min(1, level));
    this.tensionLevel = target;
    this._applyAdaptiveLayers();
  }

  /**
   * Phase 21+: ramp the combat layer (0-1) based on recent combat.
   * Decays naturally over `combatDecaySec` after the last hit.
   * @param {boolean} inCombat
   */
  pulseCombat(inCombat = true) {
    if (inCombat) {
      this.lastCombatAt = this.ctx ? this.ctx.currentTime : 0;
      this.combatLevel = 1;
    }
    this._applyAdaptiveLayers();
  }

  /**
   * Phase 21+: called every frame by the game loop. Decays combat
   * level over time when no fresh combat happens.
   * @param {number} now
   * @param {number} decaySec
   */
  tickCombatDecay(now, decaySec = 4) {
    if (this.combatLevel > 0 && now - this.lastCombatAt > decaySec) {
      this.combatLevel = 0;
      this._applyAdaptiveLayers();
    }
  }

  /** @private */
  _applyAdaptiveLayers() {
    if (!this.activeTrack || !this.ctx) return;
    const now = this.ctx.currentTime;
    const t = this.activeTrack.tensionGain;
    const c = this.activeTrack.combatGain;
    if (t) {
      t.gain.cancelScheduledValues(now);
      t.gain.linearRampToValueAtTime(this.tensionLevel * 0.4, now + 0.8);
    }
    if (c) {
      c.gain.cancelScheduledValues(now);
      c.gain.linearRampToValueAtTime(this.combatLevel * 0.7, now + 0.3);
    }
  }

  stop() {
    if (this.activeTrack) {
      this.activeTrack.stop();
      this.activeTrack = null;
    }
    this.started = false;
    this.currentZone = null;
    this.tensionLevel = 0;
    this.combatLevel = 0;
  }

  /**
   * Create the ambient track for a given zone. Returns the track
   * handle with stop() and gain controls.
   * @private
   */
  _createTrack(zoneId) {
    if (!this.ctx) return null;
    const mood = MOOD[zoneId] || MOOD.default;
    const scale = SCALES[zoneId] || SCALES.default;
    const progressionName = PROGRESSION[zoneId] || 'default';
    const progression = CHORD_PROGRESSIONS[progressionName] || CHORD_PROGRESSIONS.default;

    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    gain.connect(this.masterGain);

    // ── Layer 1: Pad ──
    // Three detuned oscillators playing the root of each chord in
    // the progression. Slow attack/release for a soft wash.
    const padVoices = [];
    const padUpdateIntervalMs = 8000; // change chord every 8s
    const padChord = (chordIdx) => {
      const chord = progression[chordIdx % progression.length];
      chord.forEach((semi, i) => {
        const note = scale[(chord[0] / 12 | 0) % scale.length] * Math.pow(2, semi / 12);
        // Stop previous voice for this slot if any
        if (padVoices[i]) {
          try { padVoices[i].osc.stop(); } catch (_) {}
        }
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        osc.type = mood.waveform;
        osc.frequency.value = note;
        osc.detune.value = (i - 1) * 8; // detune for thickness
        filter.type = 'lowpass';
        filter.frequency.value = mood.filterFreq;
        filter.Q.value = 0.7;
        oscGain.gain.value = 0;
        const now = this.ctx.currentTime;
        oscGain.gain.linearRampToValueAtTime(mood.padGain, now + 1.5); // 1.5s attack
        oscGain.gain.linearRampToValueAtTime(0, now + padUpdateIntervalMs / 1000); // 8s release
        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(gain);
        osc.start(now);
        osc.stop(now + padUpdateIntervalMs / 1000 + 0.1);
        padVoices[i] = { osc, gain: oscGain };
      });
    };
    padChord(0);

    // ── Layer 2: Arpeggio ──
    // Plays individual notes from the scale in a slow pattern.
    // Updates every `arpRate` seconds.
    let arpStep = 0;
    const arpInterval = setInterval(() => {
      if (!this.ctx || this.ctx.state === 'closed') return;
      const noteIdx = arpStep % scale.length;
      const note = scale[noteIdx] * 2; // one octave up
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = note;
      const now = this.ctx.currentTime;
      oscGain.gain.setValueAtTime(0, now);
      oscGain.gain.linearRampToValueAtTime(0.025, now + 0.05);
      oscGain.gain.linearRampToValueAtTime(0, now + 0.4);
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start(now);
      osc.stop(now + 0.5);
      arpStep++;
    }, mood.arpRate * 1000);

    // ── Layer 3: Texture ──
    // Filtered noise — different filter per biome mood.
    const noiseBuffer = this._createNoiseBuffer(2);
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = mood.filterFreq * 0.5;
    noiseFilter.Q.value = 1.2;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.value = 0.012;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(gain);
    noise.start();

    // ── Layer 4: Tension (Phase 21+) ──
    // Low-pass-filtered drone on a perfect fifth below the root.
    // Fades in when tensionLevel rises (enemies nearby).
    const tensionGain = this.ctx.createGain();
    tensionGain.gain.value = 0;
    tensionGain.connect(gain);
    const tensionOsc1 = this.ctx.createOscillator();
    const tensionOsc2 = this.ctx.createOscillator();
    const tensionFilter = this.ctx.createBiquadFilter();
    tensionOsc1.type = 'sawtooth';
    tensionOsc2.type = 'sawtooth';
    tensionOsc1.frequency.value = scale[0] * 0.5;     // root, octave down
    tensionOsc2.frequency.value = scale[0] * 0.75;    // fifth below
    tensionOsc1.detune.value = -8;
    tensionOsc2.detune.value =  8;
    tensionFilter.type = 'lowpass';
    tensionFilter.frequency.value = 400;
    tensionFilter.Q.value = 2.5;
    tensionOsc1.connect(tensionFilter);
    tensionOsc2.connect(tensionFilter);
    tensionFilter.connect(tensionGain);
    tensionOsc1.start();
    tensionOsc2.start();

    // ── Layer 5: Combat (Phase 21+) ──
    // Filtered noise burst every 0.2s, simulating percussion. Fades
    // in when combatLevel is high.
    const combatGain = this.ctx.createGain();
    combatGain.gain.value = 0;
    combatGain.connect(gain);
    const combatInterval = setInterval(() => {
      if (!this.ctx || this.ctx.state === 'closed') return;
      if (this.combatLevel < 0.1) return;
      const now = this.ctx.currentTime;
      const noiseBurst = this.ctx.createBufferSource();
      noiseBurst.buffer = this._createNoiseBuffer(0.1);
      const burstFilter = this.ctx.createBiquadFilter();
      burstFilter.type = 'bandpass';
      burstFilter.frequency.value = 80 + Math.random() * 200;
      burstFilter.Q.value = 3;
      const burstGain = this.ctx.createGain();
      burstGain.gain.setValueAtTime(0, now);
      burstGain.gain.linearRampToValueAtTime(0.4, now + 0.01);
      burstGain.gain.linearRampToValueAtTime(0, now + 0.08);
      noiseBurst.connect(burstFilter);
      burstFilter.connect(burstGain);
      burstGain.connect(combatGain);
      noiseBurst.start(now);
      noiseBurst.stop(now + 0.1);
    }, 200);

    // ── Layer 6: Combat melody (Phase 21+) ──
    // Higher arpeggio with shorter notes when in combat.
    const combatMelodyInterval = setInterval(() => {
      if (!this.ctx || this.ctx.state === 'closed') return;
      if (this.combatLevel < 0.5) return;
      const now = this.ctx.currentTime;
      const note = scale[Math.floor(Math.random() * scale.length)] * 2;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = note;
      oscGain.gain.setValueAtTime(0, now);
      oscGain.gain.linearRampToValueAtTime(0.04, now + 0.02);
      oscGain.gain.linearRampToValueAtTime(0, now + 0.15);
      osc.connect(oscGain);
      oscGain.connect(combatGain);
      osc.start(now);
      osc.stop(now + 0.2);
    }, 220);

    const stop = () => {
      clearInterval(arpInterval);
      clearInterval(combatInterval);
      clearInterval(combatMelodyInterval);
      try { noise.stop(); } catch (_) {}
      try { tensionOsc1.stop(); } catch (_) {}
      try { tensionOsc2.stop(); } catch (_) {}
      padVoices.forEach((v) => { try { v.osc.stop(); } catch (_) {} });
      try { gain.disconnect(); } catch (_) {}
    };

    return { gain, stop, padVoices, tensionGain, combatGain };
  }

  /**
   * Generate a 2-second white-noise buffer for texture layers.
   * @private
   */
  _createNoiseBuffer(seconds) {
    const sr = this.ctx.sampleRate;
    const buf = this.ctx.createBuffer(1, sr * seconds, sr);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    return buf;
  }
}

// Singleton — one music engine per game
export const music = new MusicEngine();

// Exported for tests
export { SCALES, MOOD, CHORD_PROGRESSIONS, PROGRESSION };
