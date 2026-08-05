// engine/sky.js — time-of-day + weather-driven sky/fog/ambient colors.
//
// The game ticks the weather system each frame, which updates the
// scene's background, fog, and ambient light. Weather states are
// per-biome: verdant can rain, dunes can sandstorm, peaks can snow.
//
// Implementation note: this module does NOT import three at the top
// so it can be loaded by Node-based unit tests. THREE is resolved
// lazily via a global (set on first applySky call) and used to mutate
// scene properties. Pure-JS tests use a fake scene with simple
// { background, fog, children } shape.

/** Phases of the day, 0..1 normalized. */
export const PHASE = {
  NIGHT:    0.00,  // 00:00 — pitch dark
  DAWN:     0.25,  // 06:00 — golden hour
  DAY:      0.50,  // 12:00 — bright
  DUSK:     0.75,  // 18:00 — sunset
  NIGHT_LATE: 0.95, // 22:48 — late night
};

/** Per-biome weather definitions: list of valid states + default. */
const WEATHER_PRESETS = {
  verdant: { states: ['clear', 'rain', 'fog'],          default: 'clear' },
  dunes:   { states: ['clear', 'sandstorm', 'clear'],  default: 'clear' },
  peaks:   { states: ['clear', 'snow', 'fog'],          default: 'clear' },
  mire:    { states: ['clear', 'fog', 'drizzle'],       default: 'fog' },
  ember:   { states: ['clear', 'ash', 'ember_rain'],    default: 'clear' },
  crystal: { states: ['clear', 'glow', 'sparkle'],     default: 'clear' },
  sky:     { states: ['clear', 'clear', 'clear'],      default: 'clear' },
  reef:    { states: ['clear', 'drizzle', 'current'],   default: 'clear' },
  haunted: { states: ['clear', 'mist', 'mist'],         default: 'mist' },
  void:    { states: ['clear', 'void_storm', 'rift'],   default: 'clear' },
  default: { states: ['clear'],                        default: 'clear' },
};

/** Sky color (RGB hex int) for a given time-of-day phase 0..1. */
const SKY_CURVE = [
  // 0.0 night, 0.15 pre-dawn, 0.30 dawn, 0.50 day, 0.70 dusk, 0.85 evening, 1.0 night
  { at: 0.00, color: 0x0a0e1f },
  { at: 0.15, color: 0x1a1a3a },
  { at: 0.25, color: 0xff9966 },  // dawn orange
  { at: 0.30, color: 0xffd4a0 },
  { at: 0.50, color: 0x8fc7e8 },  // day blue
  { at: 0.70, color: 0xffd4a0 },
  { at: 0.75, color: 0xff7755 },  // dusk red
  { at: 0.85, color: 0x2a2a4a },
  { at: 1.00, color: 0x0a0e1f },
];

/** Fog density (1.0 = baseline) for time of day. Night is thicker. */
const FOG_DENSITY_CURVE = [
  { at: 0.00, mul: 1.0 },
  { at: 0.25, mul: 0.7 },
  { at: 0.50, mul: 0.6 },
  { at: 0.75, mul: 0.7 },
  { at: 1.00, mul: 1.0 },
];

/** Ambient light intensity for time of day. */
const AMBIENT_CURVE = [
  { at: 0.00, mul: 0.25 },
  { at: 0.25, mul: 0.55 },
  { at: 0.50, mul: 1.0  },
  { at: 0.75, mul: 0.55 },
  { at: 1.00, mul: 0.25 },
];

/**
 * Linearly interpolate a curve at a normalized time `t` in [0,1].
 * Pure JS, no THREE dependency.
 */
function sampleCurve(curve, t) {
  if (t <= curve[0].at) return curve[0];
  if (t >= curve[curve.length - 1].at) return curve[curve.length - 1];
  for (let i = 1; i < curve.length; i++) {
    if (t <= curve[i].at) {
      const a = curve[i - 1], b = curve[i];
      const k = (t - a.at) / (b.at - a.at);
      if (typeof a.color === 'number' && typeof b.color === 'number') {
        return { at: t, color: lerpHex(a.color, b.color, k) };
      }
      return { at: t, mul: a.mul + (b.mul - a.mul) * k };
    }
  }
  return curve[curve.length - 1];
}

/** Lerp two 0xRRGGBB ints. */
function lerpHex(a, b, k) {
  const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
  const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
  const r = Math.round(ar + (br - ar) * k);
  const g = Math.round(ag + (bg - ag) * k);
  const c = Math.round(ab + (bb - ab) * k);
  return (r << 16) | (g << 8) | c;
}

/** Same as lerpHex but blends two hex colors against a third. */
function blendHex(a, b, k) {
  return lerpHex(a, b, k);
}

export class SkySystem {
  constructor(scene, zoneId) {
    this.scene = scene;
    this.zoneId = zoneId || 'verdant';
    // Time-of-day, 0..1 representing a full 24h cycle
    this.timeOfDay = 0.50;  // start at noon
    // Cycle length in seconds (default 10 minutes = 600s)
    this.cycleSec = 600;
    this.elapsed = 0;
    // Weather state
    this.weather = WEATHER_PRESETS[this.zoneId]?.default || 'clear';
  }

  setZone(zoneId) {
    this.zoneId = zoneId;
    this.weather = WEATHER_PRESETS[zoneId]?.default || 'clear';
  }

  /**
   * Tick the system. `dt` in seconds.
   */
  update(dt) {
    this.elapsed += dt;
    this.timeOfDay = (this.timeOfDay + dt / this.cycleSec) % 1;
  }

  /**
   * Apply current sky/fog/ambient to the scene. `baseZone` is the
   * zone's natural sky/fog/ambient colors — we lerp them by time.
   * Works with both real three.js scenes AND fake { background, fog,
   * children } scenes for testing.
   * @param {object} baseZone — { sky, fog, ambient, fogNear, fogFar }
   */
  applySky(baseZone) {
    if (!this.scene || !baseZone) return;
    const skySample = sampleCurve(SKY_CURVE, this.timeOfDay);
    const ambientSample = sampleCurve(AMBIENT_CURVE, this.timeOfDay);
    const fogSample = sampleCurve(FOG_DENSITY_CURVE, this.timeOfDay);

    // Sky: blend curve color with zone's natural sky (30% zone, 70% curve)
    const skyColor = blendHex(skySample.color, baseZone.sky, 0.3);
    this.scene.background = { r: (skyColor >> 16) & 0xff, g: (skyColor >> 8) & 0xff, b: skyColor & 0xff, hex: skyColor };

    // Fog: use base zone fog color, expand far plane at night
    if (!this.scene.fog) {
      this.scene.fog = { color: { hex: baseZone.fog }, near: baseZone.fogNear || 20, far: baseZone.fogFar || 80 };
    }
    this.scene.fog.color = { hex: baseZone.fog };
    const baseFar = baseZone.fogFar || 80;
    this.scene.fog.far = baseFar * (0.7 + 0.3 * (1 - fogSample.mul));

    // Update ambient + directional lights if they exist (real three.js)
    for (const child of this.scene.children || []) {
      if (child.isAmbientLight || (child.isLight && child.name === 'ambient')) {
        if (child.color && child.color.setHex) child.color.setHex(baseZone.ambient);
        child.intensity = ambientSample.mul;
      }
      if (child.isDirectionalLight) {
        const angle = this.timeOfDay * Math.PI * 2;
        child.position.set(
          Math.cos(angle) * 30,
          Math.max(5, Math.sin(angle) * 30 + 10),
          10
        );
        child.intensity = 0.4 + ambientSample.mul * 0.6;
      }
    }
  }

  /** Get the current weather state. */
  getWeather() {
    return this.weather;
  }

  /** Set the current weather state. */
  setWeather(state) {
    this.weather = state;
  }

  /** Get a list of valid weather states for the current zone. */
  getValidWeather() {
    return WEATHER_PRESETS[this.zoneId]?.states || ['clear'];
  }

  /** Get a label for the current time of day (00:00, 06:00, …). */
  getTimeLabel() {
    const hour = Math.floor(this.timeOfDay * 24);
    const min = Math.floor((this.timeOfDay * 24 - hour) * 60);
    return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  }

  /** Get a phase name. */
  getPhaseName() {
    const t = this.timeOfDay;
    if (t < 0.20 || t > 0.92) return 'Nacht';
    if (t < 0.32) return 'Morgenröte';
    if (t < 0.68) return 'Tag';
    if (t < 0.80) return 'Abenddämmerung';
    return 'Abend';
  }
}

// Exported for tests
export { WEATHER_PRESETS, SKY_CURVE, AMBIENT_CURVE, FOG_DENSITY_CURVE };

