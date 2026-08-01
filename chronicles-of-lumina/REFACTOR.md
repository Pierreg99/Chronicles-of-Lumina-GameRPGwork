# Refactoring-Plan: `main.js` → `core/game.js` + `core/loop.js`

## Ausgangslage

- `core/loop.js` (62 Zeilen) — vollständige `Loop`-Klasse mit Fixed-Timestep, Pause, Frame-Clamp. **Produktionsreif, wird nicht genutzt.**
- `core/game.js` (205 Zeilen) — vollständiger Orchestrator mit `_setup()`, `_wireGlobalEvents()`, `update(dt)`, `render(alpha)`. **Produktionsreif, wird nicht genutzt.**
- `src/main.js` (396 Zeilen) — **alles** nochmal inline. Modulscope-Variablen, monkey-patched Methoden, eigener Loop mit `requestAnimationFrame` und hardcoded `1/60`-Shake-Decay.

Ziel: `main.js` auf 5 Zeilen reduzieren, alle Systems über `game`-Referenz miteinander verknüpfen, keine Monkey-Patches.

---

## Phase R1 — Systems auf `game`-Parameter umstellen  ✅

Aktuell bekommen Systems `{ bus, ... }` als separate Parameter. In der neuen Form bekommen sie `game` und greifen via `this.game.bus` zu. Das beseitigt die langen Konstruktor-Argumentlisten und macht Systeme echt zu Game-Scoped-Komponenten.

**Status: ✅ Abgeschlossen.**

11 Systeme refactored:
- `systems/enemy-system.js` — `constructor(game)`, kill() emittiert ENEMY_DIED intern
- `systems/boss-system.js` — `constructor(game)`, damage() emittiert BOSS_DAMAGE/BOSS_DIED intern
- `systems/combat-system.js` — `constructor(game)`, COMBO_HIT/COMBO_BREAK intern
- `systems/quest-system.js` — `constructor(game)`
- `systems/xp-system.js` — `constructor(game)`
- `systems/inventory-system.js` — `constructor(game)`
- `systems/dialogue-system.js` — `constructor(game)`
- `systems/interaction-system.js` — `constructor(game)`
- `systems/spawn-system.js` — `constructor(game)`
- `systems/feedback-system.js` — `constructor(game)`
- `systems/codex-system.js` — `constructor(game)`

**Pattern:**
```js
constructor(game) {
  this.game = game;
  this.bus = game.bus;            // direkter Bus-Zugriff
  this.scene = game.scene;        // convenience-Aliase
  this.materials = game.materials;
  // ...
}
```

main.js wurde umgebaut: ein zentrales `game = { ... }` Plain-Object wird stufenweise mit Engine-, Entity- und System-Instanzen befüllt. Systeme bekommen nur `game`.

---

## Phase R2 — Monkey-Patches aus `main.js` eliminieren  ✅

```js
// Vorher in main.js:
const _origKill = enemySystem.kill.bind(enemySystem);
enemySystem.kill = (e) => { _origKill(e); bus.emit(EVENTS.ENEMY_DIED, e); };

const _origBossDamage = bossSystem.damage.bind(bossSystem);
bossSystem.damage = (n) => {
  const dead = _origBossDamage(n);
  if (dead) bus.emit(EVENTS.BOSS_DIED);
  else bus.emit(EVENTS.BOSS_DAMAGE, { hp: ..., maxHp: ... });
  return dead;
};
```

**Status: ✅ Abgeschlossen.**

Verschoben in die jeweiligen Systeme:
- `EnemySystem.kill(e)` → `this.bus.emit(EVENTS.ENEMY_DIED, e)` am Ende
- `BossSystem.damage(n)` → `BOSS_DAMAGE` oder `BOSS_DIED` je nach dead-Status
- `CombatSystem.update()` emittiert `COMBO_HIT` / `COMBO_BREAK` direkt

**Effekt: ~17 Zeilen Monkey-Patch-Code verschwunden aus main.js.**

---

## Phase R3 — `applyShake` in `CameraRig` integrieren  ✅

Aktuell hatte `main.js` ein privates `_activeShakes[]`-Array und einen `applyShake()`-Block, der jeden Frame die Kamera-Offset aufaddiert.

**Status: ✅ Abgeschlossen.**

`engine/camera.js` hat jetzt:
- `addShake(intensity, duration)` — fügt einen Shake zum internen `_shakes[]`-Array hinzu
- `update(dt, target, velocity)` summiert und zerlegt die Shakes im selben Schritt wie das normale Follow

`main.js`:
- `game.bus.on(EVENTS.SHAKE, ...)` ruft `game.cameraRig.addShake(...)` auf
- `applyShake()` Funktion + `_activeShakes[]` Array komplett gelöscht
- Loop ruft nur noch `game.cameraRig.update(...)`, kein separates Apply

---

## Phase R4 — `Game.update` benutzt `Loop`  ✅

Aktuell hatte `main.js` seinen eigenen `requestAnimationFrame`-Loop mit `rawDt * feedback.timeScale`. Der `Loop` aus `core/loop.js` ist besser (Fixed-Timestep, Pause-Hook, Frame-Clamp).

**Status: ✅ Abgeschlossen.**

`main.js` importiert jetzt `Loop` aus `core/loop.js` und instanziiert ihn:

```js
const gameLoop = new Loop({ update: updateLoop, render: renderLoop });
gameLoop.start();
```

`updateLoop(dt)` und `renderLoop()` sind getrennt, der Loop treibt sie mit FIXED_DT=1/60. Slowmo: `const gameDt = dt * game.feedback.timeScale;` einmal oben, an alle Subsysteme weitergegeben. Hit-Stop: früher Return aus `updateLoop`, Render läuft trotzdem.

FPS-Counter, Adaptive-Music-Toggle und Minimap-Draw sind Teil von `updateLoop`, also einmal pro Fixed-Tick — vorher waren sie im requestAnimationFrame-Handler.

---

## Phase R5 — Dead-Code entfernen  ✅

| Was | Wo | Aktion | Status |
|-----|-----|--------|--------|
| Leerer `BUS.on('BOSS_DAMAGE', () => {})`-Handler | `main.js` | gelöscht | ✅ |
| Ungenutzter `UiSystem` Import + Instanziierung | `main.js` | komplett raus | ✅ |
| `setPhase` Import | `main.js` | raus | ✅ |
| `applyShake()`, `_activeShakes[]` | `main.js` | in CameraRig verschoben (R3) | ✅ |
| Monkey-Patches `_origKill` / `_origBossDamage` | `main.js` | in Systeme (R2) | ✅ |
| Alte `core/game.js` Klassen-Implementierung mit `sceneMgr`, `mobileInput`, `collision`, `loop.setPaused` | `core/game.js` | komplett ersetzt mit der neuen Game-Klasse | ✅ |

---

## Phase R6 — `main.js` final  ✅

```js
// main.js — Bootstrap only.
import { Game } from './core/game.js';

const canvas = document.getElementById('game');
new Game(canvas);
```

**Status: ✅ Abgeschlossen — exakt 5 Zeilen.**

Die gesamte Wiring-Logik liegt jetzt in `core/game.js` als `Game`-Klasse mit privaten Methoden:
- `_build()` — Engine, Entities, Systems in Dependency-Order
- `_wireUI()` — UI-Panels + Dialog/Inventory/Codex-Listener
- `_wireGlobalEvents()` — Player-Lifecycle + Scene-Beats
- `_buildStartInfo()` — Daily-Seed im Start-Overlay
- `_buildLoop()` — Loop-Instanz + Start
- `_buildPauseWiring()` — Resize + Camera-Shake/Kick/Flash
- `_update(dt)` / `_render()` — Loop-Callbacks
- `_handleStart()` / `_endGame(win)` — Game-Actions

main.js ist nur noch der Entry-Point. `core/game.js` ist 353 Zeilen, davon ~250 in Methoden. Die Game-Klasse ist unit-testbar (man kann sie mit einem Mock-canvas starten).

---

## Reihenfolge der Umsetzung

1. **R1** — Systems auf `game`-Parameter umstellen (größte Änderung, ~10 Dateien)
2. **R2** — Monkey-Patches entfernen (fällt bei R1 automatisch ab)
3. **R3** — `applyShake` in CameraRig (kleine Datei, klare Verantwortung)
4. **R4** — Game.update nutzt Loop (testen!)
5. **R5** — Dead-Code
6. **R6** — main.js auf 5 Zeilen

**Commits pro Phase**, jeweils mit grünem Smoke-Test (Imports lösen, kein Konsolen-Error bei Boot).

**Risiko:** Test-Coverage ist 0 — Browser-Tests sind manuell. Mitigation: nach jeder Phase `python3 -m http.server` starten und Spiel laden, Console muss leer sein.

**Geschätzter Aufwand:** ~90 min, weil R1 die meisten Touchpoints hat.

**Outcome:** `main.js` 5 Zeilen. Alle Systems in `core/` und `systems/` sind unit-testbar (sie brauchen nur ein Mock-Game mit `bus`, `scene`, `materials`). Keine globalen Modulscope-Variablen mehr.

---

## Phase R7 — Unit-Test-Suite + Multi-Plattform-Deployment  ✅

**Status: ✅ Abgeschlossen.**

### 1) Test-Suite
Per Stack-Constraint *„kein Framework"* — Vitest/Jest wären Overkill. Stattdessen:

- `tests/_runner.mjs` — **50 Zeilen** custom Runner mit `test`, `group`, `assert.{equal,deepEqual,truthy,falsy,approx,throws,notThrows}`, `done()`. Exit-Code 1 bei Fail.
- `tests/_setup.mjs` — Mocks für `localStorage` (Map-backed), `performance`, `requestAnimationFrame`, `window`.
- `tests/run.mjs` — Entry-Point, auto-discovers `*.test.mjs`, ruft am Ende `done()`.

**7 Test-Dateien, 53 Assertions, alle grün:**

| Datei | Modul | Assertions |
|-------|-------|-----------:|
| `event-bus.test.mjs` | `core/event-bus.js` | 7 |
| `tween.test.mjs` | `utils/tween.js` | 9 |
| `hitstop.test.mjs` | `core/hitstop.js` | 5 |
| `settings.test.mjs` | `core/settings.js` | 7 |
| `dialogue.test.mjs` | `systems/dialogue-system.js` | 7 |
| `codex.test.mjs` | `systems/codex-system.js` | 10 |
| `feedback.test.mjs` | `systems/feedback-system.js` | 8 |

```bash
$ npm test
Chronicles of Lumina — unit tests (7 files)
…
53 passed, 0 failed
```

**Was NICHT getestet wird** (gewollt): Three.js-abhängige Systeme (Rendering, Scene-Graph, Mesh-Lifecycle) — bräuchten `jsdom` + `three-mock`. Pattern ist so designed, dass drei.js-freie Logik testbar bleibt; drei.js-Touchpoints sind klar von Pure-JS abgetrennt.

**DI-Fix:** `FeedbackSystem` bekommt `settings` als 2. Constructor-Parameter statt importiertem Singleton — sonst sind die `reduceMotion`-Tests nicht isolierbar. `core/game.js` reicht jetzt `this.settings` durch.

### 2) Multi-Plattform-Deployment
Drei Plattformen, eine Pipeline:

| Plattform | Verpackung | Datei-Pfad |
|---|---|---|
| 🌐 Web | statischer Host | `index.html` + `python3 -m http.server 8080` |
| 🤖 Android | PWA / Bubblewrap-TWA | `manifest.webmanifest` + `sw.js` |
| 🖥️ Desktop | Electron | `desktop/main.js` + `desktop/preload.js` + `desktop/package.json` |

Vollständige Anleitung in [`DEPLOY.md`](./DEPLOY.md) mit Prompt-Tabelle für die AI-Steuerung:

| Situation | Prompt |
|---|---|
| Erstes Setup aller drei | Komplette Pipeline |
| Nur Web | Nur 🌐-Block |
| Android-Debug | Nur 🤖-Block + `adb logcat` |
| Neue EXE | 🖥️-Block + Version-Bump |

**Outcome:** 53 Test-Assertions + 3 Plattformen. Refactor-Roadmap vollständig abgeschlossen.

---

## Phase 10 — Prozedurale Asset-Generierung  ✅

**Status: ✅ Abgeschlossen.**

### Ziel
Alle 21 Placeholder-PNGs in `assets/` durch prozedurale Canvas-2D-Generierung ersetzen.
**Kein Build-Step**, keine externen Bilddateien, alles läuft im Browser zur Spielstart-Zeit.

### Architektur: `src/utils/asset-gen.js`

```js
import { AssetGen } from '../utils/asset-gen.js';

// Master-Atlas (512×512, 16 Zellen) — wird in materials.js verwendet
const atlasCanvas = AssetGen.atlas();  // → THREE.CanvasTexture

// Einzelne Zellen (16)
AssetGen.cells.grassTile()          // → HTMLCanvasElement 128×128
AssetGen.cells.heartFull()          // → ...
// ... 14 weitere

// Standalone Portraits + Icons (5)
AssetGen.portraits.slimeGreen()     // → HTMLCanvasElement 128×128
AssetGen.portraits.bossNebelkoloss()
AssetGen.icons.bossNebelkoloss()    // → HTMLCanvasElement 48×48

// Alle 21 Assets auf einmal
const map = AssetGen.generateAll();  // → Map<string, HTMLCanvasElement>

// Export als PNG (Browser-Download)
AssetGen.exportAll();  // löst 23 Downloads aus (21 Assets + 2 PWA-Icons)
```

### Visueller Stil
Granblue Fantasy / Star Ocean UI:
- 3-4px dicke dunkle Outlines auf allen Formen
- 2-3 Töne pro Objekt (Cell-Shading via `toonShade`/`radialGlow`)
- Anime-Augen mit Pupille + Highlight (`drawEye`)
- 4-Punkt-Sparkles auf UI-Items (`sparkle`)
- Boss-Portrait: dunkle Vignette, glühende Augen, leuchtender Brust-Kern

### Integration in `materials.js`

```js
// VORHER:
this.atlas = new THREE.TextureLoader().load('assets/texture_atlas.png');

// NACHHER:
import { AssetGen } from '../utils/asset-gen.js';
this.atlas = new THREE.CanvasTexture(AssetGen.atlas());
```

UV-Mapping (`getUVForAsset`) bleibt unverändert — die 4×4-Grid-Layout-Positionen stimmen
mit dem prozeduralen Atlas überein.

### Gelöschte Dateien
21 Placeholder-PNGs aus `assets/`:
- 16 Atlas-Zellen (`texture_atlas.png` + 15 einzelne)
- 4 Standalone-Portraits/Icons
- 1 `texture_atlas.png` (durch prozedurales Pendant ersetzt)

Übrig: `assets/texture_atlas.json` (Layout-Dokumentation, nicht geladen).

### Tests
Die bestehende Test-Suite (53 Assertions) läuft weiterhin grün. Eine direkte Asset-Gen-Test
braucht `document.createElement('canvas')` und ist im Node-Setup nicht ausführbar — visuelle
Verifikation erfolgt im Browser via `python3 -m http.server 8080`.

**Outcome:** Keine externen Assets mehr. `assets/` ist fast leer (nur die JSON-Doku).
Spielstart ist deterministisch und offline-fähig ohne Bildmaterial.
