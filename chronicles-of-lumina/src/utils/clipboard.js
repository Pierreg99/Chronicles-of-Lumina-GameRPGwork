// utils/clipboard.js — safe clipboard write with progressive fallbacks.
// Used by the end-screen share button (and available to other UI).

/**
 * Copy `text` to the clipboard.
 * @param {string} text
 * @param {{ promptFallback?: boolean, clipboard?: { writeText: (t: string) => Promise<void> }, document?: Document, prompt?: (msg: string, def?: string) => string|null }} [opts]
 * @returns {Promise<boolean>} true if copied silently, false if user was prompted / failed
 */
export async function copyText(text, opts = {}) {
  const promptFallback = opts.promptFallback !== false;
  const clip = opts.clipboard ?? (typeof navigator !== 'undefined' ? navigator.clipboard : undefined);
  const doc = opts.document ?? (typeof document !== 'undefined' ? document : undefined);
  const promptFn = opts.prompt ?? (typeof window !== 'undefined' ? window.prompt?.bind(window) : undefined);

  try {
    if (clip?.writeText) {
      await clip.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }

  if (doc?.body) {
    try {
      const ta = doc.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
      doc.body.appendChild(ta);
      ta.select();
      const ok = doc.execCommand('copy');
      ta.remove();
      if (ok) return true;
    } catch {
      /* fall through */
    }
  }

  if (promptFallback && typeof promptFn === 'function') {
    promptFn('Map-URL kopieren:', text);
  }
  return false;
}
