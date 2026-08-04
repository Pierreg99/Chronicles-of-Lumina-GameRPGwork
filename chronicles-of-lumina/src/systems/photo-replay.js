// systems/photo-replay.js — photo mode + 10-second replay buffer.
//
// Photo mode: press P (or call takePhoto) to capture the game canvas
// as a PNG and trigger a download. Optionally hides UI panels first.
//
// Replay: a 10-second circular buffer of player position + camera
// yaw + current zone. On demand, can be played back at 1x speed
// (camera follows the recorded path) or exported as a sequence of
// snapshots.

const REPLAY_SECONDS = 10;
const REPLAY_FPS = 60;
const BUFFER_SIZE = REPLAY_SECONDS * REPLAY_FPS;

/**
 * Capture a snapshot of the game canvas as a PNG and trigger a
 * browser download. Safe to call from a button click — no popup
 * blockers.
 * @param {HTMLCanvasElement} canvas
 * @param {object} [opts]
 * @param {string} [opts.filename] - default 'lumina-{timestamp}.png'
 * @returns {string} data URL of the captured PNG
 */
export function takePhoto(canvas, opts = {}) {
  if (!canvas) return null;
  const dataUrl = canvas.toDataURL('image/png');
  const filename = opts.filename || `lumina-${Date.now()}.png`;

  // Trigger download via a temporary anchor
  try {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (e) {
    // iOS Safari: data URLs in <a>.download need a workaround
    // (window.open). Fall back to opening in a new tab.
    window.open(dataUrl, '_blank');
  }
  return dataUrl;
}

/**
 * Recording buffer for the replay system. Each entry is a frame
 * snapshot. The buffer is circular — once full, oldest frames are
 * overwritten.
 */
export class ReplayBuffer {
  constructor() {
    this.frames = new Array(BUFFER_SIZE);
    this.writeIdx = 0;
    this.count = 0;
    this.recording = true;
  }

  /**
   * Push a frame snapshot. Call this every frame from the game loop.
   * @param {object} frame — { t, x, y, z, yaw, zone }
   */
  push(frame) {
    if (!this.recording) return;
    this.frames[this.writeIdx] = frame;
    this.writeIdx = (this.writeIdx + 1) % BUFFER_SIZE;
    if (this.count < BUFFER_SIZE) this.count++;
  }

  /**
   * Read frames in chronological order (oldest first).
   * @returns {object[]}
   */
  readAll() {
    if (this.count === 0) return [];
    if (this.count < BUFFER_SIZE) {
      return this.frames.slice(0, this.count);
    }
    // Buffer is full — oldest is at writeIdx (next to be overwritten)
    return [
      ...this.frames.slice(this.writeIdx),
      ...this.frames.slice(0, this.writeIdx),
    ];
  }

  /** Wipe the buffer. */
  clear() {
    this.frames.fill(null);
    this.writeIdx = 0;
    this.count = 0;
  }

  pause()  { this.recording = false; }
  resume() { this.recording = true; }

  /** Total recorded frames. */
  size() { return this.count; }

  /** Total capacity. */
  capacity() { return BUFFER_SIZE; }
}

/**
 * Get the buffer capacity for diagnostics / tests.
 */
export function getReplayConfig() {
  return { seconds: REPLAY_SECONDS, fps: REPLAY_FPS, capacity: BUFFER_SIZE };
}

/**
 * Coarse "highlight reel" — picks N evenly-spaced frames from the
 * buffer for a quick scrub UI. Returns at most 20 frames.
 */
export function getHighlights(buffer) {
  const all = buffer.readAll();
  if (all.length === 0) return [];
  const target = Math.min(20, all.length);
  if (all.length <= target) return all;
  const step = (all.length - 1) / (target - 1);
  const out = [];
  for (let i = 0; i < target; i++) {
    out.push(all[Math.floor(i * step)]);
  }
  return out;
}

/**
 * Compute a "score" for the highlight reel — counts unique zones
 * visited, max distance from start, peak combat level, etc. Used
 * for an end-screen replay summary.
 */
export function summarizeReplay(buffer) {
  const frames = buffer.readAll();
  if (frames.length === 0) return { zones: 0, distance: 0, duration: 0 };
  const zones = new Set(frames.map((f) => f.zone));
  let maxDist = 0;
  const start = frames[0];
  for (const f of frames) {
    const d = Math.hypot(f.x - start.x, f.z - start.z);
    if (d > maxDist) maxDist = d;
  }
  const duration = frames[frames.length - 1].t - frames[0].t;
  return {
    zones: zones.size,
    distance: Math.round(maxDist),
    duration: Math.round(duration * 10) / 10,
    frames: frames.length,
  };
}
