# Refactoring-Plan: `main.js` → `core/game.js` + `core/loop.js`

## Ausgangslage

- `core/loop.js` (62 Zeilen) — vollständige `Loop`-Klasse mit Fixed-Timestep, Pause, Frame-Clamp. **Produktionsreif, wird nicht genutzt.**
- `core/game.js` (205 Zeilen) — vollständiger Orchestrator mit `_setup()`, `_wireGlobalEvents()`, `update(dt)`, `render(alpha)`. **Produktionsreif, wird nicht genutzt.**
- `src/main.js` (396 Zeilen) — **alles** nochmal inline. Modulscope-Variablen, monkey-patched Methoden, eigener Loop mit `requestAnimationFrame` und hardcoded `1/60`-Shake-Decay.

Ziel: `main.js` auf 5 Zeilen reduzieren, alle Systems über `game`-Referenz miteinander verknüpfen, keine Monkey-Patches.

---

## Phase R1 — Systems auf `game`-Parameter umstellen

Aktuell bekommen Systems `{ bus, ... }` als separate Parameter. In der neuen Form bekommen sie `game` und greifen via `this.game.bus` zu. Das beseitigt die langen Konstruktor-Argumentlisten und macht Systeme echt zu Game-Scoped-Komponenten.

**Pattern:**
```js
// Vorher
new EnemySystem(scene, materials, projectiles)
new BossSystem(scene, materials, projectiles, particles, feedback)
new CombatSystem({ player, enemySystem, bossSystem, particleSystem, audio, feedback, bus })

// Nachher
new EnemySystem(game)
new BossSystem(game)
new CombatSystem(game)
```

**Konkrete Schritte:**

1. `systems/enemy-system.js`
   - Konstruktor: `constructor(game) { this.game = game; ... this.scene = game.scene; this.materials = game.materials; this.projectiles = game.projectiles; this.bus = game.bus; }`
   - `kill(e)` ruft direkt `this.bus.emit(EVENTS.ENEMY_DIED, e)` statt dass main.js monkey-patcht.
   - `attachSpawnSystem()` bleibt als optionales Plugin.

2. `systems/boss-system.js`
   - Konstruktor nimmt `game`.
   - `damage(n)` emittiert direkt `BOSS_DAMAGE` / `BOSS_DIED` über `this.bus`.

3. `systems/combat-system.js`
   - Vereinfachter Konstruktor: `new CombatSystem(game)`.
   - Greift auf `game.player`, `game.enemySystem`, `game.bossSystem`, `game.particles`, `game.feedback`, `game.bus` zu.

4. `systems/dialogue-system.js`, `systems/quest-system.js`, `systems/xp-system.js`, `systems/inventory-system.js`, `systems/interaction-system.js`, `systems/spawn-system.js` — analog.

5. `world/world-builder.js` (oder neue `buildWorld(game)`-Variante) — nimmt `game` statt einzelner Parameter.

6. `world/environment.js`, `world/minimap.js`, `world/particles.js` — analog.

7. `entities/player.js` Konstruktor: `constructor(game)` oder zumindest `constructor(scene, materials, bus)`. Letzteres ist okay, weil der Player sehr eng mit dem Bus ist.

---

## Phase R2 — Monkey-Patches aus `main.js` eliminieren

```js
// Aktuell in main.js:
const _origKill = enemySystem.kill.bind(enemySystem);
enemySystem.kill = (e) => {
  _origKill(e);
  bus.emit(EVENTS.ENEMY_DIED, e);
};

const _origBossDamage = bossSystem.damage.bind(bossSystem);
bossSystem.damage = (n) => {
  const dead = _origBossDamage(n);
  if (dead) bus.emit(EVENTS.BOSS_DIED);
  else bus.emit(EVENTS.BOSS_DAMAGE, ...);
  return dead;
};
```

**Verschieben in die jeweiligen Systeme**, dort wo die Logik natürlich hingehört:

- `EnemySystem.kill(e)` → `this.bus.emit(EVENTS.ENEMY_DIED, e)` am Ende der Methode.
- `BossSystem.damage(n)` → bei `dead === true` `BOSS_DIED`, sonst `BOSS_DAMAGE` mit HP-Payload.

Effekt: 15 Zeilen Monkey-Patch-Code verschwinden komplett aus `main.js`.

---

## Phase R3 — `applyShake` in `CameraRig` integrieren

Aktuell hat `main.js` ein privates `_activeShakes[]`-Array und einen `applyShake()`-Block, der jeden Frame die Kamera-Offset aufaddiert.

**Ziel:** Alles in `engine/camera.js`:

```js
// In createCamera().update():
applyShake(dt) {
  let ox = 0, oy = 0, oz = 0;
  for (let i = this._shakes.length - 1; i >= 0; i--) {
    const s = this._shakes[i];
    s.remaining -= dt;
    const decay = s.remaining / s.total;
    const k = s.intensity * decay;
    ox += (Math.random() - 0.5) * k;
    oy += (Math.random() - 0.5) * k;
    oz += (Math.random() - 0.5) * k;
    if (s.remaining <= 0) this._shakes.splice(i, 1);
  }
  this._kickOffset.set(ox, oy, oz);
}

addShake(intensity, duration) {
  this._shakes.push({ intensity, remaining: duration, total: duration });
}
```

`Game.update(dt)` ruft am Ende `cameraRig.applyShake(dt)` und `cameraRig.update(dt, ...)`. Damit verschwindet die `bus.on(EVENTS.SHAKE, …)`-Subscription in `main.js` und wird durch `cameraRig.addShake(...)` ersetzt — entweder direkt im Feedback-System oder via Event-Bus-Listener in `Game._wireGlobalEvents()`.

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
