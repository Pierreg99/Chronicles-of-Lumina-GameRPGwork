// tests/_runner.mjs — minimal test runner. No deps. ~50 lines.
// Usage:
//   import { test, group, assert, done } from './_runner.mjs';
//   group('Foo', () => {
//     test('does the thing', () => { assert.equal(1+1, 2); });
//   });
//   done();

let passed = 0, failed = 0;
let currentGroup = '';
const failures = [];

export const test = (name, fn) => {
  try {
    fn();
    passed++;
  } catch (e) {
    failed++;
    failures.push(`  ✗ [${currentGroup}] ${name}\n      ${e.stack || e.message}`);
  }
};

export const group = (name, fn) => {
  currentGroup = name;
  fn();
};

export const assert = {
  equal(a, b, msg) {
    if (a !== b) throw new Error(msg || `expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
  },
  deepEqual(a, b, msg) {
    const sa = JSON.stringify(a), sb = JSON.stringify(b);
    if (sa !== sb) throw new Error(msg || `expected ${sb}, got ${sa}`);
  },
  truthy(v, msg) { if (!v) throw new Error(msg || `expected truthy, got ${JSON.stringify(v)}`); },
  falsy(v, msg)  { if (v)  throw new Error(msg || `expected falsy, got ${JSON.stringify(v)}`); },
  approx(a, b, eps = 0.001, msg) {
    if (Math.abs(a - b) > eps) throw new Error(msg || `expected ~${b}, got ${a}`);
  },
  throws(fn, msg) {
    let threw = false;
    try { fn(); } catch (_) { threw = true; }
    if (!threw) throw new Error(msg || 'expected function to throw');
  },
  notThrows(fn, msg) {
    try { fn(); } catch (e) {
      throw new Error(msg || `expected no throw, got: ${e.message}`);
    }
  },
};

export const done = () => {
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failures.length) {
    console.log('\nFailures:');
    failures.forEach((f) => console.log(f));
  }
  if (failed > 0) process.exit(1);
};
