# Chronicles of Lumina

![Version](https://img.shields.io/badge/version-0.12.0-blue) ![Phases](https://img.shields.io/badge/phases-40%2F40-success) ![Refactor](https://img.shields.io/badge/refactor-R1--R7-success) ![Tests](https://img.shields.io/badge/tests-397%2F397-success) ![Assets](https://img.shields.io/badge/assets-procedural-success) ![Bot](https://img.shields.io/badge/bot-discord.js_v14-7B2FBE) ![Pages](https://img.shields.io/badge/pages-live-success)

<p align="center">
  <img src="docs/showcase.svg" alt="Chronicles of Lumina" width="100%">
</p>

<p align="center">
  <a href="https://pierreg99.github.io/Lumina-Game/"><strong>▶ Play the Live Demo</strong></a>
  · <a href="chronicles-of-lumina/DEPLOY.md">Deploy docs</a>
  · <a href="chronicles-of-lumina/ROADMAP.md">Roadmap</a>
  · <a href="https://github.com/Pierreg99/Lumina-Game/releases">Releases</a>
</p>

3D-Browser-Action-Adventure im farbenfrohen JRPG-Fantasy-Stil. Vanilla JS + Three.js, ES-Module, kein Build-Step.

> Vertikale Slice Demo: Sammle 10 Lichtkristalle, besiege den Nebel-Koloss, reinige den Schrein. **Erkunde 10 Biome** mit eigener Musik und Wetter, **sprich mit 13 NPCs** in 21 Dialogbäumen, **nimm 25 Quests** an, **erlebe eine 5-Kapitel-Story** mit Cutscenes, **höre 15 Bosse** mit eigenen Intros und Taunts, **spiele 10 tägliche Challenges** mit Streak, und fordere dich selbst mit **6 NG+ Schwierigkeitsstufen** plus 10 Endgame-Modi und Highscore-Bestenliste.

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

**Täglich neuen Seed spielen:** `http://localhost:8080/game.html?seed=12345`

**Custom Map laden (Phase 19+):** `http://localhost:8080/game.html?map=verdant:20473104`
(Zone:Smöl-Base36-Seed — Seed auf dem End-Screen via "Seed teilen" exportieren)

## Steuerung

| Taste | Aktion |
|-------|--------|
| WASD / Pfeile | Bewegung |
| Maus ziehen | Kamera rotieren |
| Leertaste / Klick | Angriff (3er-Combo) |
| Shift | Ausweichrolle (kurz unverwundbar) |
| E | Interaktion (Schrein, Dorfälteste) **oder Portal betreten** |
| Esc / P | Pause |
| I | Inventar |
| C | Codex / Bestiarium |
| U | Equipment |
| J | Skill-Tree |
| Mausrad über Minimap | Minimap zoomen |

Mobile: virtueller Joystick + Aktions-Buttons (E / Rollen / Angriff).

## Features

### Open World (Phase 19+)
- **10 thematische Biome** — Smaragdwald (Wald, Starter) · Golddünen (Wüste) · Sturmgipfel (Berge) · Nebelmarsch (Sumpf) · Glutkessel (Vulkan) · **Kristallhöhlen** (unterirdisch) · **Himmeltempel** (schwebend) · **Gezeitenriff** (Korallen) · **Geisterruinen** (Nebel) · **Leerenspalt** (kosmisch, Endgame)
- **Sichtbare Portale** — leuchtende Ringe auf der Karte, drücke E um das Biom zu wechseln
- **Biom-spezifische Atmosphäre** — eigener Himmel, Fog, Boden-Farbe pro Zone
- **URL-shared Custom Maps** — `?map=zoneId:seed` lädt eine geteilte Karte direkt
- **In-World Zone-Indicator** — kleines Badge oben mitten, zeigt aktuelles Biom
- **Schwierigkeits-Pips** auf den Biome-Cards signalisieren, was einen erwartet

### Audio (Phase 20-22)
- **Per-Biom Ambient Music** — 10 einzigartige 3-Layer-Tracks (Pad + Arpeggio + Texture), prozedural via Web Audio API. Crossfade bei Zonenwechsel.
- **Adaptive Combat Music** — Tension-Layer faded basierend auf Gegner-Nähe ein, Combat-Layer bei Hits/Schaden mit Percussion + Melodie. Decay nach 4s.
- **12 Voice Barks** — prozedurale Vocal-SFX via Formant-Synthese für hit/critical/miss/levelup/lowhp/death/pickup/portal/boss/parry/combo/ultimate.
- **Prozedural Dungeon Music** — crypt/mine/tower Typen mit eigenem Klangcharakter.

### Procedural (Phase 24)
- **Dungeon-Generator** — 3 Dungeon-Typen (Crypt, Mine, Tower) mit deterministischem Layout pro Seed. 8-12 Räume, L-förmige Korridore, Entrance + Boss + Exit garantiert.

### Atmosphäre (Phase 25)
- **Tag/Nacht-Zyklus** — 10 Min Echtzeit = voller 24h-Zyklus. Himmel verschiebt sich (Nacht→Morgenröte→Tag→Abenddämmerung), Fog-Dichte variiert, Sonnen-Position treibt Directional-Light.
- **Pro-Biom-Wetter** — verdant (Regen/Nebel), dunes (Sandsturm), peaks (Schnee/Nebel), mire (Nebel/Niesel), ember (Asche/Glutregen), crystal (Glühen/Funken), reef (Niesel/Strömung), haunted (Nebel), void (Leerenspalt/Riss).

### Versteckte Inhalte (Phase 26)
- **10 Secret Areas** — eine pro Biom mit einzigartigem Mini-Boss, Loot-Drops, Codex-Unlocks. Uralter Baumgeist, Sandkönig, Frostlord, Miremutter, Titan-Schmied, Kristallwächter, Himmelseraph, Krakenlord, Schatten-Selbst (spiegelt Spieler), Der Architekt (HP 50, Endgegner).

### UX (Phase 27)
- **Photo Mode** — `takePhoto(canvas)` als PNG-Download via Canvas-API
- **10s Replay Buffer** — 600-Frame Ringbuffer (60fps), Highlights-Sampling, End-Screen-Zusammenfassung (Zonen besucht, max Distanz, Dauer)

### UI (Phase 9+)
- **Mystical-Violet-Theme** — durchgehende Farbpalette: Violet (Akzent), Cyan (XP/Magie), Rose (Boss/Damage), Emerald (HP)
- **Lucide-Style SVG-Icons** — 19 inline-Icons für HUD, Buttons, Inventar, Codexe
- **Frosted-Glass-Panels** — backdrop-blur + inner Top-Highlight, fühlt sich premium an
- **Cinzel Display-Font** — Titel in einer Fantasy-Serif, Body in Inter
- **Cinzel-Titel + Glow** — Start-Screen und Pause-Menü mit dramatischem Glow
- **Kbd-Badges** — alle Tasten-Anzeigen als gestylte `<kbd>`-Elemente
- **Colorblind-Mode** — Pattern + Outline als zusätzliches Signal, nicht nur Farbe
- **Reduced-Motion-Mode** — alle Animationen respektieren `prefers-reduced-motion`
- **Settings-Modal** mit Volume-Slidern, Custom-Toggles, Reset-Button

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
- **Dodge-i-Frames** — Shift = unverwundbar für 0.35s

### Quest
- **Intro** durch die Dorfälteste mit Hinweisen
- **Tutorial-Overlay** — kontextsensitive Tipps in den ersten 20 Sekunden
- **Lichtkristalle sammeln** (0/10)
- **Boss spawnt** automatisch bei 10 Kristallen
- **Schrein-Reinigung** nach Boss-Sieg
- **Endscreen** mit Score, Zeit, Kills, Kristallen, Map-Code

### UI / UX
- **Screen-State-Machine** — explizite Übergänge zwischen Start / Playing / Paused / Dialog / Inventory / Codex / Endscreen
- **Deklarative HUD** — Panels lesen `state` + Events, kein `getElementById` in `main.js`
- **Dialog-Choices** — verzweigte Gespräche (z.B. Elder-Fragen)
- **Pause-Hierarchie** — Resume / Einstellungen / Neustart
- **Tooltips** im Inventar (Hover/Tap)
- **Damage-Flash** — roter Vollbild-Overlay bei Schaden
- **i18n-ready** — `t()`-Modul + DE/EN-Locales für Codexe + Dialoge

### Persistenz
- **Codex/Bestiarium** — 8 Einträge (Gegner, Items, Orte, Boss). Entsperrt sich automatisch beim ersten Kontakt. In LocalStorage gespeichert.
- **Settings** — Volume, Sensitivity, Reduce-Motion, Colorblind-Mode, FPS-Anzeige. LocalStorage.
- **Daily Seed** — jeden Tag ein neuer Spawn-Layout. URL-Param `?seed=…` zum Teilen. End-Screen zeigt Score.
- **Map-Codes** — `zone:seed`-Format, teilbar via "Seed teilen" auf dem End-Screen.

## Modul-Architektur

Siehe detaillierte Architektur im Root-README und in den einzelnen Modul-Dateien.

## Lizenz

MIT — siehe [`LICENSE`](../LICENSE).

## Credits

- Code: Mavis / Pierreg99
- Texturen: prozedural via `src/utils/asset-gen.js`
- Musik/SFX: Web Audio API (synthetisiert)
- Inspiration: klassische JRPGs (Final Fantasy, Dragon Quest) — ohne Marken, ohne Assets
- Icons: Lucide (MIT)
