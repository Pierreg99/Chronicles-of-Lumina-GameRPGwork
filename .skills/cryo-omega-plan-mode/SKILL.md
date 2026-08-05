---
name: cryo-omega-plan-mode
description: Cryo Omega wrapper for plan-mode. Trigger on "cryo plan", "/cryo-omega-plan", "plan first cryo", "cryo discuss first". Plan before execution — for tasks with meaningful ambiguity, multiple valid approaches, or when the user wants to discuss first.
---

# Cryo Omega Plan Mode

For any task with meaningful ambiguity, multiple valid approaches, or explicit user request to discuss first.

## Invocation

```
/cryo-omega-plan "<task>"
```

## What it does

1. **Analyze** — break down the task
2. **Identify ambiguity** — surface unclear parts
3. **Propose 2–3 approaches** — with trade-offs and recommendation
4. **Pick** — user selects
5. **Detail the chosen approach** — step by step
6. **Risk list** — top 5 risks + mitigations
7. **Token budget estimate**
8. **Timeline estimate**
9. **Approval gate** — user must approve before execution

## When to use

- "Should I use X or Y?" → plan
- "How should we approach this?" → plan
- "Let me think first" → plan
- Complex multi-step tasks → plan
- Anything touching > 5 files → plan
- Anything with multiple valid stacks → plan

## Output

- Plan: `/workspace/plans/<task-slug>-<date>.md`
- Token budget: per-step
- Risk matrix
- Approval gate

## Anti-pattern: jumping to execution

The first 5 minutes of planning save 50 minutes of rework. Always plan when:
- Multiple approaches exist
- Stack choice matters
- Architecture decision needed
- 3+ files affected
- Cost > 100K tokens
