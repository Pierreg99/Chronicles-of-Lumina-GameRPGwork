// engine/mobile-input.js — coarse pointer detection.
// (Touch handling for the virtual joystick lives in engine/input.js — this file
// just exposes a `isMobile()` check used by the UI to show/hide mobile controls.)

export function isMobile() {
  return window.matchMedia('(pointer: coarse)').matches;
}
