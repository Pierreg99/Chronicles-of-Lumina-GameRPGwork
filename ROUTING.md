# Routing Layer — Skills ↔ Agents ↔ Profiles

> How Mavis skills, Cryo Omega agents, and agentic profiles
> connect. This is the dispatch + governance layer for the
> Mavis platform.

## Three Layers

```
┌─────────────────────────────────────────────┐
│  L1 — Skills (Mavis)                        │
│  User-facing procedures                     │
│  Triggers, examples, body                   │
└──────────────────┬──────────────────────────┘
                   │  omegaforge
                   ↓
┌─────────────────────────────────────────────┐
│  L2 — Agents (Cryo Omega v3.0, 43 total)    │
│  8 spektren, minimax-m3                     │
│  Spec contract: md + yaml + json + py       │
└──────────────────┬──────────────────────────┘
                   │  agent-profile-builder
                   ↓
┌─────────────────────────────────────────────┐
│  L3 — Profiles (11-section v1.0)            │
│  Human-readable + machine-executable        │
│  Identity, capabilities, schemas, examples  │
└─────────────────────────────────────────────┘
```

## Routing Rules

### 1. Skill → Agent

Each Mavis skill maps to a default Cryo Omega agent. Override
per-task if the user specifies.

| Skill | Default Agent |
|-------|---------------|
| `app-builder` | A15 (Architect) + A16 (Frontend) + A17 (Backend) |
| `full-branding-generator` | A06 (Brand) + A05 (Designer) + A14 (Strategy) |
| `landing-page-builder` | A05 (Designer) + A16 (Frontend) + A10 (Motion) |
| `ui-ux-pro-max` | A05 (Designer) + A07 (Layout) + A08 (Type) + A09 (Color) |
| `html-interface-generator` | A16 (Frontend) + A07 (Layout) |
| `design-system-builder` | A07 (Layout) + A08 (Type) + A09 (Color) + A32 (A11y) |
| `code-review` | A22 (QA) + A24 (Auditor) |
| `mini-coder-max` | A15 (Architect) + A16 (Frontend) + A17 (Backend) |
| `docx` / `pdf` / `pptx` | A38 (DocForge) |
| `xlsx` | A18 (Data) + A39 (DataViz) |
| `research-paper-generator` | A01 (Writer) + A13 (Research) |
| `deep-research` | A13 (Research) + A31 (SEO) |
| `saas-idea-generator` | A04 (Ideator) + A14 (Strategy) + A25 (Funnel) |
| `saas-niche-finder` | A14 (Strategy) + A13 (Research) |
| `brainstorming` | A04 (Ideator) + A05 (Designer) + A14 (Strategy) |
| `plan-mode` | A21 (Orchestrator) + A36 (Genesis) |
| `prompt-engineer` | A37 (PromptLab) |
| `agent-eval-harness` | A22 (QA) + A24 (Auditor) |
| `agent-profile-builder` | A36 (Genesis) + A37 (PromptLab) |
| `agent-roster-manager` | A21 (Orchestrator) |
| `forge-cryo-agent` | A36 (Genesis) + A15 (Architect) |
| `cryo-agent-forge` | A15 (Architect) + A37 (PromptLab) |
| `omegaforge` | A21 (Orchestrator) → fan-out |
| `nexus-masterwork` | A21 + A36 + A24 |
| `bundle-publisher` | A38 (DocForge) + A17 (Backend) |
| `web-scraper` | A18 (Data) |
| `lark-tools` | A17 (Backend) |
| `job-hunter` | A01 (Writer) + A14 (Strategy) |
| `team` | A21 (Orchestrator) + A22 (QA) + A24 (Auditor) |
| `skill-creator` | A37 (PromptLab) + A15 (Architect) |
| `worktree-management` | A17 (Backend) |

### 2. Agent → Profile

Every agent has a 1:1 profile. The profile is the **executable
spec** — the agent's actual prompt + capabilities + schemas.
Agents are dispatched by reading the profile, not by hard-coding
in skill code.

```
Skill body mentions "A21 CryoOrchestrator"
  ↓
  Mavis runtime looks up A21's profile
  ↓
  Profile provides: system_prompt, capabilities, schemas
  ↓
  omegaforge routes the task to A21
```

### 3. Profile → Guardrails

Every profile declares its safety constraints. Before a profile
can be used in production, **A23 CryoSafeMode** must sign off:

- PII handling: no real names, addresses, phone numbers
- Production credentials: never logged
- Copyrighted material: no verbatim reproduction
- Scope: agent stays in its declared capability set

A22 CryoQA then runs the standard eval suite:
- happy path (30%) + edge cases (25%) + safety (20%) +
  consistency (15%) + regression (10%)
- Verdict: SHIP / ITERATE / FAIL

## Lumina-Game Sprint Routing

For the Lumina-Game sprints (Lane B/C/D, 28-40), the routing
chain was:

```
User: "use 100mio tokens and work"
  ↓
  cryo-omega-plan-mode (L1: which lane?)
  ↓
  cryo-omega-brainstorming (L1: explore intent)
  ↓
  omegaforge (L1: dispatch)
  ↓
    A21 Orchestrator (L2)
      ├─ A22 QA (L2, parallel)        ← Verdict: SHIP
      ├─ A23 SafeMode (L2, parallel)  ← Verdict: clean
      ├─ A24 Auditor (L2, parallel)   ← Verdict: pass
      └─ Phase-specific specialists (L2)
  ↓
  Per-phase commits (Lumina-Game/main)
```

## Audit Trail

Every dispatch leaves a trace:

1. Skill trigger (which skill fired, why)
2. Agent picked (from routing table)
3. Profile loaded (which version)
4. Input schema validated
5. Output produced
6. QA verdict
7. SafeMode verdict
8. Audit verdict
9. Commit hash (if code changed)

The trace is logged in `audit.log` for the session and (for
Drive-backed work) uploaded to the masterwork folder.

## Versioning

| Layer | Version | Date |
|-------|---------|------|
| Skills | 38+ | rolling |
| Agents | v3.0 (43) | 2026-08-04 |
| Profiles | v1.0 (11 sections) | 2026-08-04 |
| Routing table | v2 | 2026-08-04 |

See `AGENTS.md` and `PROFILES.md` for full indexes.
See `SKILLS.md` for the skill catalog.
