# Skills Index

This branch contains a curated subset of the Mavis skill system that
was used to design and build the Lumina-Game. The full skill
constellation (38+ skills) is registered in the Mavis daemon — this
folder ships the local sources that powered the planning + design
sprints (Lane B, Lane C, Lane D).

## Local Skills (4 in this branch)

| Skill | Purpose |
|-------|---------|
| `cryo-omega-plan-mode` | Plan-before-execution for ambiguous multi-step work |
| `cryo-omega-brainstorming` | Intent + requirements + design exploration |
| `lark-tools` | Lark/Feishu full-capability access |
| `ui-ux-pro-max` | 50+ design styles, 97 palettes, 57 font pairings, 99 UX guidelines |

## Full Skill Constellation (registered in Mavis daemon)

> These skills are loaded by the runtime; their SKILL.md source
> files live in the Mavis infrastructure, not here.

**Build & Code**
- `app-builder` — full-stack app scaffolding
- `claude-code-command-creator` — slash commands
- `code-review` — quality review
- `mini-coder-max` — autonomous coding
- `skill-creator` — make new Mavis skills
- `worktree-management` — git worktree workflow

**Design**
- `design-system-builder` — NEXUS PRIVÉ orchestrator
- `full-branding-generator` — brand identity packages
- `html-interface-generator` — self-contained HTML
- `landing-page-builder` — Awwwards-tier landing
- `ui-ux-designer` — design system, wireframes, prototypes
- `ui-ux-pro-max` — design intelligence (LOCAL COPY)
- `visual-page` — visual HTML pages

**Documents**
- `docx` — Word docs (eBooks, papers, contracts)
- `pdf` — PDF generation + reading
- `pptx` — PowerPoint decks
- `xlsx` — spreadsheets
- `research-paper-generator` — doctorate-level papers

**Research & Reasoning**
- `brainstorming` — intent exploration
- `deep-research` — 5-step research pipeline
- `plan-mode` — plan-before-execution
- `prompt-engineer` — 6-layer prompt template v4.0
- `saas-idea-generator` — startup ideas
- `saas-niche-finder` — market gaps

**Agentic & Cryo**
- `agentic-platform` — build agentic systems on NEXUS PRIVÉ
- `agent-eval-harness` — 5-dim eval suite
- `agent-profile-builder` — 11-section profile schema
- `agent-roster-manager` — agent inventory CLI
- `forge-cryo-agent` — 4-file agent contract
- `cryo-agent-forge` — generation engine
- `omegaforge` — multi-agent dispatch
- `nexus-masterwork` — 7-skill convergence

**Cryo Omega Wrappers** (37 skills under `cryo-omega-*` prefix)
- Each Mavis skill above + cryo-omega branding = cryo-omega-*
- Full list: cryo-omega-{agent-eval,agent-forge,agent-profile,
  agent-roster,app,brainstorm,branding,bundle-publish,claude-cmds,
  code-review,deep-research,design-system,docx,forge-agent,
  html-interface,job-hunter,landing-page,lark,masterwork,
  mini-coder,minimax-builder,omegaforge,omega-masterwork,plan-mode,
  platform,pdf,pptx,prompt-engineer,research-paper,saas-idea,
  saas-niche,skill-creator,skills,team,ui-ux-designer,ui-ux-pro-max,
  visual-page,web-scraper,worktree,xlsx}

**Other**
- `bundle-publisher` — tar.gz + SHA-256 + Drive
- `job-hunter` — full job search lifecycle
- `lark-tools` — Feishu/Lark (LOCAL COPY)
- `team` — parallel producer/verifier
- `web-scraper` — crawl + extract

## How local skills are loaded

Mavis auto-syncs any folder under `.skills/<name>/` with a
`SKILL.md` file. The skill syncer uploads them at session end so
they become available in future sessions.

## Cryo Omega Plan + Brainstorm (used for Lane B/C/D)

These two skills (LOCAL COPIES in `.skills/`) were the entry
points for the Lumina-Game sprint design:

1. `cryo-omega-plan-mode` — captured the sprint goals, picked
   the lane (A/B/C/D), wrote the plan doc.
2. `cryo-omega-brainstorming` — explored each lane's intent,
   proposed approaches, settled on the design.

See `plans/2026-08-04--lumina-lane-b.md`,
`plans/2026-08-05--lumina-lane-c.md`, and
`docs/superpowers/specs/2026-08-04--lumina-mega-expansion.md` for
the artifacts they produced.
