# Lumina-Game Roadmap

Evolution des Spiels in 9 Phasen. Jede Phase endet mit einem lauffähigen Spiel, eigenem Commit und Push auf `main`.

## Qualitätsachsen

- **Spielgefühl**: Hit-Stop, Screen-Shake, Camera-Lag, Anticipation, Tween-System, Combo-Visualisierung, Adaptive Audio, Slowmo, Partikel-Pool
- **UX & UI**: Screen-State-Machine, Tutorial-Overlay, deklarative HUD-Bindung, Pause-Hierarchie, Tooltips, Dialog-Choices, Damage-Direction, Accessibility, Settings
- **Erweiterbarkeit**: Neue Biome/Quests/Fähigkeiten als Plugins in `world/` und `entities/`
- **Add-ons**: Codex/Bestiarium, Crafting, Daily-Seed-Run, Photo-Mode

## Phasen-Übersicht

| Phase | Thema | Commits | Status |
|-------|-------|---------|--------|
| **0** | Plumbing: Tween-Lib, Settings-Store, erweiterte Events | 1 | ✅ |
| **1** | Spielgefühl-Foundation: Hit-Stop, Feedback-System | 1 | ✅ |
| **2** | Camera- & Combat-Polish | 1 | ✅ |
| **3** | UI-Architektur: Screen-State, deklarative HUD | 1 | ✅ |
| **4** | Extended Feedback: Combo, Slowmo, Damage-Direction, Adaptive Audio | 1 | ✅ |
| **5** | UX-Features: Tutorial, Dialog-Choices, Pause-Hierarchie, Tooltips | 1 | ✅ |
| **6** | Add-on: Codex/Bestiarium mit Persistenz | 1 | ✅ |
| **7** | Add-on: Daily-Seed-Run | 1 | ✅ |
| **8** | Polish: Settings, Accessibility, Minimap-Zoom | 1 | ✅ |
| **9** | Doku-Finalisierung | 1 | ✅ |
| **R1+R2** | Refactor: Systems auf `game`-Parameter, Monkey-Patches weg | 1 | ✅ |
| **R3** | Refactor: `applyShake` in `CameraRig` | 1 | ✅ |
| **R4** | Refactor: `core/loop.js` benutzen statt eigener Loop | 1 | ✅ |
| **R5+R6** | Refactor: Dead-Code weg, `main.js` → 5 Zeilen | 1 | ✅ |
| **R7** | Refactor: Unit-Test-Suite + Multi-Plattform-Deployment | 1 | ✅ |
| **10** | Visuell: Prozedurale Asset-Generierung (Canvas-2D, kein Build-Step) | 1 | ✅ |
| **11** | Community: LuminaBot Discord-Bot (discord.js v14, 8 Commands, 4 Events) | 1 | ✅ |
| **12** | Hygiene: `ui-system.js` Dead-Code weg, CI-Workflows SHA-pinnen, REFACTOR-Doku fixen | 1 | ✅ |
| **13** | Type-Safety: JSDoc-Type-Hints auf `core/*` + `systems/*` + `utils/asset-gen.js` (ohne TypeScript-Build) | 1 | ✅ |
| **14** | Distribution: GitHub-Pages-Deploy, Showcase-Banner, erstes GitHub-Release v0.10.3 | 1 | ✅ |
| **15** | Security: SECURITY.md, Dependabot-Config, npm-audit-Fix | 1 | ✅ |
| **16** | Test-Coverage: 4 neue Test-Files (state/screen-state/loop/event-bus-edge), 53 → 74 Assertions | 1 | ✅ |
| **17** | i18n: t()-Modul + DE/EN-Locales + Codex/Dialogue-Integration + Key-Coverage-Test | 1 | ✅ |
| **18** | Quality: tsc-Error-Cleanup (34→14), Test-Flake-Fix, Random-Date-TS-Fix | 1 | ✅ |
| **18** | Performance: Audio-Sprite, Object-Pooling für Projektile, FPS-Profiling | 1 | ✅ |
| **19** | Open World: 5 Biome (Verdant/Dunes/Peaks/Mire/Ember) + Zone-Portale + URL-Map-Codes | 1 | ✅ |
| **20** | Audio: Per-Biome Ambient Music (Web Audio synth, 3-layer pad/arp/texture) | 1 | ✅ |
| **21** | Audio: Adaptive Combat Music (tension + combat + combat-melody layers) | 1 | ✅ |
| **22** | Audio: Voice Barks (12 formant-synth vocal effects for events) | 1 | ✅ |
| **23** | Maps: 5 new biomes (crystal, sky, reef, haunted, void) | 1 | ✅ |
| **24** | Maps: Procedural Dungeon Generation (crypt/mine/tower) | 1 | ✅ |
| **25** | Atmosphere: Day/Night Cycle + Per-Biome Weather | 1 | ✅ |
| **26** | Maps: Secret Areas + 10 Hidden Mini-Bosses (one per biome) | 1 | ✅ |
| **27** | UX: Photo Mode (PNG download) + 10s Replay Buffer | 1 | ✅ |
| **28** | Systems: Equipment (6 slots, 5 rarities, 24 templates, stat bonuses) | 1 | ✅ |
| **29** | Systems: Magic (3 schools, 12 spells, MP + regen, mastery) | 1 | ✅ |
| **30** | Systems: Crafting (4 stations, 30+ recipes, 17 materials) | 1 | ✅ |
| **31** | Progression: Skill Tree (3 branches, 24 nodes, 2 capstones each) | 1 | ✅ |
| **32** | Progression: Achievement System (55 across 5 categories) | 1 | ✅ |
| **33** | Variety: Per-Biome Trees (23 variants) + Per-Biome Enemies (36 types) | 1 | ✅ |
| **34** | Endgame: 10 Challenge Modes + localStorage Leaderboard | 1 | ✅ |

**Total: 27 Commits done, 0 Phasen geplant, ~18h done = ~18h**

## Phasen-Details

### Phase 0 — Plumbing
- `utils/tween.js` — Mikro-Tween-Lib (Easing, Delay, Retarget)
- `core/settings.js` — LocalStorage-Store (für Phase 8 vorbereiten)
- `core/constants.js` — neue Events: `HITSTOP`, `SHAKE`, `FLASH`, `SLOWMO`
- Smoke-Test: bestehendes Spiel läuft

### Phase 1 — Spielgefühl-Foundation
- `core/hitstop.js` — friert Update-Loop für N Frames
- `core/loop.js` — integriert Hit-Stop
- `systems/feedback-system.js` — zentral: `shake`, `flash`, `hitstop`
- `systems/combat-system.js` — emittiert `HITSTOP_SMALL`/`HITSTOP_BIG`
- `systems/boss-system.js` — emittiert `HITSTOP_BIG` bei Slam
- `config.js` — neue Balancing-Werte: `feedback.*`

### Phase 2 — Camera- & Combat-Polish
- `engine/camera.js` — Camera-Lag (Lerp-Lambda von Velocity), Camera-Kick
- `entities/player-animation.js` — nutzt `utils/tween.js`, Anticipation
- `entities/player-combat.js` — `setInvulnerable(duration)` mit Material-Blink-Tween
- `systems/feedback-system.js` — Camera-Kick auf Boss-Slam

### Phase 3 — UI-Architektur (Refactor)
- `core/screen-state.js` — enum + Transition-Funktionen
- `ui/hud.js` — rendert komplett aus `state`, kein `getElementById` in `main.js`
- `ui/quest-panel.js`, `ui/xp-panel.js`, `ui/boss-bar.js` — selbe Pattern
- `core/state.js` — typisierte Sub-States
- `main.js` — von ~270 auf <150 Zeilen

### Phase 4 — Extended Feedback
- `ui/combo-indicator.js` — Bogen über Schwert
- `systems/combat-system.js` — `comboStep` 0/1/2 mit Decay-Timer
- `engine/camera.js` — `setSlowmo(factor, duration)`
- `core/loop.js` — `timeScale` global
- `ui/damage-direction.js` — Pfeil am Bildschirmrand
- `engine/audio.js` — `playLayer`, `stopLayer`
- Combat triggert Audio-Layer-Wechsel

### Phase 5 — UX-Features
- `ui/tutorial.js` — kontextsensitive Tipps
- `state.flags` — `tutorial.moved`, `tutorial.attacked`, `tutorial.looted`
- `systems/dialogue-system.js` — `say(who, text, choices?)` mit Choice-Callback
- `ui/dialog-panel.js` — rendert Choice-Buttons
- `ui/menus.js` — Pause-Hierarchie
- `ui/inventory-panel.js` — Tooltips
- Neue Events: `TUTORIAL_STEP`, `DIALOG_CHOICE`

### Phase 6 — Codex/Bestiarium
- `systems/codex-system.js` — Entries-Map
- Listener auf `ENEMY_DIED`, `LOOT_PICKUP_CRYSTAL`, `BOSS_DIED`
- `ui/codex-panel.js` — Tab-System, animierter Unlock
- LocalStorage-Persistenz
- Toggle mit `C` oder Inventar-Tab

### Phase 7 — Daily Seed
- `utils/random.js` — `seedFromDate(date)`
- `systems/spawn-system.js` — nutzt Seed
- `state.dailySeed` + `state.dailyDate`
- Start-Screen: „Daily Run #N"
- Score-Tracking auf End-Screen
- Optional: URL-Share `?seed=…`

### Phase 8 — Polish
- `core/settings.js` UI — Volume, Sensitivity, Reduce-Motion, Colorblind
- `ui/settings-panel.js` — Modal mit Sliders
- `style.css` — `data-colorblind`, `data-reduce-motion` Variants
- `engine/camera.js` — Reduce-Motion respektiert
- `world/minimap.js` — Pinch-/Wheel-Zoom
- LocalStorage: Settings + Codex + Last-Position

### Phase 9 — Doku
- `README.md` — Update mit allen Features
- Screenshots / Gameplay-Clip
- Convenience-Scripts (optional `package.json`)

### Phase 19 — Open World: Biomes + Portale + Custom Map Codes
- `world/zones/index.js` — 5 Biome (Verdant / Dunes / Peaks / Mire / Ember) als Data, inkl. Sky/Fog/Ground/Enemy-Pool/Boss-Pool/Spawns/Difficulty
- `world/zone-portal.js` — sichtbare Torus-Portale mit Sprite-Label, `findPortalAt()`-Overlap-Test
- `ui/zone-picker.js` — Biome-Cards auf dem Start-Screen, Map-Code-Input, In-World-Zone-Indicator
- `core/state.js` — `currentZone`, `visitedZones`, `mapCode` Felder
- `core/constants.js` — neues `ZONE_CHANGE` Event
- `core/game.js` — `_handleZoneChange()` + `_disposeWorld()` für biome swap
- `systems/interaction-system.js` — Portal als drittes Interactable (Priority über Schrein/Elder)
- `systems/enemy-system.js` — `clear()`-Hook für Biome-Wechsel
- `ui/menus.js` — End-Screen Share-Button emittiert `?map=verdant:20473104` Format
- URL-Support: `?map=verdant:20473104` lädt Custom-Map beim Start
- 9 neue Tests in `tests/zones.test.mjs` (Registry, Map-Code-Codec, Round-Trip)

## Architektur-Konventionen

- **Bottom-up Abhängigkeiten**: `utils` → `core` → `engine` → `world`/`entities` → `systems` → `ui`
- **Event-Bus einzige Kopplung** zwischen `systems` und `ui`
- **Magic Numbers verboten** — Balancing in `core/config.js`
- **UI deklarativ** — liest `state`, emittiert keine direkten DOM-Reads
- **Settings via `core/settings.js`** — nie direkt `localStorage`

## Risiken

- **main.js wächst unkontrolliert** → Mitigiert durch Phase 3 (Refactor)
- **Settings-Layer vergessen** → Mitigiert durch frühes Phase-0-Scaffolding
- **Mobile-Performance bei vielen Tweens** → Mitigiert durch `Reduce-Motion`-Setting in Phase 8

## Konvention Commits

```
<type>(phase-N): <short summary>

- bullet 1
- bullet 2

Refs: #phase-N
```

Types: `feat`, `refactor`, `chore`, `docs`, `fix`, `test`
