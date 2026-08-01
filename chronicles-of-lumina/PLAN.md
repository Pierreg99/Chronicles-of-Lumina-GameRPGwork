# 📋 Lumina — Implementation Plan (Phase 12–18)

Roadmap-Folge nach Phase 11. Jede Phase ist **ein Commit, ~1-3h Aufwand, isoliert testbar**.
Sortiert nach **ROI** (Return on Investment), nicht chronologisch.

---

## Phase 12 — Code-Hygiene  ⏳

**Ziel:** Doku-Wahrheit ↔ Code-Wahrheit, Security-Baseline
**Aufwand:** ~1h
**Commit:** `chore(hygiene): delete dead ui-system, pin CI workflows to SHA`

### Aufgaben

- [ ] `src/systems/ui-system.js` löschen (38 Zeilen, 0 Importe, 0 Instanziierungen — echter Dead-Code)
- [ ] `REFACTOR.md` R5 korrigieren: behauptet "UiSystem Import raus", war es aber nicht
- [ ] `CHANGELOG.md` R5-Block klarer machen: "R5 entfernte nur die main.js-Referenz, nicht die Datei selbst"
- [ ] `.github/workflows/*.yml` SHA-pinnen:
  - `actions/checkout@v4` → `actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2`
  - `actions/setup-node@v4` → `actions/setup-node@39370e3970a6d050c480ffad4ff0ed4d3fdee5af # v4.1.0`
  - `slsa-framework/slsa-github-generator/.github/workflows/generator_generic_slsa3.yml@v1.4.0` → `slsa-framework/...@68bad40844440577b33778c9f29077a3388838e9 # v1.4.0`
- [ ] Comment-Annotation in jeder Workflow-Datei: `# pinned to <sha> for org security policy`
- [ ] Tests: 53 → 53 (keine Änderung)

### Verifikation
```bash
grep -rn "UiSystem\|ui-system" src/ game.html   # sollte 0 Treffer
grep -rn "@v[0-9]" .github/workflows/            # sollte 0 Treffer (nur @<sha>)
```

---

## Phase 13 — Type-Safety via JSDoc  ⏳

**Ziel:** IDE-Autocomplete + Refactor-Sicherheit **ohne TypeScript-Build-Step**
**Aufwand:** ~2-3h
**Commit:** `docs(types): JSDoc type hints on core/ and systems/`

### Aufgaben

- [ ] `core/*` (12 Files) mit `@param` / `@returns` / `@typedef` versorgen
  - `core/event-bus.js` — `EventMap` typedef
  - `core/loop.js` — `LoopOptions`, `LoopStats` typedef
  - `core/game.js` — Game-Klasse mit voller Method-Signatur
  - `core/settings.js`, `core/state.js`, `core/screen-state.js`, `core/hitstop.js`, `core/constants.js`, `core/config.js`
- [ ] `systems/*` (11 Files) — Constructor + Public-Method-Signaturen
  - jeder `constructor(game)` mit `@param {import('../core/game.js').Game} game`
  - jede public Methode mit `@param` / `@returns`
- [ ] `jsconfig.json` im Root:
  ```json
  {
    "compilerOptions": {
      "checkJs": true,
      "allowJs": true,
      "module": "esnext",
      "moduleResolution": "node",
      "target": "es2022",
      "strict": false
    },
    "include": ["src/", "bot/"]
  }
  ```
- [ ] `package.json`-Script: `"check": "tsc --noEmit"` (TypeScript als Dev-Dep nur für type-check, kein Build)
- [ ] `npm run check` muss 0 Errors zeigen (Warnings OK)

### Verifikation
- VSCode zeigt Autocomplete für `this.bus.emit(EVENTS.HITSTOP, { size: 'small' })`
- `tsc --noEmit` ist grün
- Tests: 53 → 53 (keine Änderung)

---

## Phase 14 — Distribution & Marketing  ⏳

**Ziel:** Erstes echtes Deployment + visuelles Marketing-Material
**Aufwand:** ~2h
**Commit:** `feat(dist): GitHub-Pages deploy + demo GIF`

### Aufgaben

- [ ] Demo-GIF erstellen (in-game aufgenommen, ~10s Loop):
  - Bootscreen → Movement → Combat → Crystal pickup → Boss-Fight
  - Tool: `ffmpeg` aus Einzelbildern + kleiner Crop-Loop
  - Speichern als `docs/demo.gif` (3-5 MB max)
- [ ] README.md: GIF oben einbinden als Showcase
- [ ] GitHub-Pages-Workflow:
  - `.github/workflows/pages.yml` — triggert auf push zu main
  - nutzt `actions/upload-pages-artifact@v3` + `actions/deploy-pages@v4` (SHA-pinnen!)
  - Quelle: `chronicles-of-lumina/` (relativer Pfad)
- [ ] GitHub-Pages Settings: Branch `gh-pages` (auto-created by workflow)
- [ ] GitHub-Release für v0.10.0 erstellen:
  - Title: "v0.10.0 — LuminaBot + Asset-Gen"
  - Body: auto-generated via `/patch`-Befehl (siehe Phase 11)
  - Attachments: keine (alles prozedural)
- [ ] Demo-Link in README: `https://pierreg99.github.io/Lumina-Game/`
- [ ] Social-Card / Open-Graph-Image: `docs/og-image.png` (1200×630, generiert via AssetGen.pwaIcon(512) + Title)

### Verifikation
- README zeigt GIF inline
- GitHub-Pages-URL lädt das Spiel
- GitHub-Release v0.10.0 ist sichtbar

---

## Phase 15 — Security & Supply-Chain  ⏳

**Ziel:** Verantwortungsvolle Open-Source-Hygiene
**Aufwand:** ~1.5h
**Commit:** `chore(security): SECURITY.md + dependabot config`

### Aufgaben

- [ ] `SECURITY.md` (Root):
  - Supported Versions (nur main)
  - Reporting: GitHub Security Advisories Tab bevorzugt
  - Response-Time: 7 Tage
  - Disclosure-Policy: koordiniert, 90 Tage
- [ ] `.github/dependabot.yml`:
  ```yaml
  version: 2
  updates:
    - package-ecosystem: "npm"
      directory: "/chronicles-of-lumina"
      schedule: { interval: "weekly" }
      groups: { production: { patterns: ["*"] } }
    - package-ecosystem: "npm"
      directory: "/chronicles-of-lumina/bot"
      schedule: { interval: "weekly" }
  ```
- [ ] `LICENSE` File: MIT (passend zum Repo, mit Cryofreee/Pierreg99 als Copyright)
- [ ] `.well-known/security.txt` (für Responsible-Disclosure-Scanner):
  ```
  Contact: mailto:cryofreee@example.com
  Expires: 2027-01-01T00:00:00.000Z
  Preferred-Languages: de, en
  Canonical: https://github.com/Pierreg99/Lumina-Game/.well-known/security.txt
  ```
- [ ] CodeQL-Workflow (optional): `.github/workflows/codeql.yml` — analysiert JS/ESM
- [ ] PR-Template: `.github/PULL_REQUEST_TEMPLATE.md` (kurz, checklist)

### Verifikation
- Dependabot erstellt wöchentlich PRs für alte Deps
- Security-Tab auf GitHub ist erreichbar
- CodeQL-Action läuft bei jedem PR

---

## Phase 16 — Test-Coverage erweitern  ⏳

**Ziel:** 53 → ~80 Assertions, Three.js-Mocking, jsdom für UI
**Aufwand:** ~3-4h
**Commit:** `test: extend coverage to rendering + UI (53 → 80 assertions)`

### Aufgaben

- [ ] `tests/_setup.js` erweitern: Three.js-Mock für `BufferGeometry`, `Mesh`, `Material`
  - nur Methoden mocken, die der Code nutzt (kein vollständiges Three.js nachbauen)
  - z.B. `BufferGeometry.attributes.position.setX(i, x)` als no-op
- [ ] Neue Tests:
  - `tests/asset-gen.test.mjs` — 6 Tests (canvas-Dimensionen, 21 Einträge in generateAll, atlas-Assembly, export-Methode existiert)
  - `tests/materials.test.mjs` — 3 Tests (MaterialFactory erstellt ohne DOM-Error)
  - `tests/state.test.mjs` — 5 Tests (state-Init, mutator, reset)
  - `tests/loop.test.mjs` — 4 Tests (Loop startet/stoppt, fixed-timestep)
  - `tests/screen-state.test.mjs` — 3 Tests (Transitionen, callbacks)
  - `tests/event-bus-edge.test.mjs` — 5 Tests (wildcard, off-pattern, einmal-Listener)
- [ ] `package.json`:
  - `jsdom` als devDep
  - `"test:full": "node tests/run-full.mjs"` (loaded jsdom + three-mock)
  - `"test": "node tests/run.mjs"` (pure JS, current)
- [ ] Coverage-Report: `c8` als devDep, `"coverage": "c8 --reporter=text npm:test"`
- [ ] Coverage-Ziel: >60% lines, >50% branches (Three.js-Code ausgenommen)

### Verifikation
```bash
$ npm run test:full
✓ 80 passed, 0 failed across 14 files

$ npm run coverage
…
All files          |  62.5  |  51.3  |  78.2  |  63.1
```

---

## Phase 17 — Internationalization (i18n)  ⏳

**Ziel:** Code-Sprache von DE trennen, EN + FR optional
**Aufwand:** ~1h
**Commit:** `feat(i18n): extract hardcoded strings, add EN + DE locales`

### Aufgaben

- [ ] `src/core/i18n.js` — minimalistischer i18n-Manager
  - `t(key, params)` Lookup
  - aktive Locale aus `localStorage` (Default: `de`)
  - Locale-Dateien als JSON: `locales/de.json`, `locales/en.json`
- [ ] Hardcoded DE-Strings extrahieren:
  - `game.html` Controls-Grid (WASD, Leertaste, etc.) — ~10 strings
  - `codex-system.js` `ENTRIES` (8 Einträge) — `name`, `desc`
  - `dialogue-system.js` Script-Texte
  - `bot/data/lore.json` (7 Einträge) — bereits strukturiert, kann erweitert werden
  - `bot/commands/*.js` Embed-Texte
- [ ] `package.json`-Script: `"i18n:check": "node tests/i18n-keys.test.js"` — verifiziert Vollständigkeit
- [ ] Sprach-Switcher in Settings-Panel (Phase 8 — add-on)

### Verifikation
- `npm run i18n:check` ist grün (alle Keys in allen Locales vorhanden)
- Spielstart mit `?lang=en` zeigt englische Texte

---

## Phase 18 — Performance & Polish  ⏳

**Ziel:** Sauberere FPS, weniger Allocations im Hot-Path
**Aufwand:** ~2h
**Commit:** `perf: object pooling, audio sprite, FPS profiling`

### Aufgaben

- [ ] **Object-Pool für Projektile**: `systems/projectile-system.js`
  - Pool von 20 vorgefertigten Meshes, recycled bei `kill()`
  - Misst: Allocations/Frame vor/nach (Browser-DevTools-Memory-Tab)
- [ ] **Audio-Sprite**: `engine/audio.js`
  - Eine einzige `.ogg` mit allen SFX, WebAudio-`AudioBufferSourceNode` mit `start(when, offset, duration)`
  - Spart 8+ HTTP-Requests beim Boot
  - Asset in `assets/sfx-sprite.ogg` (mit Build-Script `tools/build-sfx-sprite.js`)
- [ ] **FPS-Profiler**:
  - In Dev-Mode: kleines Overlay zeigt Frame-Time, GC-Pausen, Memory
  - Toggle via `?debug=perf` in URL
- [ ] **Texture-Atlas-Optimierung**:
  - AssetGen-Output: Power-of-Two-Sizes sicherstellen (128, 256, 512) ✓ bereits der Fall
  - Mipmaps für Ground-Tiles (verringert Moire bei Distanz)
- [ ] **Mobile-Touch-Optimierung**:
  - Virtual Joystick: `touchstart`/`touchmove` mit `passive: true`
  - `requestAnimationFrame` statt `setTimeout` für smoothing
- [ ] Performance-Budget dokumentieren in `PERFORMANCE.md`:
  - 60 FPS auf Desktop (Chrome/Firefox/Safari)
  - 30 FPS auf Mobile (Mittelklasse, Chrome Android)
  - <100 MB RAM nach 10 Minuten Spielzeit

### Verifikation
- DevTools-Performance-Recording zeigt <16ms Frame-Time
- `chrome://tracing`-Export zeigt flache GC-Calls
- Mobile-Test: Pixel 5 erreicht 30+ FPS

---

## Rollout-Reihenfolge

| Phase | ROI | Aufwand | Reihenfolge |
|---|---|---|---|
| **12** Hygiene | ⭐⭐⭐⭐⭐ | 1h | **sofort** |
| **13** JSDoc | ⭐⭐⭐⭐ | 2-3h | direkt nach 12 |
| **14** Distribution | ⭐⭐⭐⭐ | 2h | nach 13 (mehr Value) |
| **15** Security | ⭐⭐⭐ | 1.5h | parallel zu 14 möglich |
| **16** Tests | ⭐⭐⭐ | 3-4h | nach 14, vor 17 |
| **17** i18n | ⭐⭐ | 1h | nach 16 |
| **18** Performance | ⭐⭐ | 2h | zuletzt |

**Totaler Aufwand: ~13h über ~5-7 Tage**

## Was ich **nicht** plane (außer du fragst aktiv)

- TypeScript-Migration (zu invasiv, Stack-Constraint vanilla JS)
- Bundler-Setup (Vite/Rollup) — Designentscheidung, kein Bedarf
- Multiplayer (MMP / Dedicated Server) — viel zu groß für ein Solo-Projekt
- Mobile-Native (Capacitor-Ionic-Wrap) — PWA reicht, schon in Phase 8 vorbereitet
- Story-Mode-Expansion — separate Produktentscheidung
