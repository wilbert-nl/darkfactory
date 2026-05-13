# FACTORY_RULES.md — movie-critic

## Governance Hierarchy

```
MISSION.md  (scope — never modified by agents)
CLAUDE.md   (tech spec — never modified by agents)
FACTORY_RULES.md  (this file — never modified by agents)
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
2. It does not touch any protected path (`api/src/auth/`, `api/src/payments/commission.service.ts`, `api/src/screener/`, `api/src/review/publish.service.ts`)
3. It does not change the platform commission rate (15%)
4. It does not change the screener URL expiry (24h)
5. It does not change the payment auto-release timer (7 days)
6. It does not propose automated critic approval
7. It does not propose agents deleting published reviews
8. It does not expose filmmaker identity to critics before booking is confirmed
9. It has a clear, testable acceptance criterion in the issue body
10. It is a single, atomic unit of work

An issue is **rejected** if any of the following are true:

- It touches any protected path
- It proposes changing `COMMISSION_RATE_BPS` from `1500`
- It proposes changing `SCREENER_URL_TTL_SECONDS` from `86400`
- It proposes changing `AUTO_RELEASE_DAYS` from `7`
- It proposes an automated path for critic approval
- It proposes allowing agents to delete published reviews
- It would expose filmmaker PII to critic before `booking.status === 'confirmed'`
- It is ambiguous about what "done" looks like

**Default posture: reject.** If uncertain, close with a clarification request.

## Implementation Rules

Agents implementing accepted issues must never:

1. Modify any file under `api/src/auth/`, `api/src/payments/commission.service.ts`, `api/src/screener/`, or `api/src/review/publish.service.ts`
2. Change `COMMISSION_RATE_BPS` (must equal `1500`) in any config or code
3. Change `SCREENER_URL_TTL_SECONDS` (must equal `86400`) in any config or code
4. Change `AUTO_RELEASE_DAYS` (must equal `7`) in any config or code
5. Write SQL with string interpolation — all queries must use parameterized statements
6. Set `critic.approved = true` without a human admin role check in the service layer
7. Return filmmaker name, email, or contact in any critic-facing API response before `booking.status === 'confirmed'`
8. Set `review.deleted_at` without a human admin role check
9. Construct screener URLs outside of `api/src/screener/`
10. Call the Anthropic API from any frontend (`web/`) code

## Quality Gates

A PR passes validation only if ALL gates are green:

- [ ] `pnpm lint` exits 0
- [ ] `cd api && pnpm type-check` exits 0
- [ ] `cd web && pnpm type-check` exits 0
- [ ] `cd api && pnpm test` all tests pass
- [ ] `cd web && pnpm test` all tests pass
- [ ] No modified files under `api/src/auth/`, `api/src/payments/commission.service.ts`, `api/src/screener/`, `api/src/review/publish.service.ts`
- [ ] No SQL string interpolation
- [ ] No `critic.approved = true` set without role guard
- [ ] No filmmaker PII returned in critic-facing endpoints before booking confirmed
- [ ] `COMMISSION_RATE_BPS`, `SCREENER_URL_TTL_SECONDS`, and `AUTO_RELEASE_DAYS` values unchanged in config
- [ ] No screener URL construction outside `api/src/screener/`
- [ ] New features include at least one unit test covering happy path and one error case

## Auto-Reject Triggers

The validate workflow must immediately reject a PR and apply `factory:needs-human` if any of the following are detected in the diff:

- Any diff in `api/src/auth/**`, `api/src/payments/commission.service.ts`, `api/src/screener/**`, or `api/src/review/publish.service.ts`
- Any SQL statement using template literals or string concatenation
- Any code setting `approved = true` on a critic without checking `req.user.role === 'admin'`
- Any endpoint that returns filmmaker `name`, `email`, or `phone` to a critic before booking confirmation
- Any change to `COMMISSION_RATE_BPS`, `SCREENER_URL_TTL_SECONDS`, or `AUTO_RELEASE_DAYS`
- Any code path setting `deleted_at` on a published review without admin role check
- Any screener URL generation outside `api/src/screener/`
- Any call to `anthropic` SDK from `web/` source files

## Escalation

- After **2 failed fix attempts** on the same PR, apply `factory:needs-human` and stop
- Any issue touching payment escrow, Stripe Connect flow, or filmmaker–critic identity rules must apply `factory:needs-human` at triage if scope is unclear
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
- `api/src/payments/commission.service.ts`
- `api/src/screener/**`
- `api/src/review/publish.service.ts`
- `.env` (any environment file containing secrets)
