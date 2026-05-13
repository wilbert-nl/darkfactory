# FACTORY_RULES.md — travel-connect

## Governance Hierarchy

Human decisions override all agent decisions. Governance files (`MISSION.md`, `CLAUDE.md`, `FACTORY_RULES.md`) are immutable to agents. In any conflict between an issue request and a governance file, the governance file wins and the issue is rejected.

## Triage Rules

Accept an issue if ALL of the following are true:
- The feature is within the In Scope list in `MISSION.md`
- It does not touch any Immutable Constraint in `MISSION.md`
- It does not require modifying a protected path without a `needs-human` label
- It fits in a single PR with clear acceptance criteria

Reject an issue if ANY of the following are true:
- It changes the platform booking fee (8%) anywhere in the codebase
- It automates or programmatically grants the IATA badge
- It implements client-side-only proposal limit enforcement
- It shortens or removes the 14-day escrow auto-release
- It exposes traveler full name or contact details to agencies before booking confirmation
- It changes Pro pricing ($29/mo) or free proposal limit (3/mo)
- It requests adding WebSocket/real-time messaging in MVP scope
- The scope is ambiguous or acceptance criteria are missing

When in doubt, reject and request clarification.

## Implementation Rules

- One issue per PR
- `PLATFORM_FEE_PERCENT = 8` must remain the only fee definition — never define the fee in a controller, DTO, or frontend file
- Proposal limit check and insert must be wrapped in a SQLite `BEGIN IMMEDIATE` transaction — never check-then-insert without a transaction
- Traveler response DTOs for unconfirmed bookings must exclude: full name, email, phone, and address — enforced at the DTO serialization level
- IATA badge grant endpoint must require `ADMIN_TOKEN` header — never expose this endpoint without the token check
- `escrow.service.ts`: `ESCROW_AUTO_RELEASE_DAYS = 14` — any cron or job that auto-releases must reference only this constant
- All SQL queries use `db.prepare()` parameterized statements
- Account deletion cascade must use a scheduled job targeting `30 days` — never immediate

## Quality Gates

A PR may only be merged when all of the following pass:

1. `pnpm -r lint` — zero lint errors
2. `pnpm -r typecheck` — zero TypeScript errors (strict mode)
3. `cd app && pnpm test` — all Vitest tests pass
4. `cd api && pnpm test` — all Jest tests pass
5. `pnpm e2e` — all Playwright tests pass
6. No new `any` types (CI grep check)
7. No SQL string concatenation (CI grep check)
8. No `STRIPE_SECRET_KEY` or `ADMIN_TOKEN` in any frontend file
9. Proposal creation endpoint has a transaction-wrapped limit check test
10. Traveler DTO test confirms full contact fields are absent for unconfirmed bookings

## Auto-Reject Triggers

The implement agent must abandon and return `factory:needs-human` if it encounters:

- Any requirement to modify `api/src/auth/`, `api/src/payments/escrow.service.ts`, or `api/src/verification/`
- Any requirement to change the booking fee value
- Any automated IATA badge grant code path
- Any change to escrow auto-release timing
- Any DTO or query that returns traveler contact to agencies before booking
- A PR diff touching more than 3 modules simultaneously

## Escalation

- After 2 failed fix attempts, close the PR and label `factory:needs-human`
- If triage is uncertain whether a feature violates traveler privacy constraints, reject and escalate
- Validate escalates if the proposal limit check lacks a transaction in the diff

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
- `api/src/verification/**`
