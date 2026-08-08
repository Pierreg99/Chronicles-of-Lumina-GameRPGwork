# Lumina-Game

3D-Browser-Action-Adventure, modular aufgebaut mit Vanilla JS + Three.js.

> Hauptprojekt: **[Chronicles of Lumina](./chronicles-of-lumina/)** — eine eigenständige Fantasy-Welt im JRPG-Stil mit **10 thematischen Biomen**, Portal-Navigation, URL-shared Custom-Maps, vollständiger Story, Quests, NPCs, Equipment, Magic, Crafting, Skill-Tree, Achievements und New Game+.

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
| Spiel | [`chronicles-of-lumina/`](./chronicles-of-lumina/) | Vollständige ES-Modul-Architektur, 100+ JS-Dateien, prozedurale Assets |
| Doku | [`chronicles-of-lumina/README.md`](./chronicles-of-lumina/README.md) | Modul-Architektur, Steuerung, Erweiterungs-Patterns |
| Plan | [`chronicles-of-lumina/ROADMAP.md`](./chronicles-of-lumina/ROADMAP.md) | 40 Phasen done |
| Tests | `npm test` (in `chronicles-of-lumina/`) | **397 Assertions** in 38 Test-Files, alle grün |
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
| I | Inventar |
| C | Codex |
| U | Equipment |
| J | Skill-Tree |

Mobile: virtueller Joystick + Aktions-Buttons.

## Tech-Stack

- **JavaScript (ES-Module)** — kein Build-Step, keine Bundler
- **Three.js** via Importmap (CDN)
- **Web Audio API** — synthetisierte SFX + prozedurale Musik, keine Audio-Assets
- **WebGL** für 3D, mit Fallback-Hinweis bei fehlender Unterstützung
- **LocalStorage** für Settings, Codex, Map-Codes, Progress

## Highlights

- **10 thematische Biome** — Smaragdwald / Golddünen / Sturmgipfel / Nebelmarsch / Glutkessel + Kristallhöhlen / Himmeltempel / Gezeitenriff / Geisterruinen / Leerenspalt
- **URL-shared Custom Maps** — `?map=verdant:20473104` lädt geteilte Karten
- **397 Tests, alle grün** — custom Runner, 0 Frameworks
- **Zero-Build** — pure ES-Module, läuft aus jedem statischen Host
- **Multi-Platform** — Web, Android (PWA), Desktop (Electron)
- **Vollständige Progression** — Equipment, Magic (3 Schools), Crafting, Skill-Tree, Achievements, NG+, Daily Challenges, Endgame-Modi

## Architektur

```
chronicles-of-lumina/src/
├── main.js           # 5-Zeilen-Bootstrap
├── core/             # Game, Loop, Config, Constants, State, EventBus, Settings, HitStop, Screen-State, i18n
├── engine/           # Three.js, Audio, Music, Voice, Input, Camera, Lighting, Materials
├── world/            # World-Builder, Terrain, Village, Forest, Shrine, Environment, Props, Particles, Minimap, Zones, Zone-Portals, Dungeons, Secret Areas
├── entities/         # Player, Enemies, Boss, Projectile, Loot, NPCs
├── systems/          # Combat, Quest, XP, Inventory, Dialogue, Interaction, Feedback, Codex, Spawn, Equipment, Magic, Crafting, Skill-Tree, Achievement, Story, NPC, Boss-Dialog, Daily-Challenge, New-Game-Plus, Endgame
├── ui/               # HUD, Menus, Panels, Icons, Zone-Picker, Settings, Mobile-Controls, Spell-Bar, Equipment-Panel
└── utils/            # Math, Random, Pool, Tween, DOM, Time, UV, AssetGen
```

Bottom-up Abhängigkeiten, eine Source of Truth für Balancing (`core/config.js`), Event-Bus als einzige Kopplung zwischen Systems und UI.

## Roadmap

40 Phasen done (siehe [`chronicles-of-lumina/ROADMAP.md`](./chronicles-of-lumina/ROADMAP.md) und [`CHANGELOG.md`](./chronicles-of-lumina/CHANGELOG.md) für Details).

## Lizenz

MIT — siehe [`LICENSE`](./LICENSE).
