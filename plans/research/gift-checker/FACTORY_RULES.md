# FACTORY_RULES.md — gift-checker

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
  - It does not touch protected paths (`api/src/auth/`, `api/src/groups/visibility.service.ts`) unless labeled `human-approved`
  - It does not change Pro pricing ($3.99/mo)
  - It does not change claimed-flag visibility rules (wishlist owner must never see claimants)
  - It does not change invite link expiry (must remain 7 days)
  - It specifies testable acceptance criteria
- If ambiguous, close with a comment requesting clarification — do not guess intent
- Label accepted issues `factory:accepted`, rejected issues `factory:rejected`, escalations `factory:needs-human`

## Implementation Rules

Agents implementing an accepted issue must never:

1. Modify `MISSION.md`, `CLAUDE.md`, or `FACTORY_RULES.md`
2. Modify protected paths without `human-approved` label
3. Change the Pro subscription price ($3.99/mo) in any file
4. Return `claimant_user_id` or any claimant-identifying field in a response to the wishlist owner
5. Store claimed-flag state locally on the client — claimed flags must always come from the backend
6. Store group invite tokens in plaintext — store only SHA-256 hash in the database
7. Set `INVITE_EXPIRY_DAYS` to any value other than 7
8. Include the recipient's wishlist items in the Claude Haiku suggestions prompt context
9. Allow claimed flags to be read by the recipient of the wishlist
10. Use string interpolation in any SQL query — parameterized statements only

## Quality Gates

A PR may not be merged unless all of the following pass:

- [ ] `pnpm lint` exits 0
- [ ] `pnpm typecheck` exits 0
- [ ] `pnpm test` (frontend Vitest) exits 0 with no skipped tests for changed modules
- [ ] `cd api && pnpm test` (backend Jest) exits 0 with no skipped tests for changed modules
- [ ] New features include at least one test covering the happy path
- [ ] Visibility: any change to claimed-flag endpoints must include a test asserting that the wishlist owner's response contains no `claimant_user_id` field
- [ ] Free tier: any change to group or wishlist creation must include a test asserting the 2nd group (or 11th wishlist item) is rejected for free-tier users
- [ ] Invite: any change to invite flow must include a test asserting tokens expire after 7 days and raw token is not stored
- [ ] No `console.log` or `console.error` left in production code paths
- [ ] No TODO comments left unresolved in changed files

## Auto-Reject Triggers

Immediately close and label `factory:rejected` any PR that:

- Modifies `MISSION.md`, `CLAUDE.md`, or `FACTORY_RULES.md`
- Touches a protected path without `human-approved` label
- Changes the Pro price string or Stripe price ID
- Returns claimant identity information to a wishlist owner in any response
- Stores claimed flags locally on the client device
- Stores group invite tokens in plaintext
- Changes `INVITE_EXPIRY_DAYS` to anything other than 7
- Includes recipient wishlist data in Claude Haiku suggestion prompts
- Introduces raw SQL string concatenation
- Adds a dependency not listed in CLAUDE.md stack table without a separate `chore(deps)` issue

## Escalation

Escalate to `factory:needs-human` when:

- Two consecutive fix attempts on a PR fail quality gates
- Any issue touches both a protected path and non-protected paths in the same PR
- A user reports that a wishlist owner saw claimant information (privacy breach — immediate human review)
- Any change to the visibility service logic is proposed
- A billing or Stripe webhook change is required

## Throughput Controls

- Max 3 open `factory:in-progress` issues at any time
- Max 2 fix attempts per PR — escalate after the second failure
- Each AI node must have `maxBudgetUsd` set — default: triage $0.10, implement $0.40, validate $0.20, fix $0.25

## Separation of Concerns

- The validator agent reads only the PR diff and test output — it must not read the implementation plan or issue description
- The triage agent must not write code
- The implement agent must not modify governance files
- No agent may approve its own PR
- Visibility logic lives exclusively in `api/src/groups/visibility.service.ts` — the validator must check that no other file makes claimed-flag visibility decisions

## Protected Files

The following files must never be modified by an agent without a `human-approved` label on the originating issue:

- `api/src/auth/**` — JWT issuance and refresh token logic
- `api/src/groups/visibility.service.ts` — claimed-flag visibility rules (core privacy invariant)
- `MISSION.md`
- `CLAUDE.md`
- `FACTORY_RULES.md`
