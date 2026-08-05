# Evoland-Style "Era Progression" Game — Production Plan

> **Scope:** Full commercial Android release. Roadmap below, not a single-session build.
> **Pattern:** AURALIS-style era-evolution (8-bit -> 16-bit -> 3D -> modern), gated by
> player progression (crystals, kills, story triggers).

## 1. Concept (CryoAuralis A31 + CryoGameDesign A27)

**Pitch:** Chronicles of Lumina evolves. As Aren collects crystals, the world shifts
through graphical eras - monochrome 8-bit (NES-style) -> 16-bit (SNES-style) -> 3D polygons
(N64-style) -> modern PBR (current). Each era has unique mechanics (era 1: 2-dir movement
only; era 2: 4-dir + magic; era 3: free 3D; era 4: combos + abilities).

**Genre:** Action-RPG with meta-progression. Single player, ~6-10 hours, episodic.

**Inspiration:** Evoland 1+2, Undertale (era-gating), Braid (narrative through mechanic).

## 2. Multi-Agent Dispatch (omegaforge)

```
CryoOrchestrator (A21) -+
                         |- CryoGameDesign (A27): core loop, era gating
                         |- CryoAuralis (A31): era visual identity (4 distinct looks)
                         |- CryoGameAssets (A28): 8-bit + 16-bit sprite sheets
                         |- CryoMapDesign (A29): era-specific level pacing
                         |- CryoWriter (A01): dialogue + era-titles
                         |- CryoCode (A09): engine adaptations (sprite vs 3D)
                         |- CryoMotion (A08): era-transition effects
                         |- CryoAudio (extension): era-specific chiptune -> orchestral
                         |- CryoCampaign (A18): Play Store ASO + trailer
                         |- CryoBrand (A19): "EVOLUMINA" brand voice
                         |- CryoLegal (A16): DSGVO / Coppa / Play Store content rating
                         |- CryoDevOps (A12): Capacitor wrapper, signing, Play Console
                         |- CryoAPIIntegrator (A30): leaderboard, cloud-saves
                         |- CryoQA (A22): final filter, no placeholders
                         |- CryoSafeMode (A23): PII / content / age-gate
                         +- CryoAuditor (A24): token / cost / IP report
```

## 3. Production Phases (8-12 months solo / 4-6 with team)

| Phase | Weeks | Output | Cryo Owner |
|---|---|---|---|
| **P1: Vertical Slice** | 3 | Era 1+2 playable, 1 level, character controller | A27 + A09 |
| **P2: Era 3** | 4 | 3D era, free camera, basic enemies | A09 + A31 |
| **P3: Era 4 + Polish** | 4 | Modern PBR, particle effects, combos | A08 + A31 |
| **P4: Story + Dialogue** | 3 | 6-10 hours content, 4 NPCs, 2 bosses | A01 + A27 |
| **P5: Audio** | 2 | 4 soundtrack variants, era-themed SFX | A08 (extension) |
| **P6: Mobile Build** | 3 | Capacitor, touch controls, haptics, perf | A12 + A09 |
| **P7: ASO + Trailer** | 2 | Play Store listing, screenshots, video | A18 + A19 |
| **P8: Beta + Polish** | 4 | 1000 closed beta users, bugfixes | A22 + A23 |
| **P9: Launch** | 1 | Play Console publish, marketing | A18 + A24 |

**Total: 26 weeks solo (6 months) or 12-16 weeks with 2-3 person team.**

## 4. Tech Stack (extension of chronicles-of-lumina)

- **Engine:** existing vanilla JS + Three.js (kept; works on Android WebView)
- **Wrapper:** Capacitor 6.x - Android + iOS from same code
- **Persistence:** localStorage + IndexedDB (Dexie) for save data, cloud sync via Firebase
- **Audio:** Howler.js for cross-platform chiptune + orchestra mixing
- **Monetization:** Free demo (Era 1-2) + paid full unlock (\$4.99) or IAP packs
- **Analytics:** Plausible (privacy-friendly) + custom event log

## 5. Risks

| Risk | Mitigation |
|---|---|
| Performance on low-end Android | Era 4 must run 30+ FPS on 4GB RAM devices (perf budget in PERF.md) |
| Touch controls for 3D era | Virtual joystick + tap-to-attack (already in mobile-controls.js) |
| Asset size (4 eras x content) | Procedural generation (already in asset-gen.js) + lazy-load era assets |
| Play Store review (rating, content) | CryoLegal review at P5 + P7 |
| Save-data corruption (mid-era transition) | Auto-save before era change, versioned save schema |

## 6. Cost Estimate (rough)

| Item | Cost | Notes |
|---|---|---|
| Cryo Omega (this session) | included | Mavis Pro |
| Capacitor + plugins | \$0 | OSS |
| Play Store dev account | \$25 | One-time |
| Apple dev account (if iOS) | \$99/year | Optional |
| Music (4 soundtrack era themes) | \$0-2000 | Freesound.org or commissioned |
| Trailer / ASO assets | \$0-500 | Can do in-engine capture |
| Cloud saves (Firebase) | \$0-25/month | Free tier covers launch |
| **Total minimum** | **\$25** | Play Store fee only |

## 7. Today: Working Demo

This session delivers a **3-era prototype** in chronicles-of-lumina that demonstrates the
core mechanic. It's not a commercial game - it's a working proof-of-concept that can be
played in the browser to see the era-shift live.

- Era 1: 8-bit style (flat colors, low-res texture, 2-direction movement locked)
- Era 2: 16-bit style (more colors, mid-res, pixelated sprites)
- Era 3: 3D style (current Three.js rendering - full PBR)

Press **[E]** near the **Portal** in-game to advance to the next era.
HUD shows current era with title and style.
