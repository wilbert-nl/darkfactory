# FACTORY_RULES.md — track-px

## Governance Hierarchy

Human decisions override all agent decisions. Governance files (`MISSION.md`, `CLAUDE.md`, `FACTORY_RULES.md`) are immutable to agents. In any conflict between an issue request and a governance file, the governance file wins and the issue is rejected.

## Triage Rules

Accept an issue if ALL of the following are true:
- The feature is within the In Scope list in `MISSION.md`
- It does not touch any Immutable Constraint in `MISSION.md`
- It does not require server-side processing or storage of health data
- It fits in a single PR with clear acceptance criteria
- All encryption of health data passes through `encryption.service.ts` without modification to that file

Reject an issue if ANY of the following are true:
- It requires sending any patient data to a server in any form (even encrypted by the server)
- It introduces any analytics, telemetry, error tracking (Sentry, etc.), or external logging
- It requests softening, removing, or conditionally hiding the EHR disclaimer
- It implements soft deletes — patient deletion must be immediate and hard
- It adds any `fetch()` or HTTP call outside of `backup.service.ts` (Dropbox/Drive OAuth only)
- It modifies `encryption.service.ts` directly (requires human override)
- It modifies `Disclaimer.vue` directly (requires human override)
- The scope is ambiguous or acceptance criteria are missing

When in doubt, reject and request clarification. This app handles health data — the bias toward rejection is intentional and strong.

## Implementation Rules

- One issue per PR — no bundling
- `db.service.ts` is the only file that calls sql.js APIs — all other code accesses the database through it
- All data written through `db.service.ts` must be encrypted by `encryption.service.ts` first
- Patient delete must call `db.prepare('DELETE FROM patients WHERE id = ?').run(id)` directly — no soft delete, no `deleted_at`, no cascade delays
- `backup.service.ts` must only ever send the full encrypted database blob — never individual records
- No new network calls may be added to any file other than `backup.service.ts`
- The service worker must be configured to cache all app assets for full offline operation
- All sql.js queries use the parameterized API — no string concatenation

## Quality Gates

A PR may only be merged when all of the following pass:

1. `cd app && pnpm lint` — zero lint errors
2. `cd app && pnpm typecheck` — zero TypeScript errors (strict mode)
3. `cd app && pnpm test` — all Vitest tests pass
4. `pnpm e2e` — all Playwright tests pass
5. No new `any` types (CI grep check)
6. No SQL string concatenation (CI grep check)
7. No `fetch()` or `XMLHttpRequest` outside `backup.service.ts` (CI grep check)
8. No import of `encryption.service.ts` from any file other than `db.service.ts`
9. No new environment variables containing secrets
10. PR description covers what changed, why, and test coverage

## Auto-Reject Triggers

The implement agent must abandon and return `factory:needs-human` if it encounters:

- Any requirement to modify `app/src/services/encryption.service.ts`
- Any requirement to modify `app/src/components/Disclaimer.vue`
- Any requirement to add a server-side component or API endpoint
- Any requirement to add analytics, telemetry, or error tracking
- Any code that sends health data to an external service
- Any soft-delete implementation for patient records
- A PR touching more than 3 modules simultaneously

## Escalation

- After 2 failed fix attempts, close the PR and label `factory:needs-human`
- Any doubt about whether a feature transmits health data externally → reject immediately and escalate
- Validate agent escalates if any new `fetch()` call appears outside `backup.service.ts` in the diff

## Throughput Controls

- Maximum 1 open PR per issue
- Maximum `maxBudgetUsd: 1.50` per implement run (no backend = smaller scope)
- Maximum `maxBudgetUsd: 0.50` per validate run
- Maximum `maxBudgetUsd: 0.75` per fix run

## Separation of Concerns

- Validate agent reads only PR diff and test output — never the issue or implementation plan
- Triage agent never writes code
- Implement agent never modifies governance files
- Fix agent only touches files already in the failing PR diff

## Protected Files

Agents must never modify:

- `MISSION.md`
- `CLAUDE.md`
- `FACTORY_RULES.md`
- `app/src/services/encryption.service.ts`
- `app/src/components/Disclaimer.vue`
