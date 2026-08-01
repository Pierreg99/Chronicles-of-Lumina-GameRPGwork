// tests/perf-overlay.test.mjs — pure-logic tests for the ?debug=perf gate.
import { test } from './_runner.mjs';
import { wantsPerfOverlay } from '../src/ui/perf-overlay.js';

test('wantsPerfOverlay: true when ?debug=perf', () => {
  globalThis.window = { location: { search: '?debug=perf' } };
  if (!wantsPerfOverlay()) throw new Error('should detect debug=perf');
});

test('wantsPerfOverlay: false when ?debug=other', () => {
  globalThis.window = { location: { search: '?debug=other' } };
  if (wantsPerfOverlay()) throw new Error('should not match debug=other');
});

test('wantsPerfOverlay: false when no query string', () => {
  globalThis.window = { location: { search: '' } };
  if (wantsPerfOverlay()) throw new Error('should be false on empty search');
});

test('wantsPerfOverlay: false when extra params present', () => {
  globalThis.window = { location: { search: '?foo=bar&debug=ui' } };
  if (wantsPerfOverlay()) throw new Error('should be false for debug=ui');
});
