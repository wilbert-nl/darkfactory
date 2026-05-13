# FACTORY_RULES.md — fit-me

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
  - It does not touch protected paths (`api/src/auth/`, `api/src/watermark/`, `api/src/ai-provider/`, `api/src/storage/`) unless labeled `human-approved`
  - It does not change Pro pricing ($9.99/mo)
  - It does not bypass the free-tier cap (3/day) or watermark
  - It does not remove or weaken the age gate
  - It specifies testable acceptance criteria
- If ambiguous, close with a comment requesting clarification — do not guess intent
- Label accepted issues `factory:accepted`, rejected issues `factory:rejected`, escalations `factory:needs-human`

## Implementation Rules

Agents implementing an accepted issue must never:

1. Modify `MISSION.md`, `CLAUDE.md`, or `FACTORY_RULES.md`
2. Modify protected paths without `human-approved` label
3. Change the Pro subscription price ($9.99/mo) in any file
4. Return a non-watermarked image URL to a free-tier user under any code path
5. Bypass, disable, or modify the free-tier daily hard cap (must remain 3/day, server-enforced)
6. Remove or weaken the age gate on signup
7. Use user body images for AI model training or expose them to training pipelines
8. Import Replicate, HuggingFace, or any external AI SDK outside `api/src/ai-provider/`
9. Store external AI provider credentials in any frontend file or API response
10. Use string interpolation in any SQL query — parameterized statements only

## Quality Gates

A PR may not be merged unless all of the following pass:

- [ ] `pnpm lint` exits 0
- [ ] `pnpm typecheck` exits 0
- [ ] `pnpm test` (frontend Vitest) exits 0 with no skipped tests for changed modules
- [ ] `cd api && pnpm test` (backend Jest) exits 0 with no skipped tests for changed modules
- [ ] New features include at least one test covering the happy path
- [ ] Watermark: any change to `api/src/watermark/` must include a test asserting free-tier jobs always receive a watermarked URL
- [ ] Quota: any change to `api/src/quota/` must include a test asserting the 4th request in a day is rejected for free-tier users
- [ ] Cleanup: any change to `api/src/storage/` must include a test asserting images older than 24h (free) or 30 days (Pro) are deleted
- [ ] No `console.log` or `console.error` left in production code paths
- [ ] No TODO comments left unresolved in changed files

## Auto-Reject Triggers

Immediately close and label `factory:rejected` any PR that:

- Modifies `MISSION.md`, `CLAUDE.md`, or `FACTORY_RULES.md`
- Touches a protected path without `human-approved` label
- Changes the Pro price string or Stripe price ID
- Removes, weakens, or adds a bypass flag to the watermark logic
- Raises the free-tier daily cap above 3 or makes it configurable per-user
- Removes or conditionally bypasses the age gate
- Adds Replicate or HuggingFace SDK imports outside `api/src/ai-provider/`
- Includes AI provider credentials in any frontend build artifact or API response
- Introduces raw SQL string concatenation
- Adds a dependency not listed in CLAUDE.md stack table without a separate `chore(deps)` issue

## Escalation

Escalate to `factory:needs-human` when:

- Two consecutive fix attempts on a PR fail quality gates
- Any issue touches both a protected path and non-protected paths in the same PR
- The external AI provider (Replicate/HuggingFace) changes its API contract or a model is deprecated
- A user reports a data retention compliance issue (image not deleted on schedule)
- Any change to the image cleanup scheduler is proposed

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

- `api/src/auth/**` — JWT issuance, age gate enforcement
- `api/src/watermark/**` — watermark application logic
- `api/src/ai-provider/**` — Replicate/HuggingFace client and credentials
- `api/src/storage/**` — R2 presigned URL generation and image cleanup scheduler
- `MISSION.md`
- `CLAUDE.md`
- `FACTORY_RULES.md`
