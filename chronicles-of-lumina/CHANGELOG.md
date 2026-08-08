# Changelog

Alle nennenswerten Änderungen an Chronicles of Lumina. Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).

## [0.12.0] – 2026-08-08 — Lane D story & content depth sprint

### Added (Phase 35-40)

#### NPCs & Dialog (Phase 35)
- **NPC system** (`src/systems/npc.js`): 12 roles, 13 named NPCs
  across 7 biomes, 21 dialog trees with branching choices,
  conditional unlocks (level/gold/items) and actions
  (giveItem, takeItem, giveGold, startQuest, completeQuest,
  giveXp, giveSkillPoint, openShop, rest).
- 4 shop inventories linked to vendors (Mira, Iron, Yarrow, Lyra).
- 3 class trainers (Ascheklinge Krieger / Lyric Magier / Schatten Schurke).

#### Quests (Phase 36)
- **Quest system** (`src/systems/quest.js`): 25 quests across 5 types
  (5 main, 15 side, 3 daily, 2 hidden), objective tracking for
  collect/kill/craft/visit/travel/interact/discover, prereq chains,
  reward distribution (xp/gold/items/skillPoints).
- Main chain: `q_collect_crystals` -> `q_purify_shrine` -> `q_defeat_architect`.

#### Story (Phase 37)
- **5-chapter story arc** (`src/systems/story.js`): ch_intro -> ch_call ->
  ch_shrine -> ch_void -> ch_end. Unlock conditions check crystals,
  quest completion, boss defeats.
- 12 cutscene types (fade, dialog, camera, music, ritual, cinematic, teleport, boss_intro, credits, NG+ offer).
- `CutscenePlayer` class — state machine that advances through scenes.

#### Boss Dialog (Phase 38)
- **15 boss voice lines** (`src/systems/boss-dialog.js`): 5 story bosses
  + 10 secret mini-bosses, each with intro / 2-4 taunts / death /
  victory text. Stats: hp, damage, range, aggro.
- `bossTier` difficulty classifier (easy/medium/hard/story) and
  `bossesByDifficulty` sorting.

#### Daily Challenge (Phase 39)
- **10 daily challenges** (`src/systems/daily-challenge.js`): rotating
  deterministically by date. Same day = same challenge for everyone.
- FNV-1a hash for daily seed (map generation).
- `applyDailyBonus` rewards xpMul/goldMul on completion.
- `dailyStreak` tracks consecutive days (localStorage).

#### New Game+ (Phase 40)
- **6 NG+ tiers** (`src/systems/new-game-plus.js`): 0 (base), NG+1..NG+5 Hölle.
- Difficulty scales: enemyHpMul 1.0-4.0, enemyDmgMul 1.0-3.0, xpMul 1.0-4.0, goldMul 1.0-3.0.
- Carry over: equipment (rarity bumped +1), skill tree, achievements.
- Partial carry: 50% inventory, 30% gold.
- Reset: hp/mana/xp/level, quests, bosses, visited zones.

### Tests
- 6 new test files: `npc.test.mjs`, `quest.test.mjs`, `story.test.mjs`,
  `boss-dialog.test.mjs`, `daily-challenge.test.mjs`, `new-game-plus.test.mjs`
- Total: 276 → **397 assertions** across 38 test files, all green

### Verified
- `npm test`: 397/397 grün
- All new modules pass `node --check`
- LICENSE (MIT) added, package.json bumped to 0.12.0, root README synced

## [Unreleased] — Lane C vertical-depth sprint

#### Equipment & Magic (Phase 28-29)
- **Equipment system** (`src/systems/equipment.js`): 6 slots (head/chest/legs/boots/weapon/trinket),
  5 rarities (common → legendary), 24 templates, stat bonuses (str/dex/int/vit/wis),
  set bonuses when matching pieces are worn. Equipped items appear in
  `src/ui/equipment-panel.js` (toggle `U`).
- **Magic system** (`src/systems/magic.js`): 3 schools (fire/ice/arcane), 12 spells
  (4 per school), MP + regen, school mastery multipliers.
  Spell bar (`src/ui/spell-bar.js`) shows cooldowns.
- **Player stats block** in `src/core/state.js` — `baseStats` and
  `getAllStatBonuses(equipped)` aggregate item + skill bonuses.

#### Crafting (Phase 30)
- **Crafting system** (`src/systems/crafting.js`): 4 stations (forge, alchemy, enchanting,
  cooking), 30+ recipes, 17 materials, recipe discovery on first craft.
- Material drops from gathering, monster loot, secret-area rewards.

#### Progression (Phase 31-32)
- **Skill tree** (`src/systems/skill-tree.js`): 3 branches (Krieger/Magier/Schurke),
  24 nodes (8 per branch, 2 capstones each), `J` to open. Points
  from level-ups (1 per level + 2 every 5 levels). Prereq-gated.
  `allocateNode` / `deallocateNode` / `getAllocatedBonuses`.
- **Achievement system** (`src/systems/achievement.js`): 55 achievements
  across 5 categories (combat, exploration, crafting, progression,
  secret). `checkAchievements` predicate-based, `achievementProgress`
  for numeric ones.

#### Variety (Phase 33)
- **Per-biome trees** (`src/world/zones/biome-trees.js`): 23 tree variants,
  each biome has its own pool (verdant oak/birch/bush, dunes palm/cactus,
  peaks pine, mire willow, ember obsidian, crystal crystal_cluster,
  sky cloud_bush, reef coral, haunted ghost_tree, void void_shard).
- **Per-biome enemies** (`src/world/zones/biome-enemies.js`): 36 enemy
  types, 3-4 per biome. Difficulty scales: verdant slime (2 HP) →
  void rift_lord (24 HP). 9 body shapes (slime, bug, worm, bird,
  wisp, beast, wraith, golem, column).

#### Endgame (Phase 34)
- **10 challenge modes** (`src/systems/endgame.js`): endless, hardcore,
  speedrun (10 min), glass_cannon (1 HP / 10x dmg), no_spells,
  endless_boss, ironman (hardcore + no save + 30 min), pacifist
  (0 kills), nightmare (+50% HP/dmg), random.
- **Endless waves** scale: enemyHpMul, enemyDmgMul, enemyCount
  (capped 50), xpMul.
- **Leaderboard** (localStorage `lumina-leaderboard-v1`):
  load/save/add/clear, top scores by mode, weighted score formula.

### Tests
- 7 new test files: `equipment.test.mjs`, `magic.test.mjs`,
  `crafting.test.mjs`, `skill-tree.test.mjs`, `achievement.test.mjs`,
  `biome-variety.test.mjs`, `endgame.test.mjs`
- Total: 213 → **276 assertions** across 32 test files, all green

### Verified
- `npm test`: 276/276 grün
- All new modules pass `node --check`
- 7 commits on `main` (Phases 28-34)

## [Unreleased] — Lane B audio + map sprint

### Added (Phase 20-27)

#### Audio
- **Per-biome ambient music** (`src/engine/music.js`): 10 unique 3-layer
  tracks (pad + arpeggio + texture) synthesized via Web Audio API.
  Crossfade on zone change.
- **Adaptive combat music** (Phase 21): tension layer fades in
  based on enemy proximity, combat layer triggers on hit/damage
  with percussion + melody. Decays after 4s of no combat.
- **Voice barks** (Phase 22): 12 procedural vocal-style SFX via
  formant synthesis (hit, hit_critical, miss, levelup, lowhp,
  death, pickup, portal, boss, parry, combo, ultimate).
  Triggered by game events (damage, attack, level-up, pickup,
  zone change, boss spawn, death).
- Per-biome music scales: verdant A-minor pentatonic, dunes
  G-minor, peaks C-major, mire F-dorian, ember D-minor, plus
  crystal/sky/reef/haunted/void phrygian/lydian/mixolydian

#### Maps
- **5 new biomes** (Phase 23): Kristallhöhlen (underground, glowing
  crystals), Himmeltempel (floating islands, pastel clouds),
  Gezeitenriff (underwater coral), Geisterruinen (purple mist),
  Leerenspalt (cosmic void, NEW hardest zone at 2.2 difficulty)
- **Procedural dungeon generation** (Phase 24): 3 dungeon types
  (crypt, mine, tower) with deterministic layout per seed.
  Constrained random walk with 8-12 rooms, L-shaped corridors,
  entrance + boss + exit guarantee. Validates in-bounds.
- **Day/night cycle** (Phase 25): 10-min real-time = full 24h
  cycle. Sky color shifts (night→dawn→day→dusk), fog density
  varies, sun position drives directional light, ambient
  intensity follows time-of-day curve.
- **Per-biome weather** (Phase 25): verdant rain/fog, dunes
  sandstorm, peaks snow/fog, mire fog/drizzle, ember ash/
  ember-rain, crystal glow/sparkle, reef drizzle/current,
  haunted mist, void void-storm/rift. State persists across
  zone visits.
- **10 secret areas** (Phase 26): one hidden mini-boss per
  biome. Verdant Treant, Sand King, Frost Lord, Miremother,
  Titan Forger, Crystal Warden, Sky Seraph, Kraken Lord,
  Shadow Self (mirrors player), The Architect (final boss,
  HP 50). Each has unique loot drops + codex unlocks.

#### UX
- **Photo mode** (Phase 27): `takePhoto(canvas)` captures the
  game canvas as PNG and triggers a browser download via
  temp anchor. iOS Safari fallback to window.open.
- **Replay buffer** (Phase 27): 10s @ 60fps = 600-frame
  circular buffer. Records player position + camera yaw +
  current zone. `getHighlights()` for 20-frame scrub UI,
  `summarizeReplay()` for end-screen stats (zones visited,
  max distance, duration, frame count).

### Tests
- 8 new test files: `music.test.mjs`, `voice.test.mjs`,
  `zones.test.mjs` (updated), `dungeon-gen.test.mjs`,
  `sky.test.mjs`, `secret-areas.test.mjs`, `photo-replay.test.mjs`
- Total: 99 → **145 assertions**, all green
- 16 new files, ~3500 LOC added

### Verified
- `npm test`: 145/145 grün
- All new modules pass `node --check`
- Lane B is complete: every phase (20-27) committed + pushed

## [0.10.8] – 2026-08-01

### Added (Phase 19 — Open World)

#### Biome-System
- **5 thematische Biome** als reines Data in `src/world/zones/index.js`:
  Smaragdwald (Wald/Starter) · Golddünen (Wüste) · Sturmgipfel (Berge) · Nebelmarsch (Sumpf) · Glutkessel (Vulkan/Endgame).
  Jedes Biom definiert eigenen Himmel, Fog, Boden-Farbe, Enemy-Pool, Boss-Pool, Difficulty und Spawn-Punkte.
- **Biom-Cards auf dem Start-Screen** (`src/ui/zone-picker.js`) mit Schwierigkeits-Pips, Swatch und Hover/Selected-States.
- **Map-Code-Input** akzeptiert `zoneId:base36-seed` und lädt die Karte direkt.

#### Portale
- **Sichtbare Torus-Portale** (`src/world/zone-portal.js`) im 3D-World, mit Sprite-Label "Portal: <Ziel>".
  Jedes Biom spawnt 2-3 Portale, sortiert nach Difficulty-Proximity für natürliche Progression.
- **Overlap-Detection** via `findPortalAt()` — `E` triggert Biome-Wechsel.
- **In-World Zone-Indicator** oben in der Mitte zeigt aktuelles Biom mit farbigem Swatch.
- **Portal-Hint** ([E] Portal: <Ziel>) ersetzt den generischen Hint, wenn Spieler in Reichweite ist.

#### Zone-Transition
- **White-Flash + 6-Frame Hit-Stop** vor dem World-Rebuild, damit der Mesh-Swap nicht poppt.
- **Disposer** (`Game._disposeWorld()`) — entfernt Village/Forest/Shrine/Props, behält Player/Elder/Projectiles.
- **Enemy-Clear-Hook** (`EnemySystem.clear()`) — alte Biome-Mobs verschwinden.
- **Player-Reposition** — Spieler wird zum neuen Hub teleportiert.

#### URL-Integration
- `?map=verdant:20473104` lädt eine Custom-Map beim Start (überschreibt Daily-Seed).
- End-Screen Share-Button emittiert `?map=` statt `?seed=`.

### Added (Phase 9+ — Visual Refresh)
- **Mystical-Violet-Palette** — durchgehendes Theme: Violet (Akzent), Cyan (XP), Rose (Boss/Damage), Emerald (HP).
- **19 Lucide-Style inline SVG-Icons** in `src/ui/icons.js` — heart, sparkle, scroll, skull, sword, shield, crystal, berry, pause, play, gear, book, backpack, crosshair, volume, volumeOff, refresh, share, trophy, target.
- **Frosted-Glass-Panels** mit `backdrop-filter: blur(14px)` + inner Top-Highlight.
- **Cinzel Display-Font** für Titel, Inter für Body — Google-Fonts import.
- **Custom-styled Sliders, Toggles, kbd-Badges** — kein Browser-Default mehr.
- **Colorblind-Mode-Pattern** — Boss-Bar bekommt zusätzlich Diagonal-Streifen + Heart-Outlines.
- **Reduced-Motion-Variants** — alle Transitions/Animations respektiert.

### Fixed
- `settings-panel.js` — fehlender `state`-Import (Crashes beim Settings-Öffnen) — **gefixt**.
- `settings-panel.js` — auto-showte auf jedem PAUSED-Transition (Escape → Settings statt Pause) — **gefixt** (jetzt echtes Modal mit `show()`/`hide()`).
- `hud.js` — HP-Bar zeigte Kristall-Count statt HP — **gefixt** (jetzt echte HP-Logik + Low-HP-Warn-Farbe).
- `menus.js` — End-Screen `h1.innerHTML`-Write zerstörte Trophy-Icon — **gefixt** (Label-Span-Pattern).
- `dialog-panel.js` — Who-Text überschrieb Icon — **gefixt** (`.who-name`-Span).
- `menus.js` — Mute-Button-Write zerstörte Icon — **gefixt** (Label + Icon getrennt).
- `enemy-system.js` — Stray `return e;` aus Refactor brach Dispose-Flow — **gefixt**.

### Tests
- `tests/zones.test.mjs` (9 Tests): Registry-Validität, Map-Code-Codec, Round-Trip.
- Total: **90 → 99 Assertions** in 15 Test-Files, alle grün.

### Verified
- `npm test`: 99/99 grün
- Playwright Headless: 0 runtime errors, Biome-Wechsel rendert korrekt (Wald → Wüste = warmer Sand-Boden mit Orange-Sky).

## [0.10.7] – 2026-08-01

### Added (Phase 18 Performance)
- **FPS-Profiler-Overlay** (`src/ui/perf-overlay.js`): kleines Top-Left-DOM-Overlay mit FPS, Frame-Time-Avg, Max-Frame, JS-Heap (wenn `performance.memory` verfügbar). Aktiviert via `?debug=perf` Query-Param. Sample-Window 250ms, max 120 Samples.
- **Object-Pool für Projektile** (`src/entities/projectile.js`): nutzt den vorhandenen `src/utils/pool.js` für `shots` (Pool-Size 24) und `slam rings` (Pool-Size 8). Recycling via `Pool.release()`. Hard-Cap `MAX_ALIVE_SHOTS=80` als Sicherheitsnetz. Allokationen pro Frame im Hot-Path ≈ 0.
- **Audio-Sprite** (`src/engine/audio.js`): alle 5 SFX-Presets werden beim ersten `ensure()` in **einen** `AudioBuffer` gerendert (Phase 4 Procedural → Phase 18 Buffer). Playback via `BufferSource.start(when, offset, duration)` — keine OscillatorNode-Allocs pro Shot mehr. Fallback-Pfad bleibt für kaputte Browser.

### Tests
- `tests/pool.test.mjs` (5 Tests): prebuilt count, acquire/release roundtrip, grow-on-exhaustion, releaseAll, forEachActive
- `tests/perf-overlay.test.mjs` (4 Tests): wantsPerfOverlay-URL-Parsing (true/false/empty/extra-params)
- Total: **81 → 90 Assertions** in 14 Test-Files, **30/30 runs stabil**

### Verified
- `npm test`: 90/90 grün, 30/30 runs stabil
- `npm run check`: 13 verbleibende Errors (alle in `ui/*`/`engine/input.js` DOM-Lib-Types, pre-existing)
- Keine neuen Allocations im Hot-Path (Projektile + SFX)

### CI
- `webpack.yml`: `working-directory: chronicles-of-lumina`, `npm test` statt `npx webpack`
- `nextjs.yml` Boilerplate entfernt (war für Next.js, nicht unser Stack)

## [0.10.6] – 2026-08-01

### Fixed (Phase 18-Vorbereitung: Quality-Hardening)
- **Test-Flake-Fix**: `tests/loop.test.mjs` "update() is called" war in 6-10% der Runs flaky (passing t=0 als ersten Frame → frameTime negativ, accumulator hungert). Fix: realistische Timestamp `performance.now() + 16` für ersten Frame. **Stabilität: 100/100 runs grün.**
- **Type-Bug**: `src/core/game.js(382)` — `SCREEN.ENDScreen` (alt) → `SCREEN.ENDSCREEN` (neu nach JSDoc-Refactor)
- **Type-Bug**: `src/utils/random.js` — Date-Arithmetic `d - start` → `d.getTime() - start.getTime()`
- **Type-Bugs**: `src/core/game.js` — `textContent = number` ohne Cast → `String(...)` Cast (4 Stellen)
- **Type-Bugs**: `src/core/game.js` — `three.set()` auf Color/Texture-Union mit `@ts-ignore`
- **Type-Bugs**: `src/core/i18n.js` — `Locale`-Cast + `availableLocales()`-Rückgabetyp
- **Type-Bug**: `src/utils/asset-gen.js` — `window.AssetGen` Cast + Compass-Rose-Tupel-Type

### Verified
- `npm test`: 81/81 grün, **100/100 runs stabil**
- `npm run check`: 34 → **14 Errors** (alle in `ui/*`/`engine/*` DOM-Lib-Types, nicht im JSDoc-Scope)
- `bot/npm test`: grün (8+4+8+3 = 23 Tests)

## [0.10.5] – 2026-08-01

### Added (Phase 17: i18n)
- Hinzugefügt: `src/core/i18n.js` — `t(key, params)` Lookup, `setLocale()`/`getLocale()`, `availableLocales()`, {param}-Interpolation, Default-Locale-Fallback, localStorage-Persistenz
- Hinzugefügt: `src/locales/de.json` — deutsche Strings (UI-Controls, HUD, Codex, Dialog-Sprecher, Dialog-Texte)
- Hinzugefügt: `src/locales/en.json` — englische Übersetzung mit Key-übereinstimmung
- Hinzugefügt: `tests/i18n.test.mjs` — 7 Tests (availableLocales, getLocale, setLocale, Param-Interpolation, Fallback, DE/EN-Key-Symmetry, Codex/Dialog-Coverage)
- Hinzugefügt: `codex-system.retranslate()` Methode — re-derived name/desc nach Locale-Switch

### Changed
- Geändert: `codex-system.js` — `ENTRIES` → `ENTRIES_META` + `buildEntries()` (Texte aus i18n)
- Geändert: `dialogue-system.js` — `startIntro`/`bossWarning`/`bossDefeated`/`victory` nutzen `t('dialog.*')` mit i18n-Speaker-Keys

### Verified
- `npm test` grün: 74 → **81 Assertions** in 12 Test-Dateien
- 3/3 consecutive runs stabil
- DE/EN-Locales sind key-symmetrisch (geprüft via Test)

## [0.10.4] – 2026-08-01

### Added (Phase 16: Test-Coverage)
- Hinzugefügt: `tests/state.test.mjs` — 5 Tests (state-Init, mutator, isPlaying/isPaused, setPhase, killed-counts)
- Hinzugefügt: `tests/screen-state.test.mjs` — 4 Tests (SCREEN-Frozen, transition emits change, invalid-move, no-op)
- Hinzugefügt: `tests/event-bus-edge.test.mjs` — 6 Tests (unsubscribe-handle, off-specific, no-listeners no-throw, throw-doesnt-stop-others, clear, set-dedup)
- Hinzugefügt: `tests/loop.test.mjs` — 6 Tests (DT, start/stop, update DT=1/60, paused halts, resume, onPauseChange-once)

### Changed
- Geändert: Test-Coverage 53 → **74 Assertions** in 11 Test-Dateien (alle grün)
- Geändert: `state.test.mjs` + `screen-state.test.mjs` reseten `state` zwischen Tests wegen cross-test-Kontamination (loop.test.mjs advance-ed `state.time`)

### Verified
- `npm test` grün: 74/74 in 11 Test-Dateien
- `npm run check` weiterhin grün für `core/+systems/`

## [0.10.3] – 2026-08-01

### Added (Phase 14: Distribution + Phase 13: Type-Safety)
- JSDoc Type-Hints, jsconfig.json, GitHub Pages, Showcase-Banner

## [0.10.2] – 2026-08-01

### Added (Phase 15: Security & Supply-Chain)
- SECURITY.md, Dependabot, security.txt

## [0.10.1] – 2026-08-01

### Removed (Phase 12: Code-Hygiene)
- Dead-Code entfernt, Workflows SHA-pinned

## [0.10.0] – 2026-08-01

### Added (Phase 11: LuminaBot Discord-Bot)
- Kompletter discord.js v14 Bot mit 8 Commands + 4 Events

## [0.9.2] – 2026-08-01

### Added (Phase 10: Procedural Asset-Generation)
- Vollständige prozedurale Canvas-2D Asset-Generierung

## [0.9.1] – 2026-08-01

### Added (Refactor R7)
- Unit-Test-Suite, Multi-Plattform-Deployment, Electron, PWA

## [0.9.0] – 2026-08-01

### Changed (Refactor R1–R6)
- Systems auf game-Param, Loop-Klasse, main.js auf 5 Zeilen

## [0.8.0] – 2026-08-01

### Added (Phase 0–8)
- Foundation: Hitstop, Feedback, Camera, Combat, UI, Codex, Daily Seed, Settings
