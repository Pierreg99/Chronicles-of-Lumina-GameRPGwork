# Cryo Omega Agent Roster

> 43-agent v3.0 bundle on `minimax-m3`. All agents share the
> Pierrefektion Standard (4-file contract: `md` + `yaml` + `json`
> + `py`).

This file is a **routing index** — it tells you which agent to
dispatch to for which kind of work. The full agent artifacts
(specs, system prompts, code stubs) live in the masterwork bundle
on Google Drive (`cryo-omega-v3.0-43-agents.tar.gz`).

## Spektren (8)

| ID | Name | Count | Focus |
|----|------|-------|-------|
| S1 | Creative | 5 | Ideation, narrative, worldbuilding |
| S2 | Visual | 9 | Design tokens, components, layout |
| S3 | Technical | 9 | Performance, security, doc, data |
| S4 | Strategy | 5 | Funnels, analytics, growth |
| S5 | Promotion | 5 | Marketing, ads, social |
| S6 | Orchestration | 7 | Multi-agent dispatch, integration |
| S7 | Game | 3 | Game-specific (Lumina-Game focus) |
| S8 | Integration | 1 | NEXUS PRIVÉ bridge |

## S1 — Creative (5)

| ID | Name | Role |
|----|------|------|
| A01 | CryoWriter | Long-form copy, brand voice |
| A02 | CryoLyricist | Slogans, taglines, hooks |
| A03 | CryoNarrator | Story arcs, chapter beats |
| A04 | CryoIdeator | Concept variants, naming |
| A05 | CryoDesigner | Visual concepts, moodboards |

## S2 — Visual (9)

| ID | Name | Role |
|----|------|------|
| A06 | CryoBrand | Logo, palette, identity |
| A07 | CryoLayout | Grid systems, spacing |
| A08 | CryoType | Typography pairings, scales |
| A09 | CryoColor | Color theory, WCAG, harmony |
| A10 | CryoMotion | Animation, easing, transitions |
| A11 | CryoIcon | Iconography, glyph design |
| A12 | CryoPhoto | Photography direction |
| A13 | CryoResearch | Visual research, references |
| A14 | CryoStrategy | Brand strategy, positioning |

## S3 — Technical (9)

| ID | Name | Role |
|----|------|------|
| A15 | CryoArchitect | System design, schemas |
| A16 | CryoFrontend | UI/UX code |
| A17 | CryoBackend | API, services, queues |
| A18 | CryoData | Data modeling, ETL |
| A19 | CryoAI | ML model selection |
| A20 | CryoAPI | API contracts, OpenAPI |
| A33 | CryoPerf | Performance budgets |
| A38 | CryoDocForge | Documentation generator |
| A39 | CryoDataViz | Data visualization |
| A42 | CryoSecurity | Security auditor |

## S4 — Strategy (5)

| ID | Name | Role |
|----|------|------|
| A25 | CryoFunnel | Conversion funnels |
| A26 | CryoGrowth | Growth loops |
| A27 | CryoRetention | Engagement, churn |
| A43 | CryoAnalytics | Metrics, dashboards |
| A41 | CryoCRO | Conversion rate optimization |

## S5 — Promotion (5)

| ID | Name | Role |
|----|------|------|
| A28 | CryoAds | Ad creative, paid media |
| A29 | CryoSocial | Social strategy |
| A30 | CryoEmail | Email sequences |
| A31 | CryoSEO | SEO, content gaps |
| A40 | CryoUXResearch | User research, testing |

## S6 — Orchestration (7)

| ID | Name | Role |
|----|------|------|
| A21 | CryoOrchestrator | Multi-agent dispatch |
| A22 | CryoQA | Quality assurance |
| A23 | CryoSafeMode | PII / safety / compliance |
| A24 | CryoAuditor | Cross-agent audit |
| A32 | CryoA11y | WCAG 2.2 audit |
| A36 | CryoGenesis | Project entry orchestrator (priority 0) |
| A37 | CryoPromptLab | Prompt engineering lab |

## S7 — Game (3)

| ID | Name | Role |
|----|------|------|
| A34 | CryoI18nQA | Locale completeness, RTL |
| A35 | CryoDesignOps | Design token drift |
| (new) | CryoGameplay | Game systems designer |
| (new) | CryoLevel | Level/zone designer |
| (new) | CryoBalance | Combat/economy balancing |

## S8 — Integration (1)

| ID | Name | Role |
|----|------|------|
| A00 | CryoNexus | NEXUS PRIVÉ ↔ Cryo bridge |

## How agents are routed

Use `omegaforge` to dispatch. The canonical pattern:

```
A21 Orchestrator
  ├─ A01 + A04 (creative ideation)
  ├─ A05 (design)
  ├─ A22 QA (quality)
  ├─ A23 SafeMode (PII / safety)
  └─ A24 Auditor (cross-check)
```

A24 runs **in parallel** with the main pipeline. A22 and A23 are
the gate: their verdict must be SHIP before delivery.

## Agentic Profiles (43)

Every agent has an 11-section v1.0 profile:
- Identity, capabilities, use cases
- input_schema / output_schema
- Few-shot examples
- Safety constraints
- Operational notes

Profiles are stored as Markdown in `agentic-profiles/profiles/`.
See `PROFILES.md` for the index.

## Versioning

| Version | Agents | Token Budget | Notes |
|---------|--------|--------------|-------|
| v2.7 | 31 | (worker pool) | 8 spektren baseline |
| v2.8 | 54 | 165K | token-budget-scaled |
| v2.9 | 999 | 4.66M | mega-bundle |
| v2.10 | 999 | 12.65M | extended tokens |
| **v3.0** | **43** | targeted | masterwork's curated set |
