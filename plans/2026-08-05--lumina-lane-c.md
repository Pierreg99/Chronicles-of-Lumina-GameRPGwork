# Plan: Lane C — Vertical Depth + Remaining Polish

**Date:** 2026-08-05
**Status:** Auto-approved (user said "use 100mio Tokens and work")
**Owner:** Mavis
**Token budget:** ~80-100M

## Goal

Take the game from "atmospheric JRPG with 10 biomes" to "complete vertical-slice JRPG with progression loops." Lane B gave us atmosphere; Lane C gives us depth.

## Current state (post-Lane B)
- 92 JS files, 9,457 LOC
- 158/158 tests
- 27/27 phases
- 10 biomes, ambient music, voice barks, day/night, weather
- 10 secret bosses, procedural dungeons, photo mode, replay
- **Gaps:** no magic system, no equipment, no crafting, no skill tree, no achievements, no class system, all trees are green (no per-biome variety), all enemies are 3 slimes (no per-biome pool), no endgame loop

## Phases (7)

### Phase 28: Equipment + Stats — 14M tokens
**Files:** `src/systems/equipment.js` (new), `src/systems/stats.js` (new), `src/ui/equipment-panel.js` (new), `src/core/config.js`, `src/world/zones/loot-tables.js` (new)
- 6 armor slots: helm, chest, legs, boots, gloves, ring
- 4 weapon types: sword, axe, staff, bow (each with 3 damage tiers)
- 5 rarity tiers: common, uncommon, rare, epic, legendary (color-coded)
- Stat system: STR (damage), DEX (attack speed), INT (mana), VIT (HP), WIS (mana regen)
- Items drop with random stat rolls within their rarity range
- Equipment panel UI (toggled with `U` key)
- **Tests:** stat math, rarity distribution, equip/unequip flow
- **Verify:** Open equipment, see equipped items, swap to see stats change

### Phase 29: Magic System — 14M tokens
**Files:** `src/systems/magic.js` (new), `src/systems/spell-book.js` (new), `src/ui/spell-bar.js` (new), `src/world/zones/spell-tomes.js` (new)
- 3 spell schools: Feuer (DPS), Eis (CC), Blitz (utility)
- 4 spells per school (12 total): fireball, ignite, firewall, meteor / frostbolt, ice-shield, blizzard, frozen-tomb / spark, heal, lightning-bolt, time-warp
- Mana pool (regen over time) + spell costs
- Spell bar UI (1-4 keys for quick cast)
- Spell tomes hidden in biomes (one per school per biome)
- Particle effects per spell (already have particle system)
- **Tests:** mana regen, spell cost, school identification
- **Verify:** Cast each spell, see particles + damage/heal effect

### Phase 30: Crafting + Gathering — 12M tokens
**Files:** `src/systems/crafting.js` (new), `src/systems/gathering.js` (new), `src/world/crafting-stations.js` (new), `src/ui/crafting-panel.js` (new)
- 4 crafting stations: forge (weapons/armor), alchemy (potions), enchanter (rune upgrades), cook (food buffs)
- 30+ recipes: 10 forge, 8 alchemy, 7 enchanter, 5 cook
- Gathering nodes: ore veins, herb patches, fish spots — appear in biomes
- Recipe book UI (toggled with `K` key) — shows known/unknown recipes
- Crafting consumes materials from inventory
- **Tests:** recipe validation, material consumption, station proximity
- **Verify:** Walk to a node, gather, return to station, craft

### Phase 31: Player Skill Tree — 12M tokens
**Files:** `src/systems/skill-tree.js` (new), `src/ui/skill-tree.js` (new), `src/core/state.js`
- 3 class branches: Krieger (warrior, STR+HP), Magier (mage, INT+mana), Schurke (rogue, DEX+crit)
- 8 nodes per branch (24 total)
- Skill points from level-ups (1 per level, 2 every 5 levels)
- Each node: passive bonus + (some) unlock active ability
- Skill tree UI (toggled with `J` key) — visual graph
- **Tests:** point allocation, branch unlock flow
- **Verify:** Level up, open skill tree, allocate points, see stat changes

### Phase 32: Achievement System — 10M tokens
**Files:** `src/systems/achievement.js` (new), `src/ui/achievements-panel.js` (new)
- 50+ achievements: combat, exploration, crafting, social, secret
- Categories with progress tracking
- Persistence in localStorage
- Notification toast on unlock
- Achievements panel (toggled with `Y` key) with filters
- **Tests:** unlock trigger, persistence, category filter
- **Verify:** Trigger 3 achievements, see toasts, check panel

### Phase 33: Per-Biome Variety — 12M tokens
**Files:** `src/world/zones/trees.js` (new), `src/systems/spawn-system.js`, `src/entities/enemy-base.js` (extensions)
- Per-biome tree types: oaks in verdant, palm+cactus in dunes, pine in peaks, willow in mire, dead-tree in ember, crystal-cluster in crystal, cloud-bush in sky, coral in reef, dead-tree in haunted, void-shard in void
- Each tree has unique geometry/color/material
- Per-biome enemy spawns (currently all biomes use 3 slimes — replace with biome-specific pools)
- 5-7 new enemy types: scorpion, frost-wisp, bog-lurker, fire-golem, crystal-warden, etc.
- **Tests:** tree variant registry, enemy pool validation
- **Verify:** Walk to each biome, see distinct trees + enemies

### Phase 34: Endgame + Leaderboard — 8M tokens
**Files:** `src/systems/leaderboard.js` (new), `src/ui/leaderboard.js` (new), `src/world/endless-mode.js` (new)
- Endless mode (unlocked after main quest): waves of enemies, score = kills × time × combo
- Daily/weekly leaderboard via localStorage
- Hardcore mode: 1 life, no respawn
- 5 challenge modes: no-heal, no-dodge, glass-cannon, pacifist, speedrun
- **Tests:** leaderboard sort, mode unlocks
- **Verify:** Finish main quest, start endless, beat 5 waves

## Risk matrix

| Risk | Severity | Mitigation |
|------|----------|------------|
| Equipment/stat math bugs | High | Heavy unit tests on stat calcs, edge cases (negative stats, overflow) |
| Magic particles tank performance | Medium | Reuse existing particle pool, cap active particles |
| Crafting UI feels like spreadsheets | Medium | Visual recipe book with item icons (reuse icons.js) |
| Skill tree is too complex to balance | High | Cap stats at sane values, test against original enemy stats |
| Achievement system fires wrong events | Medium | Whitelist of valid trigger events, test each |
| Per-biome trees break the world | Low | Default fallback to current oak, only swap when zone matches |

## Test plan

- Each phase: 5-8 new tests
- Target: 158 → 230+ assertions
- All phases: 0 regressions

## Commit cadence

1 phase = 1 commit. Each lands on main.

## Token budget tracking

| Phase | Budget | Cumulative |
|-------|--------|-----------|
| 28 | 14M | 14M |
| 29 | 14M | 28M |
| 30 | 12M | 40M |
| 31 | 12M | 52M |
| 32 | 10M | 62M |
| 33 | 12M | 74M |
| 34 | 8M | 82M |

Reserve 18M for retries + tests + final docs. **Total ceiling: 100M.**

## Approval

User said "use 100mio Tokens and work." Executing.
