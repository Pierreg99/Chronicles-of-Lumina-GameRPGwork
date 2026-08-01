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

## Phase R4 — `Game.update` benutzt `Loop`

Aktuell hat `main.js` seinen eigenen `requestAnimationFrame`-Loop mit `rawDt * feedback.timeScale`. Der `Loop` aus `core/loop.js` ist besser (Fixed-Timestep, Pause-Hook, Frame-Clamp).

**Schritte:**

1. `core/game.js` hat bereits `this.loop = new Loop({ update: ..., render: ... })`.
2. `main.js` ruft am Ende `new Game(canvas)` und das wars.
3. In `Game.update(dt)`: 
   - `dt` ist jetzt `FIXED_DT = 1/60` aus `core/loop.js`.
   - Slowmo: `const gameDt = dt * this.feedback.timeScale;` einmal oben berechnen, an alle Subsysteme weitergeben.
   - Hit-Stop: `if (this.hitstop.active) { this.render(); return; }` — keine Updates, aber Render läuft.

```js
// Game.update(dt)
update(dt) {
  if (state.screen !== SCREEN.PLAYING) return;
  if (this.hitstop.active) return;

  const gameDt = dt * this.feedback.timeScale;
  this.hitstop.update(dt);
  this.player.update(gameDt, ...);
  this.enemySystem.update(gameDt, ...);
  // ... rest
}
```

4. `Game.render(alpha)` macht nur noch `this.renderer.render(this.sceneMgr.scene, this.camera.camera)`.

---

## Phase R5 — Dead-Code entfernen

| Was | Wo | Aktion |
|-----|-----|--------|
| Leerer `BUS.on('BOSS_DAMAGE', () => {})`-Handler | `main.js` | löschen, Logik sitzt jetzt in BossBar/BossSystem |
| Ungenutzter `UiSystem` Import + Instanziierung | `main.js` | komplett raus (existiert noch als Datei, aber ungenutzt) |
| `setPhase` Import | `main.js` | raus — durch `transition(SCREEN.PLAYING)` ersetzt |
| `applyShake()`, `_activeShakes[]` | `main.js` | in CameraRig verschoben (Phase R3) |
| Monkey-Patches `_origKill` / `_origBossDamage` | `main.js` | in die jeweiligen Systeme (Phase R2) |
| `onRestart: () => location.reload()` | `main.js` | durch `Game.restart()` ersetzen, der sauber `state.reset()` + Re-Init macht |

---

## Phase R6 — `main.js` final

```js
// main.js — Bootstrap only.
import { Game } from './core/game.js';

const canvas = document.getElementById('game');
new Game(canvas);
```

**Erwartete Größe:** 5 Zeilen. Alle Wiring-Logik liegt in `Game._setup()` und `Game._wireGlobalEvents()`.

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
