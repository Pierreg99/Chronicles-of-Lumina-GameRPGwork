# Chronicles of Lumina v0.10.7

> **Release-Notes für GitHub-Release.** Copy-Paste-Block für den GitHub-Release-Editor.

**Release-Tag:** `v0.10.7`  ·  **Branch:** `main`  ·  **Commit:** `31df5e2`  ·  **Datum:** 2026-08-01

## Copy-Paste-Block

```markdown
## Chronicles of Lumina v0.10.7 — Phase 12-18 Complete

### Phase 18 Performance
- FPS-Profiler Overlay (?debug=perf): live FPS, frame-time, JS heap
- Object-Pool for Projectiles: zero allocations per fire in steady-state
- Audio-Sprite: all SFX in one AudioBuffer, BufferSource-based playback
- PERFORMANCE.md: 60/30/24 FPS budgets, per-frame cost, anti-patterns

### Phase 17 i18n
- DE/EN Locales: full UI, HUD, Codex, Dialogue translations
- t() Module with {param} interpolation + locale fallback chain
- 7 Key-Coverage Tests

### Phase 16 Test-Coverage
- 4 New Test Files: state, screen-state, event-bus-edge, loop
- 74 to 90 assertions, 30/30 runs stable, 0 flakes

### Phase 15 Security
- 16 Vulnerabilities Fixed (electron 31->33.2, electron-builder 24->25.1.8)
- Dependabot on 4 ecosystems: game, bot, desktop, github-actions
- SECURITY.md + .well-known/security.txt

### Phase 14 Distribution
- GitHub-Pages Workflow, auto-deploy on push to main
- Showcase-SVG Banner (1200x480) for repo social preview
- First GitHub-Release via API

### Phase 13 Type-Safety (JSDoc)
- 9 core + 11 systems modules fully typed via JSDoc
- npm run check via tsc, jsconfig.json + @types/three
- 12 Real Bugs Found and Fixed (SCREEN.ENDScreen, Date arithmetic, textContent, i18n cast, etc.)

### Phase 12 Hygiene
- ui-system.js dead-code removed (38 lines, 0 imports)
- CI-Workflows SHA-pinned (4 workflows)
- REFACTOR.md broken anchors fixed

## Stats
- 90 tests, 14 files, 30/30 runs stable
- tsc: 13 pre-existing DOM-Lib errors
- 0 runtime vulnerabilities
- ~8,500 LOC, 70+ modules

## Try it
git clone https://github.com/Pierreg99/Lumina-Game
cd Lumina-Game/chronicles-of-lumina
npm install
npm test         # 90/90 grün

For FPS-Profiler: append ?debug=perf to the URL.

## Docs
- README.md, PERFORMANCE.md, SECURITY.md, CHANGELOG.md, ROADMAP.md
```

## How to publish

1. https://github.com/Pierreg99/Lumina-Game/releases/new
2. Tag: v0.10.7 (already pushed)
3. Target: main
4. Title: Chronicles of Lumina v0.10.7 - Phase 12-18 Complete
5. Description: copy from block above
6. Click "Publish release"
