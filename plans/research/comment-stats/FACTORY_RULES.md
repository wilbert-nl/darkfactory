# FACTORY_RULES.md — comment-stats

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
  - It does not touch protected paths (`api/src/youtube/`, `api/src/auth/`) unless labeled `human-approved`
  - It does not change Pro pricing ($7.99/mo)
  - It does not change YouTube API quota logic
  - It specifies testable acceptance criteria
- If ambiguous, close with a comment requesting clarification — do not guess intent
- Label accepted issues `factory:accepted`, rejected issues `factory:rejected`, escalations `factory:needs-human`

## Implementation Rules

Agents implementing an accepted issue must never:

1. Modify `MISSION.md`, `CLAUDE.md`, or `FACTORY_RULES.md`
2. Modify files in `api/src/youtube/` or `api/src/auth/` without `human-approved` label
3. Change the Pro subscription price ($7.99/mo) in any file
4. Remove or bypass the YouTube API quota counter (`quota_usage` table)
5. Call the YouTube Data API from any module other than `api/src/youtube/`
6. Call the Anthropic Claude API from any file outside `api/src/analysis/`
7. Store OAuth tokens or API keys in plaintext (must use `ENCRYPTION_KEY` + AES-256-GCM)
8. Use string interpolation in any SQL query — parameterized statements only
9. Display private or unlisted video comments without confirming channel ownership
10. Exceed the $0.05 per-video Claude API cost cap (truncate batches before sending)

## Quality Gates

A PR may not be merged unless all of the following pass:

- [ ] `pnpm lint` exits 0
- [ ] `pnpm typecheck` exits 0
- [ ] `pnpm test` (frontend Vitest) exits 0 with no skipped tests for changed modules
- [ ] `cd api && pnpm test` (backend Jest) exits 0 with no skipped tests for changed modules
- [ ] New features include at least one Vitest or Jest test covering the happy path
- [ ] No `console.log` or `console.error` left in production code paths
- [ ] No TODO comments left unresolved in changed files

## Auto-Reject Triggers

Immediately close and label `factory:rejected` any PR that:

- Modifies `MISSION.md`, `CLAUDE.md`, or `FACTORY_RULES.md`
- Touches `api/src/youtube/` or `api/src/auth/` without `human-approved` label
- Changes the Pro price string or Stripe price ID
- Removes or disables the YouTube quota counter
- Introduces raw SQL string concatenation
- Adds `ANTHROPIC_API_KEY` or `YOUTUBE_*` to any `app/` (frontend) file
- Removes the 24-hour comment cache logic
- Adds a dependency not listed in the stack table in CLAUDE.md without a separate `chore(deps): add X` issue

## Escalation

Escalate to `factory:needs-human` when:

- Two consecutive fix attempts on a PR fail quality gates
- An issue requires changes to both a protected path and non-protected paths in the same PR
- A YouTube API quota error occurs in CI (quota may be legitimately exhausted)
- Any Stripe webhook or billing logic needs modification

## Throughput Controls

- Max 3 open `factory:in-progress` issues at any time
- Max 2 fix attempts per PR — escalate after the second failure
- Each AI node in the pipeline must have `maxBudgetUsd` set — default: triage $0.10, implement $0.50, validate $0.20, fix $0.30

## Separation of Concerns

- The validator agent reads only the PR diff and test output — it must not read the implementation plan or the issue description
- The triage agent must not write code
- The implement agent must not modify governance files
- No agent may approve its own PR

## Protected Files

The following files must never be modified by an agent without a `human-approved` label on the originating issue:

- `api/src/youtube/**` — YouTube API client and quota enforcement
- `api/src/auth/**` — OAuth flow and token encryption
- `MISSION.md`
- `CLAUDE.md`
- `FACTORY_RULES.md`
