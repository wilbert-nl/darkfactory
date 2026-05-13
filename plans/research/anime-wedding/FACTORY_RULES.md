# FACTORY_RULES.md — anime-wedding

## Governance Hierarchy

```
MISSION.md  (scope & constraints — human only, never modified by agents)
CLAUDE.md   (tech spec & conventions — human only, never modified by agents)
FACTORY_RULES.md  (process rules — human only, never modified by agents)
  └── GitHub Issues  (agent work queue)
        └── PRs  (agent output, reviewed by validators)
```

## Triage Rules

- **Batch size:** Process up to 5 new issues per orchestrator run.
- **Accept maximum:** 3 issues per run (others remain `factory:untriaged` for next cycle).
- **Default bias:** Reject if ambiguous. Close with a clarification request comment.

### Accept Criteria
- Issue clearly maps to a feature in MISSION.md "In Scope"
- Implementation can be completed without modifying a protected path
- Issue does not require changing pricing, upload limits, or watermark behavior
- Issue includes enough detail to write an acceptance test

### Reject Criteria
- Requests changes to `api/src/watermark/`, `api/src/queue/`, or `api/src/ai-provider/`
- Requests price changes, limit increases, or removing the watermark for any tier
- Requests in-house AI model training or video codec changes
- Out of scope per MISSION.md
- Duplicate of an existing accepted issue

### Escalate Criteria
- Requires changing external AI provider or switching queue backend
- Involves Stripe pricing ID changes
- Ambiguous scope that touches protected paths
- Security vulnerability reports

## Implementation Rules

Agents implementing accepted issues must never:

1. Modify, delete, or move any file under `api/src/watermark/`
2. Modify, delete, or move any file under `api/src/queue/`
3. Modify, delete, or move any file under `api/src/ai-provider/`
4. Change `STRIPE_PRO_PRICE_ID` value or any Stripe pricing constant
5. Change `MAX_UPLOAD_MB`, `MAX_CLIP_SECONDS`, or `VIDEO_RETENTION_HOURS` env defaults
6. Use `any` TypeScript type — use `unknown` with explicit narrowing
7. Write raw SQL string concatenation — use parameterized queries only
8. Call Replicate or RunPod APIs from any module outside `api/src/ai-provider/`
9. Dispatch queue jobs from any module outside `api/src/queue/`
10. Add `console.log` statements — use NestJS `Logger` service only

## Quality Gates

Every PR must pass all of the following before merge:

- [ ] `pnpm --filter api lint` exits 0
- [ ] `pnpm --filter app lint` exits 0
- [ ] `pnpm --filter api typecheck` exits 0
- [ ] `pnpm --filter app typecheck` exits 0
- [ ] `pnpm --filter api test` — all existing tests pass, no regressions
- [ ] `pnpm --filter app test` — all existing tests pass, no regressions
- [ ] New code has at least one new test (unit or integration)
- [ ] No new `any` types introduced
- [ ] No hardcoded secrets or API keys in source
- [ ] `VIDEO_RETENTION_HOURS` cron is not disabled or modified
- [ ] Watermark logic not modified (diff check on `api/src/watermark/`)
- [ ] PR description includes: problem, solution, test plan

## Auto-Reject Triggers

A PR is automatically rejected (closed without merge) if it:

- Touches any file under `api/src/watermark/`, `api/src/queue/`, or `api/src/ai-provider/`
- Changes `STRIPE_PRO_PRICE_ID` or any pricing constant
- Relaxes upload size or clip duration limits
- Introduces a path that serves processed video without watermark to free-tier users
- Disables, weakens, or skips content moderation checks
- Contains hardcoded credentials or API keys
- Fails lint or typecheck
- Has no associated test

## Escalation

Label `factory:needs-human` and pause work when:

- 2 consecutive fix attempts on a PR fail quality gates
- An issue requires human judgment on scope boundary
- A security vulnerability is found in any protected path
- External AI provider API changes break the processing pipeline
- Stripe webhook validation fails in production

## Throughput Controls

- Max concurrent processing jobs in queue: 5 (configurable via `QUEUE_CONCURRENCY` env, default 5)
- Max `maxBudgetUsd` per AI node invocation: $2.00 (set on all Replicate/RunPod calls)
- Max 2 fix attempts per PR before escalation to `factory:needs-human`
- Orchestrator runs on cron every 6 hours

## Separation of Concerns

- **Triage agent:** reads issue text + MISSION.md + FACTORY_RULES.md only. Never reads implementation code.
- **Implement agent:** reads issue + CLAUDE.md + source files. Never reads triage rationale.
- **Validate agent:** reads PR diff + test output only. Never reads the implementation plan or issue body.
- **Fix agent:** reads validator feedback + failing test output only.

## Protected Files

The following files must never be modified by any agent:

```
MISSION.md
CLAUDE.md
FACTORY_RULES.md
api/src/watermark/**
api/src/queue/**
api/src/ai-provider/**
.env
.env.production
```
