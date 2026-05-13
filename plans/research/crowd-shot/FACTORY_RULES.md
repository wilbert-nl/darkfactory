# FACTORY_RULES.md — crowd-shot

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
  - It does not touch protected paths (`api/src/auth/`, `api/src/payments/escrow.service.ts`, `api/src/geo/`, `api/src/moderation/`) unless labeled `human-approved`
  - It does not change the platform fee (20%) or max reward amount ($500)
  - It does not introduce auto-resolution for disputes
  - It specifies testable acceptance criteria
- If ambiguous, close with a comment requesting clarification — do not guess intent
- Label accepted issues `factory:accepted`, rejected issues `factory:rejected`, escalations `factory:needs-human`

## Implementation Rules

Agents implementing an accepted issue must never:

1. Modify `MISSION.md`, `CLAUDE.md`, or `FACTORY_RULES.md`
2. Modify protected paths without `human-approved` label
3. Change `PLATFORM_FEE_PERCENT` (must remain 20) or `MAX_REWARD_AMOUNT_USD` (must remain 500)
4. Trust client-submitted GPS coordinates as authoritative — all coordinates must be verified in `api/src/geo/`
5. Release escrowed funds without explicit requester approval or a human dispute decision
6. Implement auto-resolution logic for disputes — disputes escalate to human review only
7. Deliver photo/video content to requesters before it passes the moderation queue
8. Use string interpolation in any SQL query — parameterized statements only
9. Add Stripe SDK imports or webhook handling outside `api/src/payments/`
10. Expose R2 credentials or Stripe secrets in any response or frontend file

## Quality Gates

A PR may not be merged unless all of the following pass:

- [ ] `pnpm lint` exits 0
- [ ] `pnpm typecheck` exits 0
- [ ] `pnpm test` (frontend Vitest) exits 0 with no skipped tests for changed modules
- [ ] `cd api && pnpm test` (backend Jest) exits 0 with no skipped tests for changed modules
- [ ] New features include at least one test covering the happy path
- [ ] Escrow state transitions are covered by at least one test asserting the correct `escrow_events` row is written
- [ ] GPS verification path has at least one unit test asserting rejection of implausible coordinates
- [ ] No `console.log` or `console.error` left in production code paths
- [ ] No TODO comments left unresolved in changed files

## Auto-Reject Triggers

Immediately close and label `factory:rejected` any PR that:

- Modifies `MISSION.md`, `CLAUDE.md`, or `FACTORY_RULES.md`
- Touches a protected path without `human-approved` label
- Changes `PLATFORM_FEE_PERCENT` or `MAX_REWARD_AMOUNT_USD`
- Adds any dispute auto-resolution logic
- Bypasses the content moderation gate before delivery
- Releases escrow funds without requester approval
- Introduces raw SQL string concatenation
- Exposes Stripe Connect or R2 credentials to the frontend
- Accepts client GPS coordinates without server-side verification
- Adds a dependency not listed in CLAUDE.md stack table without a separate `chore(deps)` issue

## Escalation

Escalate to `factory:needs-human` when:

- Two consecutive fix attempts on a PR fail quality gates
- Any issue touches both a protected path and non-protected paths in the same PR
- A Stripe webhook or escrow logic change is required
- A dispute reaches the resolution step (human must resolve)
- A moderation decision cannot be made automatically (always the case — moderation is human-reviewed)

## Throughput Controls

- Max 3 open `factory:in-progress` issues at any time
- Max 2 fix attempts per PR — escalate after the second failure
- Each AI node must have `maxBudgetUsd` set — default: triage $0.10, implement $0.60, validate $0.25, fix $0.35

## Separation of Concerns

- The validator agent reads only the PR diff and test output — it must not read the implementation plan or issue description
- The triage agent must not write code
- The implement agent must not modify governance files
- No agent may approve its own PR
- Moderation decisions are human-only — no agent may approve or reject submitted content on behalf of a human moderator

## Protected Files

The following files must never be modified by an agent without a `human-approved` label on the originating issue:

- `api/src/auth/**` — JWT issuance and refresh token logic
- `api/src/payments/escrow.service.ts` — escrow hold, release, refund
- `api/src/geo/**` — GPS verification and rtree proximity queries
- `api/src/moderation/**` — content moderation queue and delivery gate
- `MISSION.md`
- `CLAUDE.md`
- `FACTORY_RULES.md`
