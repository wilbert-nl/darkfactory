# FACTORY_RULES.md — scribe-speak

## Governance Hierarchy

Human decisions override all agent decisions. The three governance files (`MISSION.md`, `CLAUDE.md`, `FACTORY_RULES.md`) are immutable to agents. In any conflict between an issue request and a governance file, the governance file wins and the issue is rejected.

## Triage Rules

Accept an issue if ALL of the following are true:
- The feature or fix is within the In Scope list in `MISSION.md`
- It does not touch any Immutable Constraint in `MISSION.md`
- It does not require modifying a protected path without a `needs-human` label
- The implementation can be done in a single PR (no cross-cutting refactors)
- The issue is unambiguous — all acceptance criteria are clearly stated

Reject an issue if ANY of the following are true:
- It requests changes to audio retention behavior (recordings must be deleted immediately)
- It requests softening, removing, or conditionally hiding the medical/legal disclaimer
- It requests moving transcription, AI formatting, DOCX, or PDF generation to the frontend
- It changes the Pro price ($9.99/mo) or free tier limit (10 min/mo)
- It requests storing audio files after transcription for any reason (replay, backup, audit)
- It is ambiguous — missing acceptance criteria or scope is unclear

When in doubt, reject and request clarification.

## Implementation Rules

- Implement one issue per PR — never bundle unrelated changes
- Do not modify files outside the scope of the accepted issue
- Every new service or module must have a corresponding Jest test file
- Every new Vue component must have a corresponding Vitest test file
- All database inserts and queries must use `db.prepare()` parameterized statements — CI will reject PRs with string concatenation in SQL
- Transcript content must be encrypted before insert — never write plaintext transcript to the database
- The `audio_uploads` cleanup job must be tested with a unit test verifying deletion within 60 seconds of transcription completion
- `DisclaimerBanner.vue` must not be imported or modified by any agent PR — changes to this file require human review

## Quality Gates

A PR may only be merged when all of the following pass:

1. `pnpm -r lint` — zero lint errors
2. `pnpm -r typecheck` — zero TypeScript errors (strict mode)
3. `cd app && pnpm test` — all Vitest tests pass
4. `cd api && pnpm test` — all Jest tests pass
5. `pnpm e2e` — all Playwright tests pass
6. No new `any` types introduced (CI grep check)
7. No SQL string concatenation (CI grep check: `db.prepare\(.*\+`)
8. No `OPENAI_API_KEY`, `DEEPGRAM_API_KEY`, or `ANTHROPIC_API_KEY` in any frontend file
9. PR description includes: what changed, why, and which tests cover it

## Auto-Reject Triggers

The implement agent must abandon a PR and return `factory:needs-human` if it encounters:

- Any requirement to modify `api/src/auth/`, `api/src/transcription/`, or `api/src/export/`
- Any requirement to delete or skip the audio cleanup step
- Any requirement to store raw audio files beyond the transcription pipeline
- Any requirement to expose transcription or AI provider API keys to the frontend
- Any code path that writes unencrypted transcript content to the database
- Any modification to the disclaimer text or its conditional display logic
- A PR diff that touches more than 3 modules simultaneously (scope creep indicator)

## Escalation

- After 2 failed fix attempts on the same PR, close the PR and add `factory:needs-human`
- If the triage agent is uncertain whether an issue violates an immutable constraint, reject and add `factory:needs-human` — do not guess
- If a quality gate cannot be satisfied without modifying a protected path, escalate immediately

## Throughput Controls

- Maximum 1 PR open at a time per issue
- Maximum `maxBudgetUsd: 2.00` per implement run
- Maximum `maxBudgetUsd: 0.50` per validate run
- Maximum `maxBudgetUsd: 1.00` per fix run
- Triage runs on every new issue labeled `factory:untriaged`

## Separation of Concerns

- The validate agent reads only the PR diff and test output — it never reads the implementation plan or issue description
- The triage agent never writes code
- The implement agent never modifies governance files
- The fix agent may only modify files already changed in the failing PR — no new files unless a test file is missing

## Protected Files

Agents must never modify these files under any circumstances:

- `MISSION.md`
- `CLAUDE.md`
- `FACTORY_RULES.md`
- `api/src/auth/**`
- `api/src/transcription/**`
- `api/src/export/**`
- `app/src/components/DisclaimerBanner.vue`
