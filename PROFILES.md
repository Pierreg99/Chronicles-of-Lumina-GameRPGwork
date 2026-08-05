# Cryo Omega Agentic Profiles — Index

> 43 profiles, 11-section v1.0 schema. Each profile is a
> human-readable + machine-executable spec for one Cryo Omega
> v3.0 agent.

## Profile Schema (v1.0)

Every profile has these 11 sections:

1. **Identity** — name, role, spektrum, version, model
2. **Capabilities** — what the agent can do
3. **Use Cases** — when to dispatch
4. **Input Schema** — typed parameters
5. **Output Schema** — typed results
6. **Few-Shot Examples** — 2-3 worked examples
7. **System Prompt** — 6-layer template v4.0
8. **Safety Constraints** — PII, scope, refusal policy
9. **Operational Notes** — runtime, cost, latency
10. **Success Metrics** — what "good" looks like
11. **Cross-References** — related agents

## Profile Index (43)

| ID | Agent | Spektrum |
|----|-------|----------|
| A00 | CryoNexus | S8 Integration |
| A01 | CryoWriter | S1 Creative |
| A02 | CryoLyricist | S1 Creative |
| A03 | CryoNarrator | S1 Creative |
| A04 | CryoIdeator | S1 Creative |
| A05 | CryoDesigner | S1 Creative |
| A06 | CryoBrand | S2 Visual |
| A07 | CryoLayout | S2 Visual |
| A08 | CryoType | S2 Visual |
| A09 | CryoColor | S2 Visual |
| A10 | CryoMotion | S2 Visual |
| A11 | CryoIcon | S2 Visual |
| A12 | CryoPhoto | S2 Visual |
| A13 | CryoResearch | S2 Visual |
| A14 | CryoStrategy | S2 Visual |
| A15 | CryoArchitect | S3 Technical |
| A16 | CryoFrontend | S3 Technical |
| A17 | CryoBackend | S3 Technical |
| A18 | CryoData | S3 Technical |
| A19 | CryoAI | S3 Technical |
| A20 | CryoAPI | S3 Technical |
| A21 | CryoOrchestrator | S6 Orchestration |
| A22 | CryoQA | S6 Orchestration |
| A23 | CryoSafeMode | S6 Orchestration |
| A24 | CryoAuditor | S6 Orchestration |
| A25 | CryoFunnel | S4 Strategy |
| A26 | CryoGrowth | S4 Strategy |
| A27 | CryoRetention | S4 Strategy |
| A28 | CryoAds | S5 Promotion |
| A29 | CryoSocial | S5 Promotion |
| A30 | CryoEmail | S5 Promotion |
| A31 | CryoSEO | S5 Promotion |
| A32 | CryoA11y | S6 Orchestration |
| A33 | CryoPerf | S3 Technical |
| A34 | CryoI18nQA | S7 Game |
| A35 | CryoDesignOps | S7 Game |
| A36 | CryoGenesis | S6 Orchestration |
| A37 | CryoPromptLab | S6 Orchestration |
| A38 | CryoDocForge | S3 Technical |
| A39 | CryoDataViz | S3 Technical |
| A40 | CryoUXResearch | S5 Promotion |
| A41 | CryoCRO | S4 Strategy |
| A42 | CryoSecurity | S3 Technical |
| A43 | CryoAnalytics | S4 Strategy |

## Where the full profiles live

The full Markdown profiles are in the masterwork bundle:

- **Bundle**: `agentic-profiles-43-agents.tar.gz` (12.3KB)
- **Path**: `agentic-profiles/profiles/A00-A43.md`
- **Drive**: folder `1qqzjcbb-a0j423EGxp4z8ClUj8-AxQyX`

To regenerate, run:
```bash
cryo-omega-agent-profile-builder --version v3.0 --all
```

## Profile Generation Pipeline

```
spec  →  6-layer prompt template v4.0
       ↓
  system_prompt + capabilities
       ↓
  few-shot examples (auto-generated from past runs)
       ↓
  safety constraints (from CryoSafeMode)
       ↓
  profile.md (11 sections)
       ↓
  forge (4-file contract: md + yaml + json + py)
```

## Used in Lumina-Game

- **A22 CryoQA** — quality assurance on every Phase commit
- **A23 CryoSafeMode** — PII/safety check before push
- **A24 CryoAuditor** — cross-agent audit
- **A21 CryoOrchestrator** — multi-agent dispatch
- **A00 CryoNexus** — NEXUS PRIVÉ integration bridge

The Lumina-Game sprint used these via `cryo-omega-omegaforge`
(omegaforge skill). Every phase (28-40) passed QA + SafeMode +
Auditor before commit.
