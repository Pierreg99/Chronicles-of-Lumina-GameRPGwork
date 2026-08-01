// tests/_setup.mjs — mock browser globals so pure-JS modules can be
// imported under Node. Must be imported FIRST by every test file so
// the side effects are in place before any module reads them.

const memory = new Map();

globalThis.localStorage = {
  getItem(k)    { return memory.has(k) ? memory.get(k) : null; },
  setItem(k, v) { memory.set(k, String(v)); },
  removeItem(k) { memory.delete(k); },
  clear()       { memory.clear(); },
  key(i)        { return Array.from(memory.keys())[i] || null; },
  get length()  { return memory.size; },
};

if (typeof globalThis.performance === 'undefined') {
  globalThis.performance = { now: () => Number(process.hrtime.bigint() / 1000000n) };
}

if (typeof globalThis.requestAnimationFrame === 'undefined') {
  globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16);
  globalThis.cancelAnimationFrame  = (id) => clearTimeout(id);
}

if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;
