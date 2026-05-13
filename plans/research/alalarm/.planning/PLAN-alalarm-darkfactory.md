# PLAN: Alalarm — Dark Factory Scaffold

**Date:** 2026-04-24
**Target directory:** `~/projects/darkfactory/alalarm/`
**Pattern:** Dark Factory (file-based issues, Archon workflows, no GitHub)
**Stack:** Quasar (Vue 3, TypeScript) + Capacitor (iOS/Android) + PWA, Bun, Vitest

---

## What This Plan Delivers

A fully wired Dark Factory project scaffold for Alalarm. After this plan is
executed, `archon workflow run orchestrator` in the project root will:

1. Scan `issues/untriaged/` for new work
2. Triage issues → `accepted/` or `rejected/`
3. Implement accepted issues → write code to `app/`
4. Validate → run Jest, type-check, lint
5. Auto-fix up to 2 times on failure → move to `needs-human/` on repeat failure

No GitHub, no backend, no CI runner needed to start.

---

## Tasks

### Phase 1 — Project Directory

- [ ] Create `~/projects/darkfactory/alalarm/` root
- [ ] Create issue folder tree: `issues/{untriaged,accepted,rejected,in-progress,review,done,needs-human}/`
- [ ] Create `app/` placeholder (empty `src/` + `.gitkeep`)

### Phase 2 — Governance Files

- [ ] Write `MISSION.md` — scope, forbidden list, immutable constraints
- [ ] Write `CLAUDE.md` — Expo stack, file layout, conventions, protected paths, env vars
- [ ] Write `FACTORY_RULES.md` — triage rules, quality gates, auto-reject triggers

### Phase 3 — Archon Config

- [ ] Write `.archon/config.yaml`

### Phase 4 — Archon Workflows (5 files)

- [ ] Write `.archon/workflows/orchestrator.yaml` — cron dispatcher (pure bash, no AI)
- [ ] Write `.archon/workflows/triage.yaml` — classify untriaged issues (Haiku)
- [ ] Write `.archon/workflows/implement.yaml` — write code to `app/` (Sonnet)
- [ ] Write `.archon/workflows/validate.yaml` — run Jest + tsc + lint (Sonnet)
- [ ] Write `.archon/workflows/fix.yaml` — patch failing code, max 2 attempts (Sonnet)

### Phase 5 — Archon Command Prompts (4 files)

- [ ] Write `.archon/commands/triage-classify.md`
- [ ] Write `.archon/commands/implement-code.md`
- [ ] Write `.archon/commands/validate-pr.md`
- [ ] Write `.archon/commands/fix-failing.md`

### Phase 6 — Smoke Test

- [ ] Drop a sample issue into `issues/untriaged/001-custom-interval-alarm.md`
- [ ] Run `archon workflow run triage` from project root
- [ ] Confirm issue moves to `issues/accepted/` with triage note appended

---

## Directory Structure (Final State)

```
~/projects/darkfactory/alalarm/
├── MISSION.md
├── CLAUDE.md
├── FACTORY_RULES.md
├── .archon/
│   ├── config.yaml
│   ├── workflows/
│   │   ├── orchestrator.yaml
│   │   ├── triage.yaml
│   │   ├── implement.yaml
│   │   ├── validate.yaml
│   │   └── fix.yaml
│   └── commands/
│       ├── triage-classify.md
│       ├── implement-code.md
│       ├── validate-pr.md
│       └── fix-failing.md
├── issues/
│   ├── untriaged/
│   ├── accepted/
│   ├── in-progress/
│   ├── review/
│   ├── done/
│   ├── rejected/
│   └── needs-human/
└── app/
    └── src/
        └── .gitkeep
```

---

## Governance Decisions (No Placeholders)

### MISSION.md
- **In scope:** custom-interval alarms, categories (medication/water/exercise/focus/custom),
  smart scheduling windows (8am–10pm default), snooze with configurable delay,
  alarm history + streak tracker, named alarms with notes
- **Out of scope:** backend API, user accounts, cloud sync, B2B white-label, payments/Pro tier
- **Immutable constraints:** all alarms fire as local Capacitor notifications only;
  no health data sent off-device; max 25 alarms per user at MVP;
  notification permission must be requested before first alarm is set;
  AI scheduling is out of scope for MVP — add via factory issue post-launch

### CLAUDE.md Stack
| Layer | Choice |
|-------|--------|
| Framework | Quasar 2 (Vue 3, TypeScript) |
| Deploy targets | Capacitor (iOS + Android), PWA (browser fallback) |
| Package manager | Bun |
| State | Pinia |
| Storage | `@capacitor-community/sqlite` + `jeep-sqlite` (PWA fallback) |
| Notifications | `@capacitor/local-notifications` |
| AI scheduling | Skipped — post-MVP issue |
| Testing | Vitest + `@vue/test-utils` v2 |
| Lint/Format | ESLint (Quasar preset) + Prettier |
| Type check | `tsc --noEmit` |
| Env vars | None at MVP |

### FACTORY_RULES.md
- Triage batch: 5 issues per run (oldest first)
- Bias: reject if ambiguous — require repro or clear acceptance criteria
- Escalate to `needs-human` if: notification permission logic, storage schema changes,
  any change to `MISSION.md`/`CLAUDE.md`/`FACTORY_RULES.md`
- Max fix attempts: 2 per issue (tracked in issue frontmatter `fix_attempts` field)
- Quality gates: `bun run type-check` + `bun run lint` + `bun run test` must all pass
- Auto-reject: any issue that adds a network call, backend dependency, or user account system

---

## How to Run the Factory

```bash
cd ~/projects/darkfactory/alalarm

# Add an issue
cp template.md issues/untriaged/001-my-feature.md
# edit it

# Run full factory cycle
archon workflow run orchestrator

# Or run individual stages
archon workflow run triage
archon workflow run implement
archon workflow run validate
```

---

## Issue File Template (Frontmatter)

```markdown
---
id: "001"
title: "Custom interval alarm creation"
status: "untriaged"
created: "2026-04-24"
fix_attempts: 0
last_attempt: ""
---

## Problem
[What is broken or missing]

## Acceptance Criteria
- [ ] Criterion one
- [ ] Criterion two

## Notes
[Optional context, screenshots, edge cases]
```
