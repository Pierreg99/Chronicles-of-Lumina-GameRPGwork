// time.js — small time helpers.

export const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

export const formatTime = (seconds) => {
  const s = Math.max(0, Math.floor(seconds));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
};

export const formatHudNumber = (n) => String(n).padStart(2, '0');
