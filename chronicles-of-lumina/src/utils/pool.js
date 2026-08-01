// pool.js — generic object pool for particles, projectiles, etc.

export class Pool {
  constructor(factory, reset, size = 32) {
    this.factory = factory;
    this.reset = reset;
    this.items = [];
    this.active = new Set();
    for (let i = 0; i < size; i++) this.items.push(factory());
  }

  acquire() {
    let item = this.items.find((it) => !this.active.has(it));
    if (!item) {
      item = this.factory();
      this.items.push(item);
    }
    this.reset(item);
    this.active.add(item);
    return item;
  }

  release(item) {
    this.active.delete(item);
  }

  forEachActive(fn) {
    for (const it of this.active) fn(it);
  }

  releaseAll() {
    this.active.clear();
  }
}
