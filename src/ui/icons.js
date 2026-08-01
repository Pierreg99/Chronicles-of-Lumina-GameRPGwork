// ui/icons.js — Lucide-style inline SVG icons for the game UI.
//
// All icons share a 24x24 viewBox, stroke-width 2, currentColor, so they
// inherit from the parent element. Export each as an HTML string so they
// can be dropped into innerHTML or used as data attributes.
//
// Usage:
//   import { ICONS } from './icons.js';
//   el.innerHTML = `<span class="icon">${ICONS.heart}</span> HP`;
//   // or
//   <svg class="icon" viewBox="0 0 24 24" stroke="currentColor">...</svg>

export const ICONS = {
  // Health / HP — filled heart
  heart: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" width="1em" height="1em"><path d="M12 21s-7-4.5-7-11a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 6.5-7 11-7 11z"/></svg>`,
  // Empty heart outline
  heartOutline: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="1em" height="1em"><path d="M12 21s-7-4.5-7-11a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 6.5-7 11-7 11z"/></svg>`,
  // XP / Sparkle — magic / level up
  sparkle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="1em" height="1em"><path d="M12 3l1.8 4.6a2 2 0 0 0 1.2 1.2L19.5 12l-4.6 1.8a2 2 0 0 0-1.2 1.2L12 19.5l-1.8-4.6a2 2 0 0 0-1.2-1.2L4.5 12l4.6-1.8a2 2 0 0 0 1.2-1.2L12 3z"/></svg>`,
  // Quest / Scroll
  scroll: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="1em" height="1em"><path d="M19 17V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2z"/><path d="M3 7h14"/><path d="M7 11h6"/></svg>`,
  // Boss / Skull
  skull: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="1em" height="1em"><path d="M12 2a8 8 0 0 0-8 8c0 3 1.5 5 3 6.5V19a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2.5c1.5-1.5 3-3.5 3-6.5a8 8 0 0 0-8-8z"/><circle cx="9" cy="11" r="1" fill="currentColor"/><circle cx="15" cy="11" r="1" fill="currentColor"/><path d="M10 16h4"/></svg>`,
  // Sword (attack)
  sword: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="1em" height="1em"><path d="M14.5 14.5L19 19l2 2-2-2-4.5-4.5"/><path d="M5 3l7 7-2 2-7-7 2-2z"/><path d="M14 6l4-4 3 3-4 4-3-3z"/></svg>`,
  // Shield (defense / dodge)
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="1em" height="1em"><path d="M12 2L4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4z"/></svg>`,
  // Crystal / Diamond (loot)
  crystal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="1em" height="1em"><path d="M6 3h12l3 5-9 13L3 8l3-5z"/><path d="M3 8h18"/><path d="M9 8l3 13 3-13"/><path d="M9 8L12 3l3 5"/></svg>`,
  // Berry / Cherry (healing item)
  berry: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="1em" height="1em"><circle cx="8" cy="16" r="4"/><circle cx="16" cy="16" r="4"/><path d="M12 16a4 4 0 0 1-4-4c0-2.5 1.5-4 4-4s4 1.5 4 4-1.5 4-4 4z"/><path d="M14 8c0-2 1-4 3-4"/><path d="M14 4l2 1"/></svg>`,
  // Pause
  pause: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" width="1em" height="1em"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`,
  // Play
  play: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" width="1em" height="1em"><path d="M5 3l16 9-16 9V3z"/></svg>`,
  // Settings (gear)
  gear: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="1em" height="1em"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>`,
  // Code/Book (codex)
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="1em" height="1em"><path d="M4 4v16a2 2 0 0 0 2 2h14V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2z"/><path d="M4 18a2 2 0 0 1 2-2h14"/><path d="M9 8h6"/><path d="M9 12h4"/></svg>`,
  // Backpack (inventory)
  backpack: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="1em" height="1em"><path d="M5 8a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8z"/><path d="M9 8h6"/><circle cx="12" cy="14" r="2"/></svg>`,
  // Crosshair (interaction target)
  crosshair: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="1em" height="1em"><circle cx="12" cy="12" r="9"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>`,
  // Speaker (audio on)
  volume: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="1em" height="1em"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>`,
  // Speaker muted
  volumeOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="1em" height="1em"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/></svg>`,
  // Restart
  refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="1em" height="1em"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>`,
  // Share
  share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="1em" height="1em"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg>`,
  // Trophy (win)
  trophy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="1em" height="1em"><path d="M6 9a6 6 0 0 0 12 0V3H6v6z"/><path d="M6 5H3a2 2 0 0 0 2 4"/><path d="M18 5h3a2 2 0 0 1-2 4"/><path d="M12 15v3"/><path d="M9 21h6"/></svg>`,
  // Target (boss)
  target: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="1em" height="1em"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>`,
};

// Helper: wrap an icon in a span with the .icon class for easy styling.
export function icon(name, opts = {}) {
  const svg = ICONS[name];
  if (!svg) return '';
  const cls = opts.class ? `class="${opts.class}"` : '';
  return `<span ${cls} style="display:inline-flex;vertical-align:-0.125em;color:inherit">${svg}</span>`;
}
