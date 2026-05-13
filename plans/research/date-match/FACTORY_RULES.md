# FACTORY_RULES.md — date-match

## Governance Hierarchy

1. `MISSION.md` — defines scope; agents may not build outside it
2. `CLAUDE.md` — defines stack and conventions; agents must follow exactly
3. `FACTORY_RULES.md` (this file) — defines agent process rules
4. GitHub Issues — unit of work; agents may not start work without a linked issue

Governance files are human-only. Agents must never modify `MISSION.md`, `CLAUDE.md`, or `FACTORY_RULES.md`.

## Triage Rules

- Process issues in batches of 5
- Accept at most 3 per batch; reject or defer the rest
- An issue is accepted only if:
  - It is clearly within MISSION.md scope
  - It does not touch protected paths (`api/src/auth/`, `api/src/ai/`, `app/src/components/Disclaimer.vue`) unless labeled `human-approved`
  - It does not change Pro pricing ($6.99/mo)
  - It does not implement a matching or recommendation engine
  - It does not remove, hide, or conditionally render the therapy disclaimer
  - It specifies testable acceptance criteria
- If ambiguous, close with a comment requesting clarification — do not guess intent
- Label accepted issues `factory:accepted`, rejected issues `factory:rejected`, escalations `factory:needs-human`

## Implementation Rules

Agents implementing an accepted issue must never:

1. Modify `MISSION.md`, `CLAUDE.md`, or `FACTORY_RULES.md`
2. Modify protected paths without `human-approved` label
3. Change the Pro subscription price ($6.99/mo) in any file
4. Log, print, or include questionnaire response values in error messages, stack traces, or API error bodies
5. Build any matching or recommendation engine connecting strangers
6. Remove, hide, `v-if`, or conditionally suppress `Disclaimer.vue` in the coaching UI
7. Store raw Claude Haiku API responses in the database — responses are session-only
8. Persist couples invite tokens in plaintext — store only SHA-256 hash
9. Set `INVITE_EXPIRY_HOURS` to any value other than 24
10. Use string interpolation in any SQL query — parameterized statements only

## Quality Gates

A PR may not be merged unless all of the following pass:

- [ ] `pnpm lint` exits 0
- [ ] `pnpm typecheck` exits 0
- [ ] `pnpm test` (frontend Vitest) exits 0 with no skipped tests for changed modules
- [ ] `cd api && pnpm test` (backend Jest) exits 0 with no skipped tests for changed modules
- [ ] New features include at least one test covering the happy path
- [ ] GDPR deletion: any change to `api/src/auth/` must include a test asserting no orphaned rows remain after `deleteUserCascade()`
- [ ] Disclaimer: any change to `app/src/pages/CoachingPage.vue` must include a test asserting `Disclaimer.vue` is rendered
- [ ] No `console.log` or `console.error` left in production code paths
- [ ] No TODO comments left unresolved in changed files

## Auto-Reject Triggers

Immediately close and label `factory:rejected` any PR that:

- Modifies `MISSION.md`, `CLAUDE.md`, or `FACTORY_RULES.md`
- Touches a protected path without `human-approved` label
- Changes the Pro price string or Stripe price ID
- Adds any matching or recommendation engine
- Removes or conditionally hides `Disclaimer.vue` in any coaching screen
- Persists raw Claude API responses to the database
- Logs questionnaire response values at any log level
- Stores invite tokens in plaintext in the database
- Changes `INVITE_EXPIRY_HOURS` to anything other than 24
- Adds a dependency not listed in CLAUDE.md stack table without a separate `chore(deps)` issue

## Escalation

Escalate to `factory:needs-human` when:

- Two consecutive fix attempts on a PR fail quality gates
- Any issue touches both a protected path and non-protected paths in the same PR
- A GDPR deletion request arrives via support (human must verify and initiate)
- Any change to the couples linking flow (invite token cryptography or expiry) is proposed

## Throughput Controls

- Max 3 open `factory:in-progress` issues at any time
- Max 2 fix attempts per PR — escalate after the second failure
- Each AI node must have `maxBudgetUsd` set — default: triage $0.10, implement $0.50, validate $0.20, fix $0.30

## Separation of Concerns

- The validator agent reads only the PR diff and test output — it must not read the implementation plan or issue description
- The triage agent must not write code
- The implement agent must not modify governance files
- No agent may approve its own PR

## Protected Files

The following files must never be modified by an agent without a `human-approved` label on the originating issue:

- `api/src/auth/**` — JWT issuance, refresh tokens, GDPR cascade deletion
- `api/src/ai/**` — Claude Haiku coaching prompts and response handling
- `app/src/components/Disclaimer.vue` — therapy disclaimer component
- `MISSION.md`
- `CLAUDE.md`
- `FACTORY_RULES.md`
