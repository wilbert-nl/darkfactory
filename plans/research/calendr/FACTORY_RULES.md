# FACTORY_RULES.md — calendr

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
- **Accept maximum:** 3 issues per run.
- **Default bias:** Reject if ambiguous. Close with a clarification request comment.

### Accept Criteria
- Issue clearly maps to a feature in MISSION.md "In Scope"
- Implementation does not touch protected paths (`api/src/auth/`, `api/src/calendar-sync/`, `api/src/reminders/`)
- Issue does not require changing pricing, buffer time limit, or opt-out behavior
- Issue is scoped to one area
- Issue includes enough detail to write an acceptance test

### Reject Criteria
- Requests changes to `api/src/auth/`, `api/src/calendar-sync/`, or `api/src/reminders/`
- Requests disabling or gating the reminder opt-out
- Requests price changes or buffer time limit increase
- Requests in-scope video conferencing, group bookings, or multi-provider teams
- Requests storing OAuth tokens in plaintext
- Out of scope per MISSION.md
- Duplicate of an existing accepted issue

### Escalate Criteria
- Involves changes to OAuth token encryption scheme
- Requires Stripe pricing ID change
- Involves GDPR deletion logic changes
- Security vulnerability reports involving auth or token storage
- Ambiguous scope touching protected paths

## Implementation Rules

Agents implementing accepted issues must never:

1. Modify, delete, or move any file under `api/src/auth/`
2. Modify, delete, or move any file under `api/src/calendar-sync/`
3. Modify, delete, or move any file under `api/src/reminders/`
4. Store OAuth tokens in plaintext — always encrypt before write, decrypt after read
5. Change `STRIPE_PRO_PRICE_ID` or any pricing constant
6. Change `MAX_BUFFER_SECONDS` or the 4-hour buffer time limit
7. Add any condition or gate that could prevent a reminder opt-out from working
8. Call the Twilio API from any module outside `api/src/reminders/`
9. Call the Anthropic API from the frontend or any non-backend module
10. Use `any` TypeScript type

## Quality Gates

Every PR must pass all of the following before merge:

- [ ] `pnpm --filter api lint` exits 0
- [ ] `pnpm --filter app lint` exits 0
- [ ] `pnpm --filter api typecheck` exits 0
- [ ] `pnpm --filter app typecheck` exits 0
- [ ] `pnpm --filter api test` — all existing tests pass
- [ ] `pnpm --filter app test` — all existing tests pass
- [ ] New code has at least one new test
- [ ] No new `any` types introduced
- [ ] No hardcoded secrets or API keys in source
- [ ] Opt-out logic not modified (diff check on `api/src/reminders/opt-out.service.ts`)
- [ ] Token encryption not modified (diff check on `api/src/auth/token-encryption.service.ts`)
- [ ] PR description includes: problem, solution, test plan

## Auto-Reject Triggers

A PR is automatically rejected if it:

- Touches any file under `api/src/auth/`, `api/src/calendar-sync/`, or `api/src/reminders/`
- Stores or logs OAuth tokens in plaintext
- Adds a condition that can suppress or bypass reminder opt-out
- Changes `STRIPE_PRO_PRICE_ID` or any pricing constant
- Changes `MAX_BUFFER_SECONDS` or relaxes the 4-hour buffer limit
- Calls Twilio from outside `api/src/reminders/`
- Calls Anthropic API from frontend code
- Contains hardcoded credentials
- Fails lint or typecheck
- Has no associated test

## Escalation

Label `factory:needs-human` and pause work when:

- 2 consecutive fix attempts on a PR fail quality gates
- OAuth token encryption scheme needs updating
- Google or Microsoft OAuth scopes need to change
- GDPR deletion procedure needs modification
- Stripe pricing change is requested
- Security vulnerability found in auth or calendar-sync paths

## Throughput Controls

- Max `maxBudgetUsd` per Claude Haiku follow-up generation: $0.10
- Max `maxBudgetUsd` per AI triage/implement/validate node: $1.00
- Max 2 fix attempts per PR before escalation
- Orchestrator runs on cron every 6 hours
- Google Calendar webhook renewal cron must not be disabled

## Separation of Concerns

- **Triage agent:** reads issue text + MISSION.md + FACTORY_RULES.md only.
- **Implement agent:** reads issue + CLAUDE.md + source files. Never reads triage rationale.
- **Validate agent:** reads PR diff + test output only. Never reads the implementation plan.
- **Fix agent:** reads validator feedback + failing test output only.

## Protected Files

```
MISSION.md
CLAUDE.md
FACTORY_RULES.md
api/src/auth/**
api/src/calendar-sync/**
api/src/reminders/**
.env
.env.production
```
