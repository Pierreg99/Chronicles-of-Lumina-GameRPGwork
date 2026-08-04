# Lumina-Game

3D-Browser-Action-Adventure, modular aufgebaut mit Vanilla JS + Three.js.

> Hauptprojekt: **[Chronicles of Lumina](./chronicles-of-lumina/)** — eine eigenständige Fantasy-Welt im JRPG-Stil mit 5 thematischen Biomen, Portal-Navigation und URL-shared Custom-Maps.

## Schnellstart

```bash
cd chronicles-of-lumina
python3 -m http.server 8080
# Browser: http://localhost:8080/game.html
```

Oder mit Node:

```bash
cd chronicles-of-lumina
npx serve .
```

**Custom-Map laden:** `http://localhost:8080/game.html?map=verdant:20473104`

**Live-Demo:** [pierreg99.github.io/Lumina-Game](https://pierreg99.github.io/Lumina-Game/)

## Was ist drin

| Bereich | Pfad | Inhalt |
|---------|------|--------|
| Spiel | [`chronicles-of-lumina/`](./chronicles-of-lumina/) | Vollständige ES-Modul-Architektur, 75+ JS-Dateien, prozedurale Assets |
| Doku | [`chronicles-of-lumina/README.md`](./chronicles-of-lumina/README.md) | Modul-Architektur, Steuerung, Erweiterungs-Patterns |
| Plan | [`chronicles-of-lumina/ROADMAP.md`](./chronicles-of-lumina/ROADMAP.md) | 19 Phasen done, alle Quality-Achsen abgehakt |
| Tests | `npm test` (in `chronicles-of-lumina/`) | 99 Assertions in 8 Test-Files, alle grün |
| Discord-Bot | [`chronicles-of-lumina/bot/`](./chronicles-of-lumina/bot/) | LuminaBot (discord.js v14, 8 Commands, 4 Events) |
| Desktop | [`chronicles-of-lumina/desktop/`](./chronicles-of-lumina/desktop/) | Electron-Wrapper |

## Steuerung (Kurzfassung)

| Taste | Aktion |
|-------|--------|
| WASD / Pfeile | Bewegung |
| Maus ziehen | Kamera rotieren |
| Leertaste / Klick | Angriff |
| Shift | Ausweichrolle |
| E | Interaktion (Schrein, Elder) **oder Portal** |
| Esc / P | Pause |

Mobile: virtueller Joystick + Aktions-Buttons.

## Tech-Stack

- **JavaScript (ES-Module)** — kein Build-Step, keine Bundler
- **Three.js 0.160** via Importmap (CDN)
- **Web Audio API** — synthetisierte SFX, keine Audio-Assets
- **WebGL** für 3D, mit Fallback-Hinweis bei fehlender Unterstützung
- **LocalStorage** für Settings, Codex, Map-Codes

## Highlights

- **5 thematische Biome** — Smaragdwald / Golddünen / Sturmgipfel / Nebelmarsch / Glutkessel
- **URL-shared Custom Maps** — `?map=verdant:20473104` lädt geteilte Karten
- **99 Tests, alle grün** — 8 Test-Files, 0 Frameworks
- **Zero-Build** — pure ES-Module, läuft aus jedem statischen Host
- **Multi-Platform** — Web, Android (PWA), Desktop (Electron)

## Architektur

```
chronicles-of-lumina/src/
├── main.js           # 5-Zeilen-Bootstrap
├── core/             # Game, Loop, Config, Constants, State, EventBus, Settings, HitStop, Screen-State
├── engine/           # Three.js, Audio, Input, Camera (Shake/Kick), Lighting, Materials
├── world/            # World-Builder, Terrain, Village, Forest, Shrine, Environment, Props, Particles, Minimap, Zones, Zone-Portals
├── entities/         # Player, Enemies, Boss, Projectile, Loot, NPCs
├── systems/          # Combat, Quest, XP, Inventory, Dialogue, Interaction, Feedback, Codex, Spawn
├── ui/               # HUD, Menus, Panels, Icons, Zone-Picker, Settings, Mobile-Controls
└── utils/            # Math, Random, Pool, Tween, DOM, Time, UV, AssetGen
```

Bottom-up Abhängigkeiten, eine Source of Truth für Balancing (`core/config.js`), Event-Bus als einzige Kopplung zwischen Systems und UI.

## Roadmap

27 Phasen done (siehe [`chronicles-of-lumina/ROADMAP.md`](./chronicles-of-lumina/ROADMAP.md) für Details):

| # | Phase | Status |
|---|-------|--------|
| 0–9 | Plumbing → Polish → Doku | ✅ |
| R1–R7 | Refactor (Systems auf `game`-Param, Monkey-Patches weg, etc.) | ✅ |
| 10 | Prozedurale Asset-Generierung | ✅ |
| 11 | LuminaBot Discord-Bot | ✅ |
| 12 | Hygiene (Dead-Code, CI-Workflows) | ✅ |
| 13 | JSDoc Type-Safety | ✅ |
| 14 | GitHub-Pages + Release v0.10.3 | ✅ |
| 15 | Security (SECURITY.md, Dependabot, npm-audit) | ✅ |
| 16 | Test-Coverage (53 → 74 Assertions) | ✅ |
| 17 | i18n (t() + DE/EN Locales) | ✅ |
| 18 | Quality + Performance (Audio-Sprite, Object-Pool) | ✅ |
| 19 | Open World: 5 Biome + Portale + URL Map-Codes | ✅ |
| 20 | Audio: Per-Biome Ambient Music (Web Audio synth) | ✅ |
| 21 | Audio: Adaptive Combat Music (tension + combat layers) | ✅ |
| 22 | Audio: Voice Barks (12 formant-synth effects) | ✅ |
| 23 | Maps: 5 new biomes (crystal, sky, reef, haunted, void) | ✅ |
| 24 | Maps: Procedural Dungeon Generation | ✅ |
| 25 | Atmosphere: Day/Night Cycle + Weather | ✅ |
| 26 | Maps: Secret Areas + Hidden Mini-Bosses | ✅ |
| 27 | UX: Photo Mode + 10s Replay Buffer | ✅ |

## Lizenz

MIT — siehe [`LICENSE`](./LICENSE) (TODO: hinzufügen, falls öffentlich).
