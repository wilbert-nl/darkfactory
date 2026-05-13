# FACTORY_RULES.md — lottery-app

## Governance Hierarchy

```
MISSION.md  (scope — never modified by agents)
CLAUDE.md   (tech spec — never modified by agents)
FACTORY_RULES.md  (this file — never modified by agents)
  ↓
GitHub Issues  (human-filed work items)
  ↓
Archon Workflows  (triage → implement → validate → fix)
```

Agents operate only within the space defined by the three governance files. Any conflict between an issue and governance files is resolved in favor of governance files.

## Triage Rules

An issue is **accepted** only if ALL of the following are true:

1. It maps to a feature or bug explicitly within scope in `MISSION.md`
2. It does not touch any protected path (`api/src/auth/`, `api/src/kyc/`, `api/src/lottery/draw.service.ts`, `api/src/lottery/payout.service.ts`)
3. It does not introduce or reference `Math.random()` or `crypto.getRandomValues()` for lottery logic
4. It does not change the payout rate (95%) or platform fee (5%)
5. It does not enable lottery operations in a new jurisdiction
6. It does not propose modifying draw or payout records (append-only invariant)
7. It does not lower or remove the 18+ age verification gate
8. It has a clear, testable acceptance criterion in the issue body
9. It is a single, atomic unit of work

An issue is **rejected** if any of the following are true:

- It touches any protected path
- It references `Math.random()` anywhere in lottery context
- It proposes changing `PLATFORM_FEE_BPS` or `PAYOUT_RATE_BPS`
- It proposes auto-enabling a jurisdiction without human legal review
- It proposes UPDATE or DELETE on draw or payout tables
- It removes or weakens KYC or age verification
- It is ambiguous about what "done" looks like
- It has compliance or gambling-law implications not already covered in `MISSION.md`

**Default posture: reject.** Gambling platforms carry high legal risk — when uncertain, always apply `factory:needs-human`.

## Implementation Rules

Agents implementing accepted issues must never:

1. Modify any file under `api/src/auth/`, `api/src/kyc/`, or the protected lottery service files
2. Use `Math.random()`, `crypto.getRandomValues()`, or any non-NIST randomness source for draw logic
3. Change `PLATFORM_FEE_BPS` (must equal `500`) or `PAYOUT_RATE_BPS` (must equal `9500`) in any code
4. Write SQL with string interpolation — all queries must use parameterized statements
5. Write UPDATE or DELETE statements on `draws`, `payout_records`, or `audit_log` tables
6. Allow a non-KYC'd user to join a paid pool — KYC check must precede payment
7. Allow a user under 18 to pass age verification
8. Enable a jurisdiction by inserting into `jurisdiction_config` table
9. Call the Anthropic API from any frontend (`web/`) code
10. Remove or weaken deposit limit enforcement

## Quality Gates

A PR passes validation only if ALL gates are green:

- [ ] `pnpm lint` exits 0
- [ ] `cd api && pnpm type-check` exits 0
- [ ] `cd web && pnpm type-check` exits 0
- [ ] `cd api && pnpm test` all tests pass
- [ ] `cd web && pnpm test` all tests pass
- [ ] No modified files under `api/src/auth/`, `api/src/kyc/`, `api/src/lottery/draw.service.ts`, `api/src/lottery/payout.service.ts`
- [ ] No usage of `Math.random()` in any file under `api/src/`
- [ ] No UPDATE or DELETE statements targeting `draws`, `payout_records`, or `audit_log`
- [ ] No SQL string interpolation
- [ ] No code path that bypasses KYC check before pool entry
- [ ] `PLATFORM_FEE_BPS` and `PAYOUT_RATE_BPS` values unchanged in config files
- [ ] New features include at least one unit test covering happy path and one error case

## Auto-Reject Triggers

The validate workflow must immediately reject a PR and apply `factory:needs-human` if any of the following are detected in the diff:

- Any diff in `api/src/auth/**`, `api/src/kyc/**`, `api/src/lottery/draw.service.ts`, or `api/src/lottery/payout.service.ts`
- Any occurrence of `Math.random(` in `api/src/**`
- Any UPDATE or DELETE SQL statement targeting draw, payout, or audit tables
- Any SQL statement using template literals or string concatenation
- Any change to `PLATFORM_FEE_BPS` or `PAYOUT_RATE_BPS` values
- Any INSERT into `jurisdiction_config` table
- Any code path that allows pool entry without KYC status `approved`
- Any call to `anthropic` SDK from `web/` source files
- Removal or weakening of age verification (18+ check)

## Escalation

- After **2 failed fix attempts** on the same PR, apply `factory:needs-human` and stop
- Any issue touching gambling law, jurisdiction, KYC compliance, or payout calculations beyond simple bug fixes must immediately apply `factory:needs-human` at triage
- Human must resolve `factory:needs-human` issues — agents must not retry them

## Throughput Controls

- Maximum **1 PR open at a time** per factory run
- Maximum **2 fix attempts** per PR before escalation
- Cron schedule: every 6 hours
- `maxBudgetUsd: 2.00` per orchestrator run

## Separation of Concerns

- **Triage agent** reads only: issue body, governance files. Never reads implementation code.
- **Implement agent** reads: issue body, CLAUDE.md, relevant source files. Never reads validate agent output.
- **Validate agent** reads only: PR diff, test output, governance files. Never reads the implementation plan or triage rationale.
- **Fix agent** reads: validate agent feedback, PR diff. Does not re-read the original issue.

## Protected Files

Agents must never create, edit, or delete:

- `MISSION.md`
- `CLAUDE.md`
- `FACTORY_RULES.md`
- `api/src/auth/**`
- `api/src/kyc/**`
- `api/src/lottery/draw.service.ts`
- `api/src/lottery/payout.service.ts`
- `.env` (any environment file containing secrets)
