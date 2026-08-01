# Chronicles of Lumina

![Version](https://img.shields.io/badge/version-0.9.2-blue) ![Phases](https://img.shields.io/badge/phases-9%2F9-success) ![Refactor](https://img.shields.io/badge/refactor-R1--R7-success) ![Assets](https://img.shields.io/badge/assets-procedural-success)

3D-Browser-Action-Adventure im farbenfrohen JRPG-Fantasy-Stil. Vanilla JS + Three.js, ES-Module, kein Build-Step.

> Vertikale Slice Demo: Sammle 10 Lichtkristalle, besiege den Nebel-Koloss, reinige den Schrein. Jeder Tag ein neuer Seed — spiele das Daily Run für die Highscore.

## Quickstart

```bash
cd chronicles-of-lumina
python3 -m http.server 8080
# Browser: http://localhost:8080/game.html
```

Oder mit Node:
```bash
npx serve .
```

**Täglich neuen Seed spielen:** `http://localhost:8080/game.html?seed=12345` (Seed teilen via End-Screen).

## Steuerung

| Taste | Aktion |
|-------|--------|
| WASD / Pfeile | Bewegung |
| Maus ziehen | Kamera rotieren |
| Leertaste / Klick | Angriff (3er-Combo) |
| Shift | Ausweichrolle (kurz unverwundbar) |
| E | Interaktion (Schrein, Dorfälteste) |
| Esc / P | Pause |
| I | Inventar |
| C | Codex / Bestiarium |
| Mausrad über Minimap | Minimap zoomen |

Mobile: virtueller Joystick + Aktions-Buttons (E / Rollen / Angriff).

## Features

### Spielgefühl
- **Hit-Stop** — Treffer frieren das Spiel kurz ein (50–180ms je nach Größe)
- **Screen-Shake** — Kameraschüttler mit Decay, 3 Stärken
- **Slowmo** — 300ms Zeitlupe bei Boss-Slam
- **Camera-Lag** — Kamera trägt nach, wenn der Spieler schnell läuft
- **Camera-Kick** — Kamera hebt sich weg vom Einschlagspunkt
- **Anticipation-Frames** — Schwert zieht vor dem Schlag kurz zurück
- **Adaptive Music** — Ambient-Pad immer, Combat-Percussion faded bei Gegnerkontakt ein

### Kampfsystem
- **3 Schleim-Varianten** — Wiesen (Nahkampf), Blatt (springt), Nebel (Fernkampf-Projektile)
- **Boss: Nebel-Koloss** — 25 HP, Projektil-Salve + Bodenschlag mit Ringwelle
- **Combo-Indicator** — HUD-Bogen füllt sich pro Hit, decay'd nach 0.45s, resetted bei Schaden
- **Damage-Direction** — roter Pfeil am Bildschirmrand zeigt, woher der Schaden kam
- **3-Stufen-XP** — Level-Ups geben Max-HP +1, alle 2 Level +1 Angriff
- **Heilbeeren-Loot** — Drop von Gegnern, heilt 2 HP

### Quest
- **Intro** durch die Dorfälteste mit Hinweisen
- **Tutorial-Overlay** — kontextsensitive Tipps in den ersten 20 Sekunden
- **Lichtkristalle sammeln** (0/10)
- **Boss spawnt** automatisch bei 10 Kristallen
- **Schrein-Reinigung** nach Boss-Sieg
- **Endscreen** mit Score, Zeit, Kills, Kristallen, Seed

### UI
- **Screen-State-Machine** — explizite Übergänge zwischen Start / Playing / Paused / Dialog / Inventory / Endscreen
- **Deklarative HUD** — Panels lesen `state` + Events, kein `getElementById` in `main.js`
- **Dialog-Choices** — verzweigte Gespräche (z.B. Elder-Fragen)
- **Pause-Hierarchie** — Resume / Einstellungen / Neustart
- **Tooltips** im Inventar (Hover/Tap)
- **Damage-Flash** — roter Vollbild-Overlay bei Schaden

### Persistenz
- **Codex/Bestiarium** — 8 Einträge (Gegner, Items, Orte, Boss). Entsperrt sich automatisch beim ersten Kontakt. In LocalStorage gespeichert.
- **Settings** — Volume, Sensitivity, Reduce-Motion, Colorblind-Mode, FPS-Anzeige. LocalStorage.
- **Daily Seed** — jeden Tag ein neuer Spawn-Layout. URL-Param `?seed=…` zum Teilen. End-Screen zeigt Score.

## Modul-Architektur

```
chronicles-of-lumina/src/
├── main.js           # 5-Zeilen-Bootstrap: new Game(canvas)
├── core/             # Game-Klasse, Loop, Config, Constants, State, EventBus, Settings, HitStop, Screen-State
├── engine/           # Renderer, Scene, Camera (inkl. Shake/Kick), Lighting, Materials, Audio (inkl. Layers), Input, Collision
├── world/            # World-Builder, Terrain, Village, Forest, Shrine, Environment, Props, Particles, Minimap
├── entities/         # Player (+ Animation, + Combat), Enemy-Base, 3 Slimes, Boss, Projectile, Loot, NPC-Elder
├── systems/          # Combat, Enemy, Boss, Quest, XP, Inventory, Dialogue, Interaction, Feedback, Codex, Spawn
├── ui/               # HUD, Menus, Dialog, Quest, XP, Boss-Bar, Inventory, Mobile, Interaction-Hint, Combo, Damage-Direction, Tutorial, Codex, Settings
└── utils/            # Math, Random, Pool, DOM, Time, UV-Helper, Tween
```

**Bootstrap:** `main.js` ist seit Refactor R5/R6 exakt 5 Zeilen — die gesamte Verdrahtung lebt in der `Game`-Klasse (`core/game.js`) mit privaten Build/Wire-Methoden.

**Schichten:** `utils` → `core` → `engine` → `world`/`entities` → `systems` → `ui`
**Kopplung:** Event-Bus + Dependency-Injection. Keine zirkulären Imports.
**Source of Truth:** `core/config.js` für Balancing, `core/state.js` für Runtime-State, `core/screen-state.js` für UI-Phasen.

**`Game`-Klasse (in `core/game.js`):**
- `_build()` — Engine → Entities → Systems in Dependency-Order
- `_wireUI()` — alle UI-Panels + Dialog/Inventory/Codex-Toggle
- `_wireGlobalEvents()` — Player-Lifecycle + Scene-Beats
- `_buildStartInfo()` / `_buildLoop()` / `_buildPauseWiring()`
- `_update(dt)` / `_render()` — Loop-Callbacks
- `_handleStart()` / `_endGame(win)` — Game-Actions

**Systems:** Alle seit Refactor R1 mit `constructor(game)` statt langer Parameterlisten.

## Erweiterung

- **Neuer Gegnertyp:** `entities/` + Spec in `enemy-base.js` + Eintrag in `systems/enemy-system.js` INITIAL_SPAWNS
- **Neue Quest:** `core/config.js` `quest.*` + `systems/quest-system.js`
- **Neues Biom:** `world/`-Modul + Registrierung in `world-builder.js`
- **Neue Fähigkeit:** `entities/player.js` + Animation in `player-animation.js` + Combat in `player-combat.js`
- **Neues Settings-Feld:** `core/settings.js` DEFAULTS + UI in `settings-panel.js`
- **Neuer Codex-Eintrag:** `systems/codex-system.js` ENTRIES-Liste

## Performance

- Performance-Ziel: 60 FPS auf Desktop, 30 FPS auf Mobile
- Object-Pooling für Partikel (Three.js Points)
- Atlas-basierte Texturen (4×4, 512×512)
- Geclipptes Rendering (FOV 55°, Sichtweite 200u)
- Hit-Stop überspringt Updates, nicht Render
- Slowmo skaliert `dt`, nicht Game-State

## Lizenz

MIT — siehe [`LICENSE`](./LICENSE) (TODO).

## Credits

- Code: Mavis
- Texturen: im `assets/`-Ordner
- Musik/SFX: Web Audio API (synthetisiert, keine Audio-Assets)
- Inspiration: klassische JRPGs (Final Fantasy, Dragon Quest) — ohne Marken, ohne Assets

## Roadmap & Doku

- [`ROADMAP.md`](./ROADMAP.md) — 15 Phasen (0–9 Feature + R1–R7 Refactor + 10 Visuals), alle ✅
- [`REFACTOR.md`](./REFACTOR.md) — Phase R1–R7 Plan und Status
- [`CHANGELOG.md`](./CHANGELOG.md) — Versions-Historie (Keep-a-Changelog-Format)
- [`DEPLOY.md`](./DEPLOY.md) — Multi-Plattform-Deployment (🌐 Web · 🤖 Android · 🖥️ Desktop)
- [`src/utils/asset-gen.js`](./src/utils/asset-gen.js) — prozeduraler Asset-Generator

## Assets (prozedural)

Alle Texturen werden zur Laufzeit im Browser via **Canvas-2D** generiert — keine externen
Bilddateien, kein Build-Step. Der Master-Atlas (`512×512`, 4×4 Grid) wird in
`engine/materials.js` als `THREE.CanvasTexture` geladen. Die 16 Zellen + 4 Standalone-Portraits
sind einzeln abrufbar via `AssetGen.cells.*` / `AssetGen.portraits.*` / `AssetGen.icons.*`.

Visueller Stil: Granblue Fantasy / Star Ocean — dicke Outlines, satte Cell-Shading-Töne,
Glanzpunkte, Sparkles und Glows auf UI-Items. Boss- und Codex-Portraits haben
Hintergrund-Vignette und dramatische Beleuchtung.

**Assets exportieren** (für Marketing, PWA-Manifest-Icons, statisches Hosting):
Browser-Console öffnen und `AssetGen.exportAll();` ausführen — alle 23 Dateien (21 Game-Assets
+ 2 PWA-Icons) werden als PNG-Downloads gespeichert.

## Testing

```bash
npm test
```

53 Assertions in 7 Test-Dateien, alle grün. Abdeckung: `core/event-bus`, `core/settings`, `core/hitstop`,
`utils/tween`, und die Pure-JS-Systems (`dialogue`, `codex`, `feedback`). Kein externes Framework —
custom 50-Line-Runner in `tests/_runner.mjs`, Mock-Helfer in `tests/_setup.mjs`.
Three.js-abhängige Systeme (Rendering, Scene-Graph) sind nicht unit-getestet.

## Deployment

Siehe [`DEPLOY.md`](./DEPLOY.md) für die vollständige Pipeline:

| Plattform | Pfad | Verpackung |
|---|---|---|
| 🌐 Web | statischer Host | `python3 -m http.server 8080` |
| 🤖 Android | PWA / TWA | `npx @bubblewrap/cli build` |
| 🖥️ Desktop | Electron | `cd desktop && npm run build:win` |
