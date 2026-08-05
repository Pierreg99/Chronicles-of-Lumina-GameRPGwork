# Plan: Lane B — Audio + Map Heavy

**Date:** 2026-08-04
**Status:** Approved by user
**Owner:** Mavis
**Token budget:** ~39M
**Estimated wall time:** ~2h

## Goal

Push Chronicles of Lumina from "vertical slice" to "atmospheric JRPG experience" by going deep on **audio atmosphere** and **map variety** while keeping the existing gameplay loop intact.

## Phases (8)

### Phase 20: Per-biome ambient music — 6M tokens
**Files:** `src/engine/music.js` (new), `src/core/state.js`, `src/core/game.js`
- Web Audio API music synthesis: each biome gets a unique base ambient loop
- Layered: 2-3 voices per track (pad + arpeggio + texture)
- Crossfade smoothly on zone change
- Triggered via `EVENTS.MUSIC_SET` bus event
- **Tests:** music.js note scheduling, crossfade timing
- **Verify:** Listen to each biome for 5+ seconds, confirm tonal shift on zone change

### Phase 21: Combat music system — 4M tokens
**Files:** `src/engine/music.js`, `src/systems/feedback-system.js`
- 3-layer adaptive system: ambient / tension / combat
- Tension layer fades in when enemy < 8m from player
- Combat layer fades in when player hits or is hit
- Smooth gain ramps (no clicks)
- **Tests:** layer transition timing
- **Verify:** Walk near enemy → tension; attack → combat; stop → ambient

### Phase 22: Voice barks + SFX variety — 3M tokens
**Files:** `src/engine/voice.js` (new), `src/engine/audio.js`
- Vocal-style SFX using formant synthesis (no real samples)
- Barks: hit (high), miss (low), level-up (rising), low-HP (warning), death (descending), item pickup (sparkle)
- Random pitch variation per trigger (avoid same-y feel)
- **Tests:** voice synth parameters, SFX pool expansion
- **Verify:** Trigger each event type, listen for distinctness

### Phase 23: 5 new biomes — 10M tokens
**Files:** `src/world/zones/index.js`, `src/world/world-builder.js`, `src/world/zones/dungeon-types.js` (new)
- **Crystal Caves** — underground, glowing blue/violet crystals, ambient sparkle particles
- **Sky Temple** — floating islands, pastel clouds, ethereal sound
- **Tidal Reef** — coral tones, water-like caustics, kelp-sway
- **Haunted Ruins** — purple/violet mist, ghostly enemies, eerie wind
- **Void Rift** — dark cosmic, moving starfield, unstable portals
- Each: full zone def (sky/fog/ground/ambient/sun/trees/rocks/enemyPool/bossPool/music/difficulty/spawns)
- Add to portal network
- **Tests:** zone def validation, encoder round-trip
- **Verify:** Walk to each, screenshot

### Phase 24: Procedural dungeon generation — 6M tokens
**Files:** `src/world/dungeon-gen.js` (new), `src/world/zones/dungeon-types.js`
- 3 dungeon types: **Crypt** (horror, dark), **Mine** (industrial, warm), **Tower** (vertical, mystic)
- Room + corridor BSP-style generator
- Procedural loot + enemy placement
- Entrance portal in zone spawn area
- **Tests:** generator determinism (same seed = same map), connectivity check
- **Verify:** Generate 10 maps, screenshot one

### Phase 25: Day/night + weather — 5M tokens
**Files:** `src/engine/sky.js` (new), `src/world/environment.js`, `src/systems/weather.js` (new)
- Day/night cycle: 10-minute real-time = full cycle
- Sky color shifts: dawn → day → dusk → night
- Sun position drives directional light + shadow direction
- Weather states per biome: clear / rain / fog / snow / sandstorm
- Weather affects visibility + enemy spawns
- **Tests:** time-of-day math, weather state machine
- **Verify:** Watch full cycle, screenshot dawn/dusk/night

### Phase 26: Secret areas + hidden bosses — 3M tokens
**Files:** `src/world/secret-area.js` (new), `src/systems/boss-system.js`
- 1 hidden area per biome (5 total)
- Visual cues: glowing crack on wall, hidden path behind waterfall
- Each contains a mini-boss + unique loot
- Codex unlocks for hidden bosses
- **Tests:** secret area detection, mini-boss spawn
- **Verify:** Find and defeat one hidden boss

### Phase 27: Photo mode + replay — 2M tokens
**Files:** `src/systems/photo-mode.js` (new), `src/systems/replay.js` (new)
- Photo mode: press P → pause game, free camera, click to download PNG via canvas.toDataURL
- Replay: 10-second input + position buffer, play back via replay UI
- "Save clip" button on end screen
- **Tests:** buffer ring, screenshot bytes
- **Verify:** Take a photo, play back a clip

---

## Risk matrix

| Risk | Severity | Mitigation |
|------|----------|------------|
| Web Audio music sounds grating | High | Use multiple voice layers + low gain; test with multiple loop lengths |
| 5 new biomes look same-y | High | Each gets distinct accent + 2 unique props + unique fog density |
| Procedural dungeons are trivial | Medium | Hard-rules: 8+ rooms, 2+ loops, 1+ puzzle room |
| Day/night distorts gameplay | Medium | Enemy difficulty scales with time of day; tested in each biome |
| Photo mode leaks through UI | Low | Hide all UI panels, freeze game state |
| Replay buffer eats memory | Low | Cap at 10s, 60Hz, 1KB/frame max |

## Test plan

- Each phase ships with 3-5 new unit tests
- All phases together should keep 99+/99+ tests passing
- Headless browser verification for visual changes

## Commit cadence

1 phase = 1 commit. Branch protection off (single main).

## Token budget tracking

| Phase | Budget | Cumulative |
|-------|--------|-----------|
| 20 | 6M | 6M |
| 21 | 4M | 10M |
| 22 | 3M | 13M |
| 23 | 10M | 23M |
| 24 | 6M | 29M |
| 25 | 5M | 34M |
| 26 | 3M | 37M |
| 27 | 2M | 39M |
| **Total** | **39M** | **39M** |

Reserve 5M for retries, tests, and final review. Total ceiling: **44M** of 100M.

## Approval

User picked B. Executing.
