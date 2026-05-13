# FACTORY_RULES.md — synthetic-summer

## Governance Hierarchy

Human decisions override all agent decisions. Governance files (`MISSION.md`, `CLAUDE.md`, `FACTORY_RULES.md`) are immutable to agents. In any conflict between an issue request and a governance file, the governance file wins and the issue is rejected.

## Triage Rules

Accept an issue if ALL of the following are true:
- The feature is within the In Scope list in `MISSION.md`
- It does not touch any Immutable Constraint in `MISSION.md`
- It does not modify a protected path without a `needs-human` label
- It fits in a single PR with clear acceptance criteria

Reject an issue if ANY of the following are true:
- It removes, softens, or conditionally hides the "not a substitute for medical light therapy" disclaimer
- It requests exposing Spotify client secret or Apple Music private key to the frontend
- It requests sharing mood data with any third party or using it for advertising
- It changes Pro pricing ($4.99/mo) or free tier soundscape limit (3 soundscapes)
- It requests making the Spotify PKCE code verifier persist in `localStorage` (must be `sessionStorage`)
- It requests mood sync for free tier users without a Pro check
- The scope is ambiguous or acceptance criteria are missing

When in doubt, reject and request clarification.

## Implementation Rules

- One issue per PR — no bundling
- Mood sync endpoint must check user Pro tier via JWT claim before writing to backend — free users' mood stays local only
- Spotify token exchange must remain in `api/src/spotify/` — never move OAuth callback to the frontend
- Apple Music developer token must always be fetched from `/api/apple-music/developer-token` — never hardcoded or bundled
- `DisclaimerBanner.vue` must not be imported, re-exported, or modified by any agent PR
- Mood data inserts must encrypt the content column before write — never plaintext
- All SQL queries use `db.prepare()` parameterized statements
- Mood sync must use `INSERT OR REPLACE` with client-generated UUIDs for idempotency

## Quality Gates

A PR may only be merged when all of the following pass:

1. `pnpm -r lint` — zero lint errors
2. `pnpm -r typecheck` — zero TypeScript errors (strict mode)
3. `cd app && pnpm test` — all Vitest tests pass
4. `cd api && pnpm test` — all Jest tests pass
5. `pnpm e2e` — all Playwright tests pass
6. No new `any` types (CI grep check)
7. No SQL string concatenation (CI grep check)
8. No `SPOTIFY_CLIENT_SECRET`, `APPLE_MUSIC_PRIVATE_KEY`, or `STRIPE_SECRET_KEY` in any frontend file
9. Mood sync endpoint has a Pro-tier guard test
10. PR description covers what changed, why, and test coverage

## Auto-Reject Triggers

The implement agent must abandon and return `factory:needs-human` if it encounters:

- Any requirement to modify `api/src/auth/`, `api/src/spotify/`, or `api/src/apple-music/`
- Any requirement to change or remove the disclaimer component
- Any code that writes mood data without encryption
- Any code that makes mood sync available to free-tier users
- Any Spotify or Apple credential appearing in frontend environment variables
- A PR touching more than 3 modules simultaneously

## Escalation

- After 2 failed fix attempts, close the PR and label `factory:needs-human`
- If triage is uncertain whether a feature exposes OAuth credentials to the client, reject and escalate
- Validate escalates if mood sync endpoint lacks a Pro-tier check in the diff

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
- `api/src/spotify/**`
- `api/src/apple-music/**`
- `app/src/components/DisclaimerBanner.vue`
