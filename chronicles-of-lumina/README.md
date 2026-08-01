# Chronicles of Lumina

Ein 3D-Action-Adventure im farbenfrohen JRPG-Fantasy-Stil. Browser-nativ, Vanilla JS, Three.js, Web Audio API. Keine externen Build-Tools, keine Asset-Pipeline.

> Vertikale Slice Demo: Sammle 10 Lichtkristalle, besiege den Nebel-Koloss, reinige den Schrein.

## Schnellstart

Das Spiel benötigt einen einfachen lokalen Webserver (ES-Module + TextureLoader brauchen http://):

```bash
cd chronicles-of-lumina
python3 -m http.server 8080
# dann im Browser öffnen: http://localhost:8080/game.html
```

Oder mit Node:
```bash
npx serve .
```

## Steuerung

| Taste            | Aktion                                |
|------------------|---------------------------------------|
| WASD / Pfeile    | Bewegung                              |
| Maus ziehen      | Kamera rotieren                       |
| Leertaste / Klick| Angriff (Schwert)                     |
| Shift            | Ausweichrolle                         |
| E                | Interaktion (Schrein, Dorfälteste)    |
| Esc / P          | Pause                                 |
| I                | Inventar                              |

Auf Mobile: virtueller Joystick links, Aktions-Buttons rechts.

## Modul-Architektur

```
chronicles-of-lumina/
├── game.html              # Entry, lädt main.js als ES-Modul
├── style.css              # V3-UI-Stil
├── assets/                # PNG-Assets + Atlas (4×4 Grid, 512×512)
└── src/
    ├── main.js            # Bootstrap + Loop
    ├── core/              # Konfiguration, State, Event-Bus
    │   ├── config.js      # Balancing-Werte (eine Quelle der Wahrheit)
    │   ├── constants.js   # Event-Namen, Layer, Input-Bindings
    │   ├── state.js       # Globaler Spielzustand
    │   └── event-bus.js   # Pub/Sub
    ├── engine/            # Three.js- und Runtime-Brücke
    │   ├── renderer.js    # WebGLRenderer + WebGL-Fallback
    │   ├── scene.js       # Scene + Fog
    │   ├── camera.js      # Third-Person Follow Camera
    │   ├── lighting.js    # Sonne + Hemi
    │   ├── materials.js   # Toon-Factory + Atlas-Loader
    │   ├── audio.js       # Web Audio SFX
    │   ├── input.js       # Keyboard + Maus + Touch + Joystick
    │   ├── mobile-input.js
    │   └── collision.js   # AABB / Kreis-Sweep
    ├── world/             # Szenen-Aufbau
    │   ├── world-builder.js
    │   ├── terrain.js     # Boden + Weg
    │   ├── village.js     # Häuser, Brunnen, Bäume
    │   ├── forest.js      # Nebel, mehr Bäume
    │   ├── shrine.js      # Schrein
    │   ├── environment.js # Wolken
    │   ├── props.js       # Schilder, Blumen
    │   ├── particles.js   # Partikel-Pool
    │   └── minimap.js     # 2D-Mini-Map
    ├── entities/          # Spieler, Gegner, NPCs
    │   ├── player.js
    │   ├── player-animation.js
    │   ├── player-combat.js
    │   ├── enemy-base.js  # geteilte Slime-Logik
    │   ├── slime-blue.js
    │   ├── slime-green.js
    │   ├── slime-purple.js
    │   ├── boss-nebelkoloss.js
    │   ├── projectile.js
    │   ├── loot.js
    │   └── npc-elder.js
    ├── systems/           # Gameplay-Orchestrierung
    │   ├── combat-system.js
    │   ├── enemy-system.js
    │   ├── boss-system.js
    │   ├── quest-system.js
    │   ├── xp-system.js
    │   ├── inventory-system.js
    │   ├── interaction-system.js
    │   ├── dialogue-system.js
    │   ├── spawn-system.js
    │   └── ui-system.js
    ├── ui/                # Reine Darstellung
    │   ├── hud.js
    │   ├── menus.js
    │   ├── dialog-panel.js
    │   ├── quest-panel.js
    │   ├── xp-panel.js
    │   ├── boss-bar.js
    │   ├── inventory-panel.js
    │   └── mobile-controls.js
    └── utils/             # Keine Gameplay-Abhängigkeiten
        ├── math.js
        ├── random.js
        ├── pool.js
        ├── dom.js
        ├── time.js
        └── uv_helper.js   # Atlas-UVs
```

**Kopplung:** Bottom-up.
- `utils` kennt nichts.
- `core` nutzt `utils`.
- `engine` nutzt `core` + `utils`.
- `world` nutzt `engine`.
- `entities` nutzen `engine` + `world` (per `materials`).
- `systems` orchestrieren `entities` + `world`.
- `ui` reagiert auf `core/event-bus` und liest `systems`-State.

## Erweiterung

- **Neuer Gegnertyp:** eigene Klasse in `entities/`, Spec in `enemy-base.js` ergänzen, optional `enemy-system.spawnInitial` erweitern.
- **Neue Quest:** `config.js` + `quest-system.js` + `dialogue-system.say()`.
- **Neues Biom:** `world/`-Modul, in `world-builder.js` registrieren.
- **Neue Fähigkeit:** Input-Binding in `engine/input.js` + `player.js` + ggf. Combat-System.

## Roadmap

- [ ] Speichern/Laden (LocalStorage)
- [ ] Soundtrack (modulares Musik-System)
- [ ] Inventar-Erweiterung (Crafting, Ausrüstung)
- [ ] Mehrere Biome (Wüste, Schnee)
- [ ] Koop-Modus
- [ ] Touch-UX-Verbesserungen (Inventar radial, etc.)
