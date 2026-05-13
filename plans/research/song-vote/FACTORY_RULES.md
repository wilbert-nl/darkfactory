# FACTORY_RULES.md — song-vote

## Governance Hierarchy

Human decisions override all agent decisions. The three governance files (`MISSION.md`, `CLAUDE.md`, `FACTORY_RULES.md`) are immutable to agents. In any conflict between an issue request and a governance file, the governance file wins and the issue is rejected.

## Triage Rules

Accept an issue if ALL of the following are true:
- The feature or fix is within the In Scope list in `MISSION.md`
- It does not touch any Immutable Constraint in `MISSION.md`
- It does not require modifying a protected path without a `needs-human` label
- The implementation fits in a single PR
- All acceptance criteria are clearly stated

Reject an issue if ANY of the following are true:
- It requires guests to create an account or provide PII to vote or request songs
- It requests auto-charging guests for tips in any form
- It would expose Spotify, YouTube, or Stripe credentials to the frontend
- It requests storing event passcodes in plaintext or in URL parameters
- It removes or raises the 500-concurrent-guest hard cap
- It changes Pro pricing ($9.99/mo) or free tier limits (1 event, 50 guests)
- It requests removing auth from the DJ dashboard
- The scope is ambiguous or acceptance criteria are missing

When in doubt, reject and request clarification.

## Implementation Rules

- Implement one issue per PR
- Guest pages (`GuestPage.vue`, `BigScreenPage.vue`) must never have auth guards added
- DJ routes must always have the JWT auth guard — never remove or weaken it
- `rate-limit.service.ts` is the single source of truth for the 500-guest cap — never duplicate this logic elsewhere
- All Spotify and YouTube API calls must go through `songs.controller.ts` — never add a client-side fetch to those APIs
- All SQL queries use `db.prepare()` parameterized statements — no string concatenation
- WebSocket events from guests must be treated as untrusted input — validate all fields server-side in `queue.gateway.ts`
- Tip payment flow: never update the queue before the Stripe webhook confirms payment

## Quality Gates

A PR may only be merged when all of the following pass:

1. `pnpm -r lint` — zero lint errors
2. `pnpm -r typecheck` — zero TypeScript errors (strict mode)
3. `cd app && pnpm test` — all Vitest tests pass
4. `cd api && pnpm test` — all Jest tests pass
5. `pnpm e2e` — all Playwright tests pass
6. No new `any` types (CI grep check)
7. No SQL string concatenation (CI grep check)
8. No `SPOTIFY_CLIENT_SECRET`, `YOUTUBE_API_KEY`, or `STRIPE_SECRET_KEY` in any frontend file
9. Guest pages have no auth imports or route guards
10. PR description explains what changed, why, and test coverage

## Auto-Reject Triggers

The implement agent must abandon and return `factory:needs-human` if it encounters:

- Any requirement to modify `api/src/auth/`, `api/src/payments/`, or `api/src/events/rate-limit.service.ts`
- Any requirement to add authentication to `GuestPage.vue` or `BigScreenPage.vue`
- Any requirement to collect guest PII (name, email, phone)
- Any code path that exposes API credentials to the frontend
- Any change to the 500-guest cap value
- Any auto-charge flow for tips
- A PR diff touching more than 3 modules simultaneously

## Escalation

- After 2 failed fix attempts, close the PR and label `factory:needs-human`
- If triage is uncertain whether a feature violates guest anonymity constraints, reject and escalate
- Validate agent escalates immediately if any DJ-only endpoint lacks an auth guard in the diff

## Throughput Controls

- Maximum 1 open PR per issue
- Maximum `maxBudgetUsd: 2.00` per implement run
- Maximum `maxBudgetUsd: 0.50` per validate run
- Maximum `maxBudgetUsd: 1.00` per fix run

## Separation of Concerns

- Validate agent reads only PR diff and test output — never the issue description or implementation plan
- Triage agent never writes code
- Implement agent never modifies governance files
- Fix agent only touches files already in the failing PR diff

## Protected Files

Agents must never modify:

- `MISSION.md`
- `CLAUDE.md`
- `FACTORY_RULES.md`
- `api/src/auth/**`
- `api/src/payments/**`
- `api/src/events/rate-limit.service.ts`
