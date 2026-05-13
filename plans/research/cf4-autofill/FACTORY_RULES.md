# FACTORY_RULES.md — cf4-autofill

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
- Implementation does not touch protected paths (`api/src/pdf/`, `api/src/cf4-template/`, `app/src/components/CF4Form.vue`)
- Issue does not require changing pricing, quotas, or retention limits
- Issue does not involve changing the CF4 form field layout
- Issue includes enough detail to write an acceptance test

### Reject Criteria
- Requests changes to `api/src/pdf/`, `api/src/cf4-template/`, or `app/src/components/CF4Form.vue`
- Requests removing or altering the HS code AI disclaimer
- Requests changing CF4 field layout, order, or field names
- Requests price changes, quota increases, or retention limit changes
- Requests third-party HS code API integration
- Requests direct BOC electronic filing integration
- Out of scope per MISSION.md
- Duplicate of an existing accepted issue

### Escalate Criteria
- CF4 form field layout needs to change to match a BOC form update
- Stripe pricing ID change is requested
- HS code disclaimer text needs legal review
- Security vulnerability reports
- Ambiguous scope touching protected paths

## Implementation Rules

Agents implementing accepted issues must never:

1. Modify, delete, or move any file under `api/src/pdf/`
2. Modify, delete, or move any file under `api/src/cf4-template/`
3. Modify `app/src/components/CF4Form.vue`
4. Remove, shorten, or conditionalize the HS code AI disclaimer
5. Change `STRIPE_PRO_PRICE_ID` or any pricing constant
6. Change `FREE_TIER_MAX_PROFILES`, `FREE_TIER_MAX_EXPORTS_PER_MONTH`, or `MANIFEST_RETENTION_DAYS_FREE`
7. Generate PDFs in the frontend — PDF generation is server-side only
8. Call the Anthropic API from the frontend
9. Use `any` TypeScript type
10. Write raw SQL string concatenation — parameterized queries only

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
- [ ] HS code disclaimer present and unmodified in all HS code response paths (diff check)
- [ ] `CF4Form.vue` not modified (diff check)
- [ ] `api/src/cf4-template/` not modified (diff check)
- [ ] PR description includes: problem, solution, test plan

## Auto-Reject Triggers

A PR is automatically rejected if it:

- Touches any file under `api/src/pdf/` or `api/src/cf4-template/`
- Modifies `app/src/components/CF4Form.vue`
- Removes, shortens, or conditionally hides the HS code disclaimer
- Changes `STRIPE_PRO_PRICE_ID` or any pricing constant
- Changes free-tier quota or retention limit constants
- Generates a PDF in frontend code
- Calls Anthropic API from the frontend
- Contains hardcoded credentials
- Fails lint or typecheck
- Has no associated test

## Escalation

Label `factory:needs-human` and pause work when:

- 2 consecutive fix attempts on a PR fail quality gates
- BOC updates the official CF4 form layout (human must approve layout changes)
- HS code disclaimer requires legal review
- Stripe pricing change is requested
- Security vulnerability found in PDF generation or auth path

## Throughput Controls

- Max `maxBudgetUsd` per Claude Haiku HS code lookup: $0.05
- Max `maxBudgetUsd` per AI triage/implement/validate node: $1.00
- Max 2 fix attempts per PR before escalation
- Orchestrator runs on cron every 6 hours
- 90-day manifest cleanup cron must not be disabled

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
api/src/pdf/**
api/src/cf4-template/**
app/src/components/CF4Form.vue
.env
.env.production
```
