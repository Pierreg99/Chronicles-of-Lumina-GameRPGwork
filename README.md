# Chronicles of Lumina

3D-Browser-Action-Adventure, modular aufgebaut mit Vanilla JS + Three.js.

> Hauptprojekt: **[Chronicles of Lumina](./chronicles-of-lumina/)** — eine eigenständige Fantasy-Welt im JRPG-Stil mit **10 thematischen Biomen**, Portal-Navigation, URL-shared Custom-Maps, vollständiger Story, Quests, NPCs, Equipment, Magic, Crafting, Skill-Tree, Achievements und New Game+.

## Schnellstart

Repo-root `index.html` redirects to `chronicles-of-lumina/game.html` (preserves `?query` and `#hash`).

```bash
# From repo root (redirect → game):
python3 -m http.server 8080
# Browser: http://localhost:8080/   or   .../chronicles-of-lumina/game.html

# Or serve the game folder directly:
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

**Live-Demo (dieses Repo):** [pierreg99.github.io/Chronicles-of-Lumina-GameRPGwork](https://pierreg99.github.io/Chronicles-of-Lumina-GameRPGwork/)

> Hinweis: Ältere Links auf `pierreg99.github.io/Lumina-Game` zeigen auf ein separates Demo-Repo. Canonical Pages für **dieses** Repository ist die URL oben.

## Was ist drin

| Bereich | Pfad | Inhalt |
|---------|------|--------|
| Spiel | [`chronicles-of-lumina/`](./chronicles-of-lumina/) | Vollständige ES-Modul-Architektur, 100+ JS-Dateien, prozedurale Assets |
| Doku | [`chronicles-of-lumina/README.md`](./chronicles-of-lumina/README.md) | Modul-Architektur, Steuerung, Erweiterungs-Patterns |
| Plan | [`chronicles-of-lumina/ROADMAP.md`](./chronicles-of-lumina/ROADMAP.md) | 40 Phasen done + v0.13 polish |
| Tests | `npm test` (in `chronicles-of-lumina/`) | **401 Assertions** in 37 Test-Files |
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

Mobile: virtueller Joystick, Lookpad (Kamera), Aktions-Buttons + Pause.

## Tech-Stack

- **JavaScript (ES-Module)** — kein Build-Step, keine Bundler
- **Three.js** via Importmap (CDN)
- **Web Audio API** — synthetisierte SFX + prozedurale Musik, keine Audio-Assets
- **WebGL** für 3D, mit Fallback-Hinweis bei fehlender Unterstützung
- **LocalStorage** für Settings, Codex, Map-Codes, Progress

## Highlights

- **10 thematische Biome** — Smaragdwald / Golddünen / Sturmgipfel / Nebelmarsch / Glutkessel + Kristallhöhlen / Himmeltempel / Gezeitenriff / Geisterruinen / Leerenspalt
- **URL-shared Custom Maps** — `?map=verdant:20473104` lädt geteilte Karten
- **401 Tests** — custom Runner, 0 Frameworks
- **Zero-Build** — pure ES-Module, läuft aus jedem statischen Host
- **Multi-Platform** — Web, Android (PWA), Desktop (Electron)
- **Vollständige Progression** — Equipment, Magic (3 Schools), Crafting, Skill-Tree, Achievements, NG+, Daily Challenges, Endgame-Modi
- **v0.13 Immersive polish** — Boot-Loader, Safe-Area Mobile UI, Lookpad, adaptive DPR, Tab-Auto-Pause

## Architektur

```
chronicles-of-lumina/src/
├── main.js           # Bootstrap + Boot-Loader dismiss
├── core/             # Game, Loop, Config, Constants, State, EventBus, Settings, HitStop, Screen-State, i18n
├── engine/           # Three.js, Audio, Music, Voice, Input, Camera, Lighting, Materials
├── world/            # World-Builder, Terrain, Village, Forest, Shrine, Environment, Props, Particles, Minimap, Zones, Zone-Portals, Dungeons, Secret Areas
├── entities/         # Player, Enemies, Boss, Projectile, Loot, NPCs
├── systems/          # Combat, Quest, XP, Inventory, Dialogue, Interaction, Feedback, Codex, Spawn, Equipment, Magic, Crafting, Skill-Tree, Achievement, Story, NPC, Boss-Dialog, Daily-Challenge, New-Game-Plus, Endgame
├── ui/               # HUD, Menus, Panels, Icons, Zone-Picker, Settings, Mobile-Controls, Spell-Bar, Equipment-Panel
└── utils/            # Math, Random, Pool, Tween, DOM, Time, UV, AssetGen, Clipboard
```

Bottom-up Abhängigkeiten, eine Source of Truth für Balancing (`core/config.js`), Event-Bus als einzige Kopplung zwischen Systems und UI.

## Deploy / GitHub Pages

Pages wird per GitHub Actions aus `chronicles-of-lumina/` publiziert (`game.html` → `index.html` via `npm run build-pages`).

- Workflow: [`.github/workflows/pages.yml`](./.github/workflows/pages.yml)
- Live: https://pierreg99.github.io/Chronicles-of-Lumina-GameRPGwork/
- Lokal: siehe [`chronicles-of-lumina/DEPLOY.md`](./chronicles-of-lumina/DEPLOY.md)

## Roadmap

40 Phasen done (siehe [`chronicles-of-lumina/ROADMAP.md`](./chronicles-of-lumina/ROADMAP.md) und [`CHANGELOG.md`](./chronicles-of-lumina/CHANGELOG.md) für Details).

## Lizenz

MIT — siehe [`LICENSE`](./LICENSE).
