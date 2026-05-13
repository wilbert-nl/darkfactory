# Dark Factory Scout — Design Spec
**Date:** 2026-05-13  
**Status:** Approved

---

## Overview

A scheduled Claude Code agent that scrapes GitHub Trending daily, scores candidates against portfolio criteria, invents a concept twist, and writes a structured spec file. Output is Archon-compatible for a future build-twist workflow.

---

## Architecture

```
GitHub Trending (web)
        ↓
  Scout Agent (scheduled)
        ↓
  Score candidates (5-point criteria)
        ↓
  Invent twist concept
        ↓
  Write spec file → darkfactory/plans/scout/YYYY-MM-DD-<slug>.md
        ↓
  Update registry.json
        ↓
  [Future] Archon build-twist workflow reads spec → scaffolds project dir
```

---

## Schedules

Two parallel schedules:
- **Burst:** every 3 hours from 2026-05-13 until 2026-05-14 20:00
- **Recurring:** daily after that, same clock time as first burst run

Both agents write to the same `plans/scout/` directory. Registry prevents cross-run duplicates.

---

## Scoring Criteria (5 points)

| # | Criterion | Pass condition |
|---|-----------|---------------|
| 1 | Systems-level thinking | Involves concurrency, networking, performance, or infra |
| 2 | Real-world utility | Solves a problem people actually have |
| 3 | Community traction | >100 stars OR trending rank top 25 |
| 4 | Fills portfolio gap | No existing darkfactory project covers this domain |
| 5 | Buildable solo | Completable in 1–2 weeks by one developer |

**Minimum to proceed:** 4/5. Below threshold → move to next candidate.

**Auto-reject if any of these are true:**
- Core functionality requires a paid API (AI, maps, payments, SMS, etc.)
- Project is too complex for a solo dev to understand in one sitting
- Twist concept would inherit the paid dependency from the original

---

## Twist Generation Rules

Agent picks the twist that produces the most novel, buildable idea:

- Change the **target user** (e.g., food delivery → home services delivery)
- Change the **distribution model** (centralized → P2P, B2C → B2B)
- Change the **domain** (dev task manager → nurse task manager)
- **Combine** two unrelated concepts (calendar + expense tracker → event budgeting tool)

Twist must be meaningfully different — not just a rename of the original.

**Twist simplicity rules (hard constraints):**
- No paid APIs required (no OpenAI, no Stripe, no Twilio, no Google Maps paid tier)
- No AI features that require a paid model API — free/local models (Ollama, llama.cpp) are allowed
- No paywalled third-party services as a core dependency
- Prefer projects that run fully on open-source stack + free tiers
- Simpler is better — if two twists are equally novel, pick the one with fewer moving parts

---

## Output Files

### `~/projects/darkfactory/plans/scout/YYYY-MM-DD-<slug>.md`

```markdown
---
date: YYYY-MM-DD
original_url: https://github.com/owner/repo
stars: 2400
language: Go
score: 5/5
status: pending
---

## Original: <repo-name>
One-line description of what it does.

## Twist: <twist-name>
**Concept:** ...
**Target user:** ...
**Core differentiator:** ...
**Suggested stack:** picked to fit the project type (web app → NestJS + Vue 3 + PostgreSQL, CLI → Go or Rust, mobile → Flutter, etc.)

## Portfolio fit
- [x] Systems-level thinking — ...
- [x] Real-world utility — ...
- [x] Community traction — ...
- [x] Fills gap — ...
- [x] Buildable solo — ...
```

### `~/projects/darkfactory/plans/scout/registry.json`

```json
{
  "scouted": ["repo-slug-1", "repo-slug-2"],
  "built": ["project-slug-1"]
}
```

---

## Deduplication Rules

1. Skip any repo whose slug already exists in `registry.json` → `scouted`
2. Skip any project whose concept slug matches an existing dir in `~/projects/darkfactory/`
3. If no viable candidate found in a run → log and exit cleanly (no error)

---

## Future: Archon Build Phase

When Archon is configured, a `build-twist` workflow will:
1. Read all spec files with `status: pending`
2. Scaffold `~/projects/darkfactory/<slug>/` with governance files (MISSION.md, CLAUDE.md, FACTORY_RULES.md)
3. Update spec `status` to `building`
4. Hand off to the standard dark factory pipeline

---

## Constraints

- Source: GitHub Trending only (no HN, no ProductHunt, no ideas.md)
- Output: local directory only (no GitHub repo creation)
- Existing projects in `~/projects/darkfactory/` are never overwritten
- Agent never modifies governance files of existing projects
