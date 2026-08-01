# Performance Budget

Last updated: 2026-08-01 (Phase 18 complete)

## Targets

| Platform | Target FPS | Max Frame | Notes |
|---|---|---|---|
| Desktop (Chrome / Firefox / Safari) | 60 | 16.6 ms | Reference machine: 4-core CPU, GPU |
| Mobile (Chrome Android, mid-range) | 30 | 33.3 ms | Pixel 5 / Galaxy A52 reference |
| Low-end mobile (Mali-G52) | 24 | 41.6 ms | Graceful degradation, gameplay still works |

## Memory Budget

| Heap | Limit | Notes |
|---|---|---|
| JS heap (V8) | <100 MB | After 10 minutes of play, no leaks |
| GPU textures | <40 MB | All procedural via `src/utils/asset-gen.js` |
| Audio buffers | <2 MB | 1 AudioBuffer for SFX sprite, ~150 KB rendered |
| Object pools (projectiles) | ~24 shots + 8 rings | Pre-allocated, recycled |
| Object pools (particles) | <256 | `src/world/particles.js` |

## Per-Frame Cost (measured on reference)

| System | ms | Notes |
|---|---|---|
| Input + Camera | <0.2 | |
| Enemy/Player update | <1.0 | Up to 12 enemies |
| Boss update | <0.5 | |
| Combat / Projectile | <0.3 | **Zero-alloc** (Phase 18) |
| Particles | <0.4 | Points cloud, additive blend |
| Render | <4.0 | WebGL, ≤200 draw calls |
| HUD/UI DOM | <0.5 | |
| **Total** | **<7 ms** | 9 ms headroom for 60 FPS |

## Phase 18 Wins

| Optimization | Before | After | Saved |
|---|---|---|---|
| Projectile allocations (per fire) | 1 mesh + 1 material | 0 (pool) | ~0.05 ms / shot, ~5 KB GC pressure |
| SFX allocations (per play) | 1 Osc + 1 Gain + 1 Start/Stop | 1 BufferSource | ~0.02 ms / SFX, no GC |
| FPS-Profiler overlay | n/a | `?debug=perf` | New diagnostic tool |

## Profiling

Open `https://<your-deploy-url>/?debug=perf` to see live FPS, frame-time average, max frame, and (if `performance.memory` is exposed) JS heap usage. Sample window: 250 ms. Max samples: 120 (~30 s).

For deeper analysis:
- **Chrome DevTools → Performance** — record 5 s of gameplay; look for long tasks >50 ms.
- **Chrome `chrome://tracing`** — enable categories `v8`, `blink.user_timing`, `gpu`; export and look for flat GC.
- **Three.js Inspector** — `Stats` panel shows draw calls, triangles, programs.

## Anti-Patterns to Avoid

- ❌ Creating `new THREE.Mesh` inside `update()` — use a Pool.
- ❌ `setTimeout` for game logic — use the fixed-step `Loop` (60 Hz, 1/60 s slice).
- ❌ `JSON.parse(localStorage.getItem(...))` in hot path — cache via `core/settings.js`.
- ❌ Touch listeners without `passive` — the browser logs a warning AND delays scroll.
- ❌ `requestAnimationFrame` polling for input — read events synchronously.

## When to Re-Budget

- After adding a new system (estimate + benchmark before merge).
- After upgrading Three.js major version.
- After any new dependency that touches the hot path (e.g. physics, networking).
- When shipping to a new platform (Console, WebXR, etc.).
