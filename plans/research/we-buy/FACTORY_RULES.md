# FACTORY_RULES.md — we-buy

## Governance Hierarchy

Human decisions override all agent decisions. Governance files (`MISSION.md`, `CLAUDE.md`, `FACTORY_RULES.md`) are immutable to agents. In any conflict between an issue request and a governance file, the governance file wins and the issue is rejected.

## Triage Rules

Accept an issue if ALL of the following are true:
- The feature is within the In Scope list in `MISSION.md`
- It does not touch any Immutable Constraint in `MISSION.md`
- It does not require modifying a protected path without a `needs-human` label
- It fits in a single PR with clear acceptance criteria

Reject an issue if ANY of the following are true:
- It changes the platform transaction fee (3%) anywhere in the codebase
- It shortens or removes the 7-day escrow auto-release
- It requests removing or softening the AI grade disclaimer
- It adds `update()` or `delete()` methods to the ratings service
- It changes photo limits (free: 5, Pro: 20) without human approval
- It changes Pro pricing ($4.99/mo) or free listing limit (5 active)
- It exposes the Anthropic API key or R2 credentials to the frontend
- The scope is ambiguous or acceptance criteria are missing

When in doubt, reject and request clarification.

## Implementation Rules

- One issue per PR
- `PLATFORM_FEE_PERCENT = 3` in `fee.service.ts` — the only place; any escrow calculation must call `fee.service.ts`
- `ESCROW_AUTO_RELEASE_DAYS = 7` in `escrow.service.ts` — hardcoded constant; auto-release cron references only this
- `ratings.service.ts` must expose only `create()` — any PR adding `update()` or `delete()` is auto-rejected
- `MAX_PHOTOS_FREE = 5` and `MAX_PHOTOS_PRO = 20` in `listings.service.ts` — photo upload check must reference these constants in a transaction
- AI grading calls must resize images to max 1024px before base64 encoding
- Escrow release must check `released_at IS NULL` before Stripe capture — idempotency is required
- All SQL queries use `db.prepare()` parameterized statements
- `AiGradeDisclaimer.vue` must not be imported, re-exported, or modified by any agent PR

## Quality Gates

A PR may only be merged when all of the following pass:

1. `pnpm -r lint` — zero lint errors
2. `pnpm -r typecheck` — zero TypeScript errors (strict mode)
3. `cd app && pnpm test` — all Vitest tests pass
4. `cd api && pnpm test` — all Jest tests pass
5. `pnpm e2e` — all Playwright tests pass
6. No new `any` types (CI grep check)
7. No SQL string concatenation (CI grep check)
8. No `ANTHROPIC_API_KEY`, `R2_SECRET_ACCESS_KEY`, or `STRIPE_SECRET_KEY` in any frontend file
9. Ratings service test confirms no update/delete methods exist
10. Escrow release test confirms idempotency check (`released_at IS NULL`)
11. Photo upload test confirms transaction-wrapped count check

## Auto-Reject Triggers

The implement agent must abandon and return `factory:needs-human` if it encounters:

- Any requirement to modify `api/src/auth/`, `api/src/payments/escrow.service.ts`, `api/src/payments/fee.service.ts`, or `api/src/ai/`
- Any fee value other than 3% appearing in any file
- Any change to escrow auto-release timing
- Any ratings update or delete code path
- Any AI credential in frontend environment variables
- Any photo limit change outside of the two hardcoded constants
- A PR touching more than 3 modules simultaneously

## Escalation

- After 2 failed fix attempts, close the PR and label `factory:needs-human`
- If triage is uncertain whether a feature alters fee or escrow logic, reject and escalate
- Validate escalates if fee calculation does not call `fee.service.ts` in the diff

## Throughput Controls

- Maximum 1 open PR per issue
- Maximum `maxBudgetUsd: 2.00` per implement run
- Maximum `maxBudgetUsd: 0.50` per validate run
- Maximum `maxBudgetUsd: 1.00` per fix run

## Separation of Concerns

- Validate agent reads only PR diff and test output
- Triage agent never writes code
- Implement agent never modifies governance files
- Fix agent only touches files already in the failing PR diff

## Protected Files

Agents must never modify:

- `MISSION.md`
- `CLAUDE.md`
- `FACTORY_RULES.md`
- `api/src/auth/**`
- `api/src/payments/escrow.service.ts`
- `api/src/payments/fee.service.ts`
- `api/src/ai/**`
- `app/src/components/AiGradeDisclaimer.vue`
