# FACTORY_RULES.md — warp-selfie

## Governance Hierarchy

Human decisions override all agent decisions. Governance files (`MISSION.md`, `CLAUDE.md`, `FACTORY_RULES.md`) are immutable to agents. In any conflict between an issue request and a governance file, the governance file wins and the issue is rejected.

## Triage Rules

Accept an issue if ALL of the following are true:
- The feature is within the In Scope list in `MISSION.md`
- It does not touch any Immutable Constraint in `MISSION.md`
- It does not require modifying a protected path without a `needs-human` label
- It fits in a single PR with clear acceptance criteria

Reject an issue if ANY of the following are true:
- It moves watermarking to the client side in any form
- It requests bypassing or conditionally skipping the watermark for free-tier users
- It changes the free tier daily cap (3/day) or image retention periods (24h free, 30d Pro)
- It requests using user photos for AI model training
- It exposes Replicate, Stability AI, or R2 credentials to the frontend
- It changes Pro pricing ($6.99/mo)
- The scope is ambiguous or acceptance criteria are missing

When in doubt, reject and request clarification.

## Implementation Rules

- One issue per PR
- Watermark must be applied in `watermark.service.ts` using Sharp, after compositing, before R2 upload — the pipeline order must never be changed
- Free-tier outputs: R2 key must end with `_wm` suffix — `r2.service.ts` must enforce this naming
- `FREE_DAILY_CAP = 3` in `jobs.service.ts` — the only place; any cap check must reference this constant
- `FREE_RETENTION_HOURS = 24` and `PRO_RETENTION_DAYS = 30` in `r2.service.ts` — the only place
- Daily cleanup cron must test that it deletes both the R2 object and the database row
- All SQL queries use `db.prepare()` parameterized statements
- Daily cap check and job insert must be in a SQLite transaction
- AI API calls must include opt-out-of-training parameters per provider documentation

## Quality Gates

A PR may only be merged when all of the following pass:

1. `pnpm -r lint` — zero lint errors
2. `pnpm -r typecheck` — zero TypeScript errors (strict mode)
3. `cd app && pnpm test` — all Vitest tests pass
4. `cd api && pnpm test` — all Jest tests pass
5. `pnpm e2e` — all Playwright tests pass
6. No new `any` types (CI grep check)
7. No SQL string concatenation (CI grep check)
8. No `REPLICATE_API_TOKEN`, `STABILITY_API_KEY`, or R2 credentials in any frontend file
9. Watermark pipeline test verifies watermark is applied before upload
10. Daily cap test verifies transaction-wrapped check + insert

## Auto-Reject Triggers

The implement agent must abandon and return `factory:needs-human` if it encounters:

- Any requirement to modify `api/src/auth/`, `api/src/watermark/`, `api/src/ai-provider/`, or `api/src/storage/`
- Any watermark bypass or client-side watermark logic
- Any change to free tier cap or retention period values
- Any AI API call that opts user images into training
- Any AI provider credential in frontend environment variables
- A PR touching more than 3 modules simultaneously

## Escalation

- After 2 failed fix attempts, close the PR and label `factory:needs-human`
- If triage is uncertain whether a feature bypasses the watermark, reject and escalate
- Validate escalates if watermark is applied after upload or not at all in the diff

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
- `api/src/watermark/**`
- `api/src/ai-provider/**`
- `api/src/storage/**`
