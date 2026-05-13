# FACTORY_RULES.md — rentals

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
2. It does not touch any protected path (`api/src/auth/`, `api/src/payments/deposit.service.ts`, `api/src/payments/capture.service.ts`, `api/src/verification/`)
3. It does not change the service fee (10%)
4. It does not introduce auto-release of deposit without lister confirmation
5. It does not remove or weaken ID verification requirement for renters
6. It does not change the late return fee formula
7. It does not propose automated damage claim resolution
8. It has a clear, testable acceptance criterion in the issue body
9. It is a single, atomic unit of work

An issue is **rejected** if any of the following are true:

- It touches any protected path
- It proposes changing `SERVICE_FEE_BPS` from `1000`
- It proposes auto-releasing a deposit without explicit lister confirmation
- It proposes making ID verification optional or bypassable
- It proposes changing `LATE_FEE_PER_DAY_CENTS` or the late fee formula
- It proposes automated damage claim resolution (human-only)
- It proposes moving late fee calculation to the frontend
- It is ambiguous about what "done" looks like

**Default posture: reject.** If uncertain, close with a clarification request.

## Implementation Rules

Agents implementing accepted issues must never:

1. Modify any file under `api/src/auth/`, `api/src/payments/deposit.service.ts`, `api/src/payments/capture.service.ts`, or `api/src/verification/`
2. Write SQL with string interpolation — all queries must use parameterized statements
3. Change `SERVICE_FEE_BPS` (must equal `1000`) in any config or code
4. Add any code path that releases a deposit without an explicit lister confirmation action
5. Add any code path that allows a renter to book without `id_verified = true`
6. Change `LATE_FEE_PER_DAY_CENTS` or move late fee calculation to `web/`
7. Implement automated damage claim resolution — claims must remain in `under_review` until a human admin acts
8. Remove the `BEGIN EXCLUSIVE TRANSACTION` wrapping availability conflict detection
9. Call the Anthropic API from any frontend (`web/`) code
10. Store rental amounts or deposit amounts as REAL (floating point) — must be INTEGER (cents)

## Quality Gates

A PR passes validation only if ALL gates are green:

- [ ] `pnpm lint` exits 0
- [ ] `cd api && pnpm type-check` exits 0
- [ ] `cd web && pnpm type-check` exits 0
- [ ] `cd api && pnpm test` all tests pass
- [ ] `cd web && pnpm test` all tests pass
- [ ] No modified files under `api/src/auth/`, `api/src/payments/deposit.service.ts`, `api/src/payments/capture.service.ts`, `api/src/verification/`
- [ ] No SQL string interpolation
- [ ] No code path that releases deposit without lister confirmation
- [ ] No code path that bypasses `id_verified` check before booking
- [ ] `SERVICE_FEE_BPS` value unchanged in config
- [ ] `LATE_FEE_PER_DAY_CENTS` value unchanged; calculation remains server-side
- [ ] Availability conflict detection query still wrapped in `BEGIN EXCLUSIVE TRANSACTION`
- [ ] New features include at least one unit test covering happy path and one error case

## Auto-Reject Triggers

The validate workflow must immediately reject a PR and apply `factory:needs-human` if any of the following are detected in the diff:

- Any diff in `api/src/auth/**`, `api/src/payments/deposit.service.ts`, `api/src/payments/capture.service.ts`, or `api/src/verification/**`
- Any SQL statement using template literals or string concatenation
- Any code path that releases a deposit without checking lister confirmation
- Any code path that creates a booking without checking `id_verified = true`
- Any change to `SERVICE_FEE_BPS` or `LATE_FEE_PER_DAY_CENTS` in config files
- Any late fee calculation moved to or duplicated in `web/` source files
- Any automated state transition on a damage claim to `resolved` without admin role check
- Removal of `BEGIN EXCLUSIVE TRANSACTION` from availability conflict query
- Any call to `anthropic` SDK from `web/` source files
- Any amount stored as `REAL` type in a new or modified migration

## Escalation

- After **2 failed fix attempts** on the same PR, apply `factory:needs-human` and stop
- Any issue touching Stripe Payment Intent capture flow, deposit hold logic, or ID verification must apply `factory:needs-human` at triage if scope is unclear
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
- `api/src/payments/deposit.service.ts`
- `api/src/payments/capture.service.ts`
- `api/src/verification/**`
- `.env` (any environment file containing secrets)
