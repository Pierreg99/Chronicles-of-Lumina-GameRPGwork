# Lumina-Game

3D-Browser-Action-Adventure, modular aufgebaut mit Vanilla JS + Three.js.

> Hauptprojekt: **[Chronicles of Lumina](./chronicles-of-lumina/)** — eine eigenständige Fantasy-Welt im JRPG-Stil, vertikale Slice Demo.

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

## Was ist drin

| Bereich | Pfad | Inhalt |
|---------|------|--------|
| Spiel | [`chronicles-of-lumina/`](./chronicles-of-lumina/) | Vollständige ES-Modul-Architektur, 50+ JS-Dateien, 22 PNG-Assets |
| Plan | [`chronicles-of-lumina/ROADMAP.md`](./chronicles-of-lumina/ROADMAP.md) | 9-Phasen-Plan für Evolution (Spielgefühl, UX, Add-ons) |
| Doku | [`chronicles-of-lumina/README.md`](./chronicles-of-lumina/README.md) | Modul-Architektur, Steuerung, Erweiterungs-Patterns |

## Steuerung (Kurzfassung)

| Taste | Aktion |
|-------|--------|
| WASD / Pfeile | Bewegung |
| Maus ziehen | Kamera rotieren |
| Leertaste / Klick | Angriff |
| Shift | Ausweichrolle |
| E | Interaktion |
| Esc / P | Pause |

Mobile: virtueller Joystick + Aktions-Buttons.

## Tech-Stack

- **JavaScript (ES-Module)** — kein Build-Step, keine Bundler
- **Three.js 0.160** via Importmap (CDN)
- **Web Audio API** — synthetisierte SFX, keine Audio-Assets
- **WebGL** für 3D, mit Fallback-Hinweis bei fehlender Unterstützung
- **LocalStorage** für Settings & Codex (geplant)

## Architektur

```
chronicles-of-lumina/src/
├── main.js           # Bootstrap + Game-Loop
├── core/             # Config, State, Event-Bus, Settings, HitStop
├── engine/           # Three.js, Audio, Input, Collision
├── world/            # Terrain, Village, Forest, Shrine, Particles, Minimap
├── entities/         # Player, Enemies, Boss, Projectile, Loot, NPCs
├── systems/          # Combat, Quest, XP, Inventory, Dialogue, Feedback
├── ui/               # HUD, Menus, Panels
└── utils/            # Math, Random, Pool, Tween, DOM, Time, UV
```

Bottom-up Abhängigkeiten, eine Source of Truth für Balancing (`core/config.js`), Event-Bus als einzige Kopplung zwischen Systems und UI.

## Roadmap

Siehe [`chronicles-of-lumina/ROADMAP.md`](./chronicles-of-lumina/ROADMAP.md) für den 9-Phasen-Plan:

1. ✅ Plumbing (Tween, Settings, Events) — committed
2. 🔄 Spielgefühl-Foundation (Hit-Stop, Feedback-System) — in Arbeit
3. ⏳ Camera- & Combat-Polish
4. ⏳ UI-Architektur (Screen-State, deklarative HUD)
5. ⏳ Extended Feedback (Combo, Slowmo, Damage-Direction)
6. ⏳ UX-Features (Tutorial, Dialog-Choices, Pause-Hierarchie)
7. ⏳ Codex/Bestiarium
8. ⏳ Daily-Seed-Run
9. ⏳ Settings + Accessibility
10. ⏳ Final-Doku

## Lizenz

MIT — siehe [`LICENSE`](./LICENSE) (TODO: hinzufügen, falls öffentlich).
