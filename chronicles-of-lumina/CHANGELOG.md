# Changelog

Alle nennenswerten Änderungen an Chronicles of Lumina. Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).

## [Unreleased] — Lane B audio + map sprint

### Added (Phase 20-27)

#### Audio
- **Per-biome ambient music** (`src/engine/music.js`): 10 unique 3-layer
  tracks (pad + arpeggio + texture) synthesized via Web Audio API.
  Crossfade on zone change.
- **Adaptive combat music** (Phase 21): tension layer fades in
  based on enemy proximity, combat layer triggers on hit/damage
  with percussion + melody. Decays after 4s of no combat.
- **Voice barks** (Phase 22): 12 procedural vocal-style SFX via
  formant synthesis (hit, hit_critical, miss, levelup, lowhp,
  death, pickup, portal, boss, parry, combo, ultimate).
  Triggered by game events (damage, attack, level-up, pickup,
  zone change, boss spawn, death).
- Per-biome music scales: verdant A-minor pentatonic, dunes
  G-minor, peaks C-major, mire F-dorian, ember D-minor, plus
  crystal/sky/reef/haunted/void phrygian/lydian/mixolydian

#### Maps
- **5 new biomes** (Phase 23): Kristallhöhlen (underground, glowing
  crystals), Himmeltempel (floating islands, pastel clouds),
  Gezeitenriff (underwater coral), Geisterruinen (purple mist),
  Leerenspalt (cosmic void, NEW hardest zone at 2.2 difficulty)
- **Procedural dungeon generation** (Phase 24): 3 dungeon types
  (crypt, mine, tower) with deterministic layout per seed.
  Constrained random walk with 8-12 rooms, L-shaped corridors,
  entrance + boss + exit guarantee. Validates in-bounds.
- **Day/night cycle** (Phase 25): 10-min real-time = full 24h
  cycle. Sky color shifts (night→dawn→day→dusk), fog density
  varies, sun position drives directional light, ambient
  intensity follows time-of-day curve.
- **Per-biome weather** (Phase 25): verdant rain/fog, dunes
  sandstorm, peaks snow/fog, mire fog/drizzle, ember ash/
  ember-rain, crystal glow/sparkle, reef drizzle/current,
  haunted mist, void void-storm/rift. State persists across
  zone visits.
- **10 secret areas** (Phase 26): one hidden mini-boss per
  biome. Verdant Treant, Sand King, Frost Lord, Miremother,
  Titan Forger, Crystal Warden, Sky Seraph, Kraken Lord,
  Shadow Self (mirrors player), The Architect (final boss,
  HP 50). Each has unique loot drops + codex unlocks.

#### UX
- **Photo mode** (Phase 27): `takePhoto(canvas)` captures the
  game canvas as PNG and triggers a browser download via
  temp anchor. iOS Safari fallback to window.open.
- **Replay buffer** (Phase 27): 10s @ 60fps = 600-frame
  circular buffer. Records player position + camera yaw +
  current zone. `getHighlights()` for 20-frame scrub UI,
  `summarizeReplay()` for end-screen stats (zones visited,
  max distance, duration, frame count).

### Tests
- 8 new test files: `music.test.mjs`, `voice.test.mjs`,
  `zones.test.mjs` (updated), `dungeon-gen.test.mjs`,
  `sky.test.mjs`, `secret-areas.test.mjs`, `photo-replay.test.mjs`
- Total: 99 → **145 assertions**, all green
- 16 new files, ~3500 LOC added

### Verified
- `npm test`: 145/145 grün
- All new modules pass `node --check`
- Lane B is complete: every phase (20-27) committed + pushed

## [0.10.8] – 2026-08-01

### Added (Phase 19 — Open World)

## [0.10.8] – 2026-08-01

### Added (Phase 19 — Open World)

#### Biome-System
- **5 thematische Biome** als reines Data in `src/world/zones/index.js`:
  Smaragdwald (Wald/Starter) · Golddünen (Wüste) · Sturmgipfel (Berge) · Nebelmarsch (Sumpf) · Glutkessel (Vulkan/Endgame).
  Jedes Biom definiert eigenen Himmel, Fog, Boden-Farbe, Enemy-Pool, Boss-Pool, Difficulty und Spawn-Punkte.
- **Biom-Cards auf dem Start-Screen** (`src/ui/zone-picker.js`) mit Schwierigkeits-Pips, Swatch und Hover/Selected-States.
- **Map-Code-Input** akzeptiert `zoneId:base36-seed` und lädt die Karte direkt.

#### Portale
- **Sichtbare Torus-Portale** (`src/world/zone-portal.js`) im 3D-World, mit Sprite-Label "Portal: <Ziel>".
  Jedes Biom spawnt 2-3 Portale, sortiert nach Difficulty-Proximity für natürliche Progression.
- **Overlap-Detection** via `findPortalAt()` — `E` triggert Biome-Wechsel.
- **In-World Zone-Indicator** oben in der Mitte zeigt aktuelles Biom mit farbigem Swatch.
- **Portal-Hint** ([E] Portal: <Ziel>) ersetzt den generischen Hint, wenn Spieler in Reichweite ist.

#### Zone-Transition
- **White-Flash + 6-Frame Hit-Stop** vor dem World-Rebuild, damit der Mesh-Swap nicht poppt.
- **Disposer** (`Game._disposeWorld()`) — entfernt Village/Forest/Shrine/Props, behält Player/Elder/Projectiles.
- **Enemy-Clear-Hook** (`EnemySystem.clear()`) — alte Biome-Mobs verschwinden.
- **Player-Reposition** — Spieler wird zum neuen Hub teleportiert.

#### URL-Integration
- `?map=verdant:20473104` lädt eine Custom-Map beim Start (überschreibt Daily-Seed).
- End-Screen Share-Button emittiert `?map=` statt `?seed=`.

### Added (Phase 9+ — Visual Refresh)
- **Mystical-Violet-Palette** — durchgehendes Theme: Violet (Akzent), Cyan (XP), Rose (Boss/Damage), Emerald (HP).
- **19 Lucide-Style inline SVG-Icons** in `src/ui/icons.js` — heart, sparkle, scroll, skull, sword, shield, crystal, berry, pause, play, gear, book, backpack, crosshair, volume, volumeOff, refresh, share, trophy, target.
- **Frosted-Glass-Panels** mit `backdrop-filter: blur(14px)` + inner Top-Highlight.
- **Cinzel Display-Font** für Titel, Inter für Body — Google-Fonts import.
- **Custom-styled Sliders, Toggles, kbd-Badges** — kein Browser-Default mehr.
- **Colorblind-Mode-Pattern** — Boss-Bar bekommt zusätzlich Diagonal-Streifen + Heart-Outlines.
- **Reduced-Motion-Variants** — alle Transitions/Animations respektiert.

### Fixed
- `settings-panel.js` — fehlender `state`-Import (Crashes beim Settings-Öffnen) — **gefixt**.
- `settings-panel.js` — auto-showte auf jedem PAUSED-Transition (Escape → Settings statt Pause) — **gefixt** (jetzt echtes Modal mit `show()`/`hide()`).
- `hud.js` — HP-Bar zeigte Kristall-Count statt HP — **gefixt** (jetzt echte HP-Logik + Low-HP-Warn-Farbe).
- `menus.js` — End-Screen `h1.innerHTML`-Write zerstörte Trophy-Icon — **gefixt** (Label-Span-Pattern).
- `dialog-panel.js` — Who-Text überschrieb Icon — **gefixt** (`.who-name`-Span).
- `menus.js` — Mute-Button-Write zerstörte Icon — **gefixt** (Label + Icon getrennt).
- `enemy-system.js` — Stray `return e;` aus Refactor brach Dispose-Flow — **gefixt**.

### Tests
- `tests/zones.test.mjs` (9 Tests): Registry-Validität, Map-Code-Codec, Round-Trip.
- Total: **90 → 99 Assertions** in 15 Test-Files, alle grün.

### Verified
- `npm test`: 99/99 grün
- Playwright Headless: 0 runtime errors, Biome-Wechsel rendert korrekt (Wald → Wüste = warmer Sand-Boden mit Orange-Sky).

## [0.10.7] – 2026-08-01

### Added (Phase 18 Performance)
- **FPS-Profiler-Overlay** (`src/ui/perf-overlay.js`): kleines Top-Left-DOM-Overlay mit FPS, Frame-Time-Avg, Max-Frame, JS-Heap (wenn `performance.memory` verfügbar). Aktiviert via `?debug=perf` Query-Param. Sample-Window 250ms, max 120 Samples.
- **Object-Pool für Projektile** (`src/entities/projectile.js`): nutzt den vorhandenen `src/utils/pool.js` für `shots` (Pool-Size 24) und `slam rings` (Pool-Size 8). Recycling via `Pool.release()`. Hard-Cap `MAX_ALIVE_SHOTS=80` als Sicherheitsnetz. Allokationen pro Frame im Hot-Path ≈ 0.
- **Audio-Sprite** (`src/engine/audio.js`): alle 5 SFX-Presets werden beim ersten `ensure()` in **einen** `AudioBuffer` gerendert (Phase 4 Procedural → Phase 18 Buffer). Playback via `BufferSource.start(when, offset, duration)` — keine OscillatorNode-Allocs pro Shot mehr. Fallback-Pfad bleibt für kaputte Browser.

### Tests
- `tests/pool.test.mjs` (5 Tests): prebuilt count, acquire/release roundtrip, grow-on-exhaustion, releaseAll, forEachActive
- `tests/perf-overlay.test.mjs` (4 Tests): wantsPerfOverlay-URL-Parsing (true/false/empty/extra-params)
- Total: **81 → 90 Assertions** in 14 Test-Files, **30/30 runs stabil**

### Verified
- `npm test`: 90/90 grün, 30/30 runs stabil
- `npm run check`: 13 verbleibende Errors (alle in `ui/*`/`engine/input.js` DOM-Lib-Types, pre-existing)
- Keine neuen Allocations im Hot-Path (Projektile + SFX)

### CI
- `webpack.yml`: `working-directory: chronicles-of-lumina`, `npm test` statt `npx webpack`
- `nextjs.yml` Boilerplate entfernt (war für Next.js, nicht unser Stack)

## [0.10.7] – 2026-08-01

### Added (Phase 18 Performance)
- **FPS-Profiler-Overlay** (`src/ui/perf-overlay.js`): kleines Top-Left-DOM-Overlay mit FPS, Frame-Time-Avg, Max-Frame, JS-Heap (wenn `performance.memory` verfügbar). Aktiviert via `?debug=perf` Query-Param. Sample-Window 250ms, max 120 Samples.
- **Object-Pool für Projektile** (`src/entities/projectile.js`): nutzt den vorhandenen `src/utils/pool.js` für `shots` (Pool-Size 24) und `slam rings` (Pool-Size 8). Recycling via `Pool.release()`. Hard-Cap `MAX_ALIVE_SHOTS=80` als Sicherheitsnetz. Allokationen pro Frame im Hot-Path ≈ 0.
- **Audio-Sprite** (`src/engine/audio.js`): alle 5 SFX-Presets werden beim ersten `ensure()` in **einen** `AudioBuffer` gerendert (Phase 4 Procedural → Phase 18 Buffer). Playback via `BufferSource.start(when, offset, duration)` — keine OscillatorNode-Allocs pro Shot mehr. Fallback-Pfad bleibt für kaputte Browser.

### Tests
- `tests/pool.test.mjs` (5 Tests): prebuilt count, acquire/release roundtrip, grow-on-exhaustion, releaseAll, forEachActive
- `tests/perf-overlay.test.mjs` (4 Tests): wantsPerfOverlay-URL-Parsing (true/false/empty/extra-params)
- Total: **81 → 90 Assertions** in 14 Test-Files, **30/30 runs stabil**

### Verified
- `npm test`: 90/90 grün, 30/30 runs stabil
- `npm run check`: 13 verbleibende Errors (alle in `ui/*`/`engine/input.js` DOM-Lib-Types, pre-existing)
- Keine neuen Allocations im Hot-Path (Projektile + SFX)

### CI
- `webpack.yml`: `working-directory: chronicles-of-lumina`, `npm test` statt `npx webpack`
- `nextjs.yml` Boilerplate entfernt (war für Next.js, nicht unser Stack)

## [0.10.6] – 2026-08-01

### Fixed (Phase 18-Vorbereitung: Quality-Hardening)
- **Test-Flake-Fix**: `tests/loop.test.mjs` "update() is called" war in 6-10% der Runs flaky (passing t=0 als ersten Frame → frameTime negativ, accumulator hungert). Fix: realistische Timestamp `performance.now() + 16` für ersten Frame. **Stabilität: 100/100 runs grün.**
- **Type-Bug**: `src/core/game.js(382)` — `SCREEN.ENDScreen` (alt) → `SCREEN.ENDSCREEN` (neu nach JSDoc-Refactor)
- **Type-Bug**: `src/utils/random.js` — Date-Arithmetic `d - start` → `d.getTime() - start.getTime()`
- **Type-Bugs**: `src/core/game.js` — `textContent = number` ohne Cast → `String(...)` Cast (4 Stellen)
- **Type-Bugs**: `src/core/game.js` — `three.set()` auf Color/Texture-Union mit `@ts-ignore`
- **Type-Bugs**: `src/core/i18n.js` — `Locale`-Cast + `availableLocales()`-Rückgabetyp
- **Type-Bug**: `src/utils/asset-gen.js` — `window.AssetGen` Cast + Compass-Rose-Tupel-Type

### Verified
- `npm test`: 81/81 grün, **100/100 runs stabil**
- `npm run check`: 34 → **14 Errors** (alle in `ui/*`/`engine/*` DOM-Lib-Types, nicht im JSDoc-Scope)
- `bot/npm test`: grün (8+4+8+3 = 23 Tests)

## [0.10.5] – 2026-08-01

### Added (Phase 17: i18n)
- Hinzugefügt: `src/core/i18n.js` — `t(key, params)` Lookup, `setLocale()`/`getLocale()`, `availableLocales()`, {param}-Interpolation, Default-Locale-Fallback, localStorage-Persistenz
- Hinzugefügt: `src/locales/de.json` — deutsche Strings (UI-Controls, HUD, Codex, Dialog-Sprecher, Dialog-Texte)
- Hinzugefügt: `src/locales/en.json` — englische Übersetzung mit Key-übereinstimmung
- Hinzugefügt: `tests/i18n.test.mjs` — 7 Tests (availableLocales, getLocale, setLocale, Param-Interpolation, Fallback, DE/EN-Key-Symmetry, Codex/Dialog-Coverage)
- Hinzugefügt: `codex-system.retranslate()` Methode — re-derived name/desc nach Locale-Switch

### Changed
- Geändert: `codex-system.js` — `ENTRIES` → `ENTRIES_META` + `buildEntries()` (Texte aus i18n)
- Geändert: `dialogue-system.js` — `startIntro`/`bossWarning`/`bossDefeated`/`victory` nutzen `t('dialog.*')` mit i18n-Speaker-Keys

### Verified
- `npm test` grün: 74 → **81 Assertions** in 12 Test-Dateien
- 3/3 consecutive runs stabil
- DE/EN-Locales sind key-symmetrisch (geprüft via Test)

## [0.10.4] – 2026-08-01

### Added (Phase 16: Test-Coverage)
- Hinzugefügt: `tests/state.test.mjs` — 5 Tests (state-Init, mutator, isPlaying/isPaused, setPhase, killed-counts)
- Hinzugefügt: `tests/screen-state.test.mjs` — 4 Tests (SCREEN-Frozen, transition emits change, invalid-move, no-op)
- Hinzugefügt: `tests/event-bus-edge.test.mjs` — 6 Tests (unsubscribe-handle, off-specific, no-listeners no-throw, throw-doesnt-stop-others, clear, set-dedup)
- Hinzugefügt: `tests/loop.test.mjs` — 6 Tests (DT, start/stop, update DT=1/60, paused halts, resume, onPauseChange-once)

### Changed
- Geändert: Test-Coverage 53 → **74 Assertions** in 11 Test-Dateien (alle grün)
- Geändert: `state.test.mjs` + `screen-state.test.mjs` reseten `state` zwischen Tests wegen cross-test-Kontamination (loop.test.mjs advance-ed `state.time`)

### Verified
- `npm test` grün: 74/74 in 11 Test-Dateien
- `npm run check` weiterhin grün für `core/+systems/`

## [0.10.3] – 2026-08-01 — GitHub Release v0.10.3 (Draft)

### Added (Phase 14: Distribution)
- Hinzugefügt: `docs/showcase.svg` — Hero-Banner mit zentralem Kristall, 2 Slimes, 2 Bäumen, 3 Herzen, Title "Chronicles of Lumina", Play-Button + v0.10.3-Badge
- Hinzugefügt: `.github/workflows/pages.yml` — GitHub-Pages-Deploy (Actions SHA-pinned, source: `chronicles-of-lumina/`)
- Hinzugefügt: GitHub-Release v0.10.3 (Draft) via API — https://github.com/Pierreg99/Lumina-Game/releases/tag/untagged-345dfa5bb273782e6916
- Hinzugefügt: README-Banner + Live-Demo-Link (https://pierreg99.github.io/Lumina-Game/)

### Verified
- `npm test` grün (53/53 Game + 8+4+8+3 Bot)
- `npm run check` grün für `core/+systems/`
- GitHub-Actions-Workflow SHA-pinned

## [0.10.3] – 2026-08-01

### Added (Phase 13: Type-Safety via JSDoc)
- Hinzugefügt: JSDoc-Type-Hints auf alle 9 `src/core/*` Module (event-bus, hitstop, loop, screen-state, settings, state, screen-state, + ergänzend state/screen-state/state)
- Hinzugefügt: JSDoc-Type-Hints auf alle 11 `src/systems/*` Module (boss, codex, combat, dialogue, enemy, feedback, interaction, inventory, quest, spawn, xp)
- Hinzugefügt: `jsconfig.json` mit checkJs/allowJs/noEmit für TypeScript-Check ohne Build
- Hinzugefügt: `@types/three` devDep für Three.js-Type-Support
- Hinzugefügt: `npm run check` Script für IDE-Integration (`tsc --noEmit`)

### Fixed
- Gefixt: `core/game.js` — `this.settings` wurde referenziert aber nie zugewiesen (war ein Bug, der nur nicht aufgefallen ist weil Settings-Store als Singleton funktioniert hat)
- Gefixt: `core/settings.js` — `SettingsValue`-Type-Union statt einzelner Primitives
- Gefixt: `core/screen-state.js` — `SCREEN` Enum fehlten `CODEX` und `SETTINGS` Werte
- Gefixt: `core/state.js` — fehlende `dailySeed`/`dailyIndex`/`score`/`berriesUsed` Felder

### Verified
- `npm run check` läuft sauber durch `core/*` + `systems/*` (nur transitive utils haben minor warnings)
- 53/53 Game-Tests grün
- IDE-Autocomplete funktioniert via `@typedef`-Hints

## [0.10.2] – 2026-08-01

### Added (Phase 15: Security & Supply-Chain)
- Hinzugefügt: `SECURITY.md` — Supported-Versions-Tabelle, Reporting via GitHub Security Advisories, Response-Targets (7d/30d/90d), Scope-Definition
- Hinzugefügt: `.github/dependabot.yml` — 4 Ecosystems (game/bot/desktop/GitHub-Actions), wöchentlich, gruppierte PRs mit Labels
- Hinzugefügt: `.well-known/security.txt` — Responsible-Disclosure-Kontakt, Expires 2027-08-01
- Hinzugefügt: Root `.gitignore` für OS/IDE/Logs/Local-Artifacts

### Changed
- Geändert: `chronicles-of-lumina/desktop/package.json` — `electron ^31.0.0` → `^33.2.0`, `electron-builder ^24.13.3` → `^25.1.8` (16 Dependabot-Vulnerabilities gefixt: 4 high, 9 moderate, 3 low)

### Verified
- `npm audit` clean in `desktop/` (0 Vulnerabilities) und `bot/` (0 Vulnerabilities)
- `chronicles-of-lumina/` (root) — 0 Deps, 0 Vulnerabilities
- 53/53 Game-Tests grün, 8+4+8+3 Bot-Tests grün

## [0.10.1] – 2026-08-01

### Removed (Phase 12: Code-Hygiene)
- Entfernt: `src/systems/ui-system.js` — 38 Zeilen, 1438 Bytes, 0 Importe, 0 Instanziierungen (echter Dead-Code seit R5)

### Changed
- Geändert: 3 GitHub-Actions-Workflows SHA-pinned (Org-Policy-Konformität):
  - `actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2`
  - `actions/setup-node@39370e3970a6d050c480ffad4ff0ed4d3fdee5af # v4.1.0`
  - `slsa-framework/slsa-github-generator/...@68bad40844440577b33778c9f29077a3388838e9 # v1.4.0`
- Geändert: `REFACTOR.md` R5-Tabelle: ehrliche Korrektur, "UiSystem komplett raus" wird spezifiziert als "Import + Instanziierung in main.js" — die Datei selbst war noch da, jetzt entfernt



## [0.10.0] – 2026-08-01

### Added (Phase 11: LuminaBot Discord-Bot)
- Hinzugefügt: `bot/` — kompletter discord.js v14 Bot (ESM, Node 18+)
- Hinzugefügt: 8 Slash-Commands — `/help`, `/status`, `/announce`, `/patch`, `/lore`, `/leaderboard`, `/bugreport`, `/suggestion`
- Hinzugefügt: 4 Event-Handler — `welcome` (guildMemberAdd), `levelup` (🎉-Reaction), `screenshot` (Auto-React), `moderation` (Soft-Deeskalation)
- Hinzugefügt: `lib/embeds.js` — 8 geteilte Embed-Builder mit Lumina-Farbpalette (Lila, Grün, Gold, Blau, Rot, Nebel)
- Hinzugefügt: `lib/store.js` — JSON-File-Persistenz für Reports, Suggestions, Leaderboard + Complexity-Heuristik
- Hinzugefügt: `lib/parser.js` — parst `/patch`-Beschreibung in Neu/Geändert/Gefixt-Sektionen
- Hinzugefügt: `lib/github.js` — GitHub-Releases-API-Client + Markdown-Body-Formatierung
- Hinzugefügt: `lib/loader.js` — auto-load aller `commands/*.js` und `events/*.js`
- Hinzugefügt: `data/lore.json` — 7 atmosphärische Lore-Einträge
- Hinzugefügt: `deploy.js` — registriert Slash-Commands (Guild- oder Global-Scope)
- Hinzugefügt: `Dockerfile` + `docker-compose.yml` für Production-Deployment
- Hinzugefügt: `test/load.test.js` — 8+4+8 Modul-Tests + GitHub-Mock-Tests, kein Discord-Connect nötig
- Hinzugefügt: `.env.example` mit Platzhaltern für `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `WELCOME_CHANNEL_ID`, `SCREENSHOT_CHANNEL_ID`, `GITHUB_TOKEN`, `GITHUB_REPO`

### Changed
- Geändert: `/patch` akzeptiert optionalen `github_release`-Boolean; erstellt Draft-Release mit denselben Notizen als Markdown wenn `GITHUB_TOKEN` + `GITHUB_REPO` gesetzt sind

## [0.9.2] – 2026-08-01

### Added (Phase 10: Procedural Asset-Generation)
- Hinzugefügt: `src/utils/asset-gen.js` — vollständige prozedurale Canvas-2D Asset-Generierung zur Laufzeit
- Hinzugefügt: 16 Atlas-Zellen (128×128) — Grass, Path, Water, Rock, Tree, House, Shrine, Minimap, Heart×2, Crystal, Berry, 3× Slime-Icon, Slime-Blue-Portrait
- Hinzugefügt: 4 Standalone-Portraits/Icons — Slime Green, Slime Purple, Boss Nebelkoloss Portrait, Boss Icon
- Hinzugefügt: PWA-Icon-Generator (`pwaIcon(size)`) — Lumina-Emblem mit Kristall, Gold-Ring, Runen
- Hinzugefügt: `AssetGen.exportAll()` — exportiert alle 21+ Assets als PNG-Downloads via DevTools-Console
- Hinzugefügt: `AssetGen.generateAll()` — Map<string, HTMLCanvasElement> mit Originaldateinamen als Keys

### Changed
- Geändert: `src/engine/materials.js` nutzt `AssetGen.atlas()` (Canvas) statt `TextureLoader().load('assets/texture_atlas.png')` (HTTP-Fetch)
- Geändert: Visuelle Pipeline komplett prozedural — keine Build-Step, keine externen Bilder

### Removed
- Entfernt: 21 Placeholder-PNGs aus `assets/` (durch prozedurale Generierung ersetzt)

## [0.9.1] – 2026-08-01

### Added (Refactor R7)
- Hinzugefügt: Unit-Test-Suite (`tests/`) für Pure-JS-Module — 7 Test-Dateien, **53 Assertions**, alle grün
- Hinzugefügt: `package.json` mit `npm test`-Script (kein Framework, custom 50-Line-Runner in `tests/_runner.mjs`)
- Hinzugefügt: Mock-Helfer (`tests/_setup.mjs`) für `localStorage`, `performance`, `requestAnimationFrame`, `window`
- Hinzugefügt: Multi-Plattform-Deployment-Pipeline (`DEPLOY.md`) — 🌐 Web (statisch), 🤖 Android (PWA / Bubblewrap-TWA), 🖥️ Desktop (Electron)
- Hinzugefügt: Electron-Desktop-Wrapper (`desktop/main.js` + `preload.js` + `package.json`) — Cross-Build via `electron-builder` für Win / Mac / Linux
- Hinzugefügt: PWA-Manifest (`manifest.webmanifest`) + Service-Worker (`sw.js`) für TWA-Installierbarkeit
- Hinzugefügt: `FeedbackSystem(settings)`-DI — Settings werden jetzt injiziert statt importiert (testbar)

### Changed
- Geändert: `game.html` bindet jetzt `manifest.webmanifest` + registriert `sw.js`
- Geändert: Test-Setup schützt vor localStorage-Pollution zwischen Test-Runs

## [0.9.0] – 2026-08-01

### Changed (Refactor R1–R6)
- Refaktoriert: 11 Systems akzeptieren jetzt ein `game`-Objekt statt langer Parameterlisten
- Refaktoriert: `applyShake` und `_activeShakes` aus `main.js` in `CameraRig` verschoben (neue `addShake(intensity, duration)`-API)
- Refaktoriert: Inline `requestAnimationFrame`-Loop in `main.js` durch `core/loop.js` `Loop`-Klasse ersetzt (Fixed-Timestep, Frame-Clamp, MAX_STEPS)
- Refaktoriert: `main.js` von 396 auf **5 Zeilen** reduziert; gesamte Bootstrap-Logik jetzt in `core/game.js` als `Game`-Klasse mit privaten Build/Wire-Methoden
- Refaktoriert: `Game` exponiert strukturierte Methoden statt freier Modulscope-Variablen (`_build`, `_wireUI`, `_wireGlobalEvents`, `_buildLoop`, `_update`, `_render`, `_handleStart`, `_endGame`)

### Removed
- Entfernt: 17 Zeilen Monkey-Patch-Code (`_origKill` / `_origBossDamage` in `main.js`)
- Entfernt: Leerer `BOSS_DAMAGE`-Event-Handler in `main.js`
- Entfernt: Ungenutzter `UiSystem` Import + Instanziierung in `main.js`
- Entfernt: `setPhase` Import (ersetzt durch `transition(SCREEN.PLAYING)`)
- Entfernt: `core/game.js` alte Klassen-Implementierung mit veralteten System-Signaturen (komplett ersetzt)

## [0.8.0] – 2026-08-01

### Added (Phase 8: Polish)
- Hinzugefügt: `core/settings.js` — LocalStorage-basierter Settings-Store (Volume, Sensitivity, Reduce-Motion, Colorblind, FPS-Anzeige)
- Hinzugefügt: `ui/settings-panel.js` — Modal mit Slidern und Toggles, schreibgeschützt via Settings-Store
- Hinzugefügt: `world/minimap.js` Zoom (Mausrad + Pinch-Geste), Spieler-zentriert
- Hinzugefügt: HTML-Dataset-Attribute `data-colorblind`, `data-reduce-motion`, `data-show-fps` für Accessibility-Varianten
- Hinzugefügt: FPS-Counter im `Game._update` (alle 0.5s gerollt)

### Added (Phase 7: Daily Seed)
- Hinzugefügt: `utils/random.js#seedFromDate` — deterministischer Seed aus Datum
- Hinzugefügt: `systems/spawn-system.js` — seeded Spawn-Layouts (12 Gegner pro Run)
- Hinzugefügt: URL-Param `?seed=…` zum manuellen Setzen, `state.dailySeed` + `state.dailyIndex`
- Hinzugefügt: End-Screen zeigt Seed + Score, "Seed teilen"-Button mit Clipboard-API

### Added (Phase 6: Codex)
- Hinzugefügt: `systems/codex-system.js` — 8 Einträge (3 Slime-Varianten, Boss, 2 Items, 2 Orte), entsperrt bei `ENEMY_DIED` / `LOOT_PICKUP_*` / `BOSS_DIED` / Visit-Events
- Hinzugefügt: `ui/codex-panel.js` — Tab-System (Gegner / Items / Orte / Boss), LocalStorage-Persistenz
- Hinzugefügt: Hotkey `C` für Codex-Toggle (geteilt mit Inventar-Screen)

### Added (Phase 5: UX-Features)
- Hinzugefügt: `ui/tutorial.js` — kontextsensitive Tipps, fire-once-Flags, deklarative `register(id, when, text)` API
- Hinzugefügt: 4 Tutorial-Schritte (move / attack / dodge / interact) in den ersten 20 Sekunden
- Hinzugefügt: `systems/dialogue-system.js#say(who, text, choices)` — Choice-API, `pickChoice(id)` löst Choice auf
- Hinzugefügt: `ui/dialog-panel.js` rendert Choice-Buttons unter Dialog-Text
- Hinzugefügt: `ui/menus.js` Pause-Hierarchie (Resume / Settings / Neustart)
- Hinzugefügt: `ui/inventory-panel.js` Tooltips auf Item-Zeilen (Hover/Tap)

### Added (Phase 4: Extended Feedback)
- Hinzugefügt: `ui/combo-indicator.js` — SVG-Bogen links in der HUD, 3 Stufen, decay'd nach 0.45s ohne Hit
- Hinzugefügt: `ui/damage-direction.js` — roter Pfeil am Bildschirmrand, projiziert Schadensquelle durch Camera-Yaw
- Hinzugefügt: `engine/audio.js` Layered Music (`playLayer` / `stopLayer` / `updateAudio`) mit Crossfade
- Hinzugefügt: `engine/audio.js` Combat-Percussion-Layer (110 Hz Square + 4 Hz LFO)
- Hinzugefügt: Adaptive-Music-Toggle in `Game._update` (Combat-Layer bei <10u Distanz zu Gegner)

### Changed (Phase 3: UI-Architektur)
- Geändert: Neues `core/screen-state.js` mit `SCREEN`-Enum + `transition(to)` Whitelist
- Geändert: `state.screen` als Single Source of Truth (statt `state.phase`-String)
- Geändert: UI-Panels rendern deklarativ aus `state` + Events, kein `getElementById` mehr in `main.js`
- Geändert: `ui/interaction-hint.js` (neu) liest `InteractionSystem` selbst, statt von main.js getriggert

### Added (Phase 2: Camera & Combat)
- Hinzugefügt: `engine/camera.js` Velocity-basiertes Lerp (langsamer bei Sprint, schneller im Stand)
- Hinzugefügt: `engine/camera.js#kickToward(direction, intensity, duration)` — additive Camera-Offset
- Hinzugefügt: `entities/player-animation.js` mit Anticipation-Frame vor Schwertschlag (3-Phasen-Tween)
- Hinzugefügt: `entities/player-combat.js` mit tween-basiertem `setInvulnerable(duration)` und Material-Emissive-Pulse

### Added (Phase 1: Spielgefühl-Foundation)
- Hinzugefügt: `core/hitstop.js` — globaler Freeze-State mit `max`-Policy (Folge-Hits verlängern statt verkürzen)
- Hinzugefügt: `systems/feedback-system.js` — zentrale API: `hitstopSmall/Big/Boss`, `shakeSmall/Medium/Big`, `flashDamage`, `slowmoSlam`
- Hinzugefügt: `utils/tween.js` — Mikro-Tween-Lib (Easing, Retarget, TweenManager)
- Hinzugefügt: `#flash-overlay` CSS-Element für Vollbild-Schadenflash
- Hinzugefügt: `EVENTS.HITSTOP`, `EVENTS.SHAKE`, `EVENTS.FLASH`, `EVENTS.SLOWMO`, `EVENTS.CAMERA_KICK`

### Added (Phase 0: Plumbing)
- Hinzugefügt: `ROADMAP.md` mit 9-Phasen-Plan
- Hinzugefügt: `REFACTOR.md` mit Refactor-Plan (R1–R6)
- Hinzugefügt: `.gitignore` (node_modules, logs)
- Hinzugefügt: `state.dailySeed` / `state.dailyIndex` (für Phase 7 vorbereitet)
- Hinzugefügt: `core/settings.js` (Skelett, in Phase 8 voll genutzt)
