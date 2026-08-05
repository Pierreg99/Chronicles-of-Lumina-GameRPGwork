---
name: cryo-omega-brainstorming
description: Cryo Omega wrapper for brainstorming. Trigger on "cryo brainstorm", "/cryo-omega-brainstorm", "cryo idea explore", "cryo clarify intent". Brainstorming via Cryo Omega v3.0 multi-agent dialogue — explore intent, propose approaches, present design.
---

# Cryo Omega Brainstorming

Multi-agent brainstorming for **Cryo Omega v3.0**. Mandatory before any creative work.

## Process

```
User intent
   ↓
A16 Research (S4) — gather context, related work
   ↓
A17 Strategy (S4) — propose 2–3 approaches
   ↓
A05 Design (S2) — visualize approaches
   ↓
User picks approach
   ↓
A22 QA (S6) — validate spec
   ↓
A23 SafeMode (S6) — risk check
   ↓
Spec doc → /workspace/docs/superpowers/specs/
```

## Invocation

```
/cryo-omega-brainstorm "<idea>"
/cryo-omega-brainstorm --skip-research "<idea>"
```

## Anti-pattern: "This is too simple to need a brainstorm"

Every project goes through this. A todo list, a single-function utility, a config change — all of them. Simple projects are where unexamined assumptions cause the most wasted work. The brainstorm can be short, but you MUST present it and get approval.

## Checklist

1. Explore project context
2. Visual companion offer (if visual topic)
3. Ask clarifying questions — one at a time
4. Propose 2–3 approaches with trade-offs
5. Present design sections
6. Get user approval
7. Write design doc
8. Spec review loop (max 3 iterations)
9. User reviews written spec
10. Hand off to implementation

## When to use

- ANY new feature
- ANY new component
- ANY new agent
- ANY new skill
- ANY non-trivial change

## Output

- Spec: `/workspace/docs/superpowers/specs/YYYY-MM-DD--<topic>.md`
- Approved by user before implementation
