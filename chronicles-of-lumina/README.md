# Chronicles of Lumina

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
├── main.js           # Bootstrap + Game-Loop
├── core/             # config, constants, state, event-bus, settings, hitstop, screen-state
├── engine/           # renderer, scene, camera, lighting, materials, audio, input, collision
├── world/            # world-builder, terrain, village, forest, shrine, environment, props, particles, minimap
├── entities/         # player (+animation, +combat), enemy-base, 3 slimes, boss, projectile, loot, npc
├── systems/          # combat, enemy, boss, quest, xp, inventory, dialogue, interaction, feedback, codex, spawn, ui
├── ui/               # hud, menus, dialog, quest, xp, boss-bar, inventory, mobile, interaction-hint, combo, damage-direction, tutorial, codex, settings
└── utils/            # math, random, pool, dom, time, uv_helper, tween
```

**Schichten:** `utils` → `core` → `engine` → `world`/`entities` → `systems` → `ui`
**Kopplung:** Event-Bus + Dependency-Injection. Keine zirkulären Imports.
**Source of Truth:** `core/config.js` für Balancing, `core/state.js` für Runtime-State, `core/screen-state.js` für UI-Phasen.

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
