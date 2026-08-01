# Changelog

Alle nennenswerten Änderungen an Chronicles of Lumina. Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).

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
