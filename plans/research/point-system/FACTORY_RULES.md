# FACTORY_RULES.md — point-system

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
2. It does not touch any protected path (`api/src/auth/`, `api/src/webhooks/hmac.service.ts`, `api/src/points/ledger.service.ts`, `api/src/rewards/redemption.service.ts`)
3. It does not change the API rate limit ceiling (1000 req/hr per community)
4. It does not change Pro or Enterprise pricing ($29/mo Pro)
5. It does not propose allowing negative point balances
6. It does not propose UPDATE or DELETE on the `point_transactions` table
7. It does not propose introducing cookies or browser storage in embed widgets
8. It does not propose breaking idempotency on reward redemption
9. It has a clear, testable acceptance criterion in the issue body
10. It is a single, atomic unit of work

An issue is **rejected** if any of the following are true:

- It touches any protected path
- It proposes changing `WEBHOOK_RATE_LIMIT_PER_HOUR` from `1000`
- It proposes changing Pro pricing from `$29/mo`
- It proposes allowing negative balances
- It proposes UPDATE or DELETE on `point_transactions`
- It proposes using cookies, localStorage, or sessionStorage in widget code
- It breaks or removes idempotency keys from redemption flow
- It is ambiguous about what "done" looks like

**Default posture: reject.** If uncertain, close with a clarification request.

## Implementation Rules

Agents implementing accepted issues must never:

1. Modify any file under `api/src/auth/`, `api/src/webhooks/hmac.service.ts`, `api/src/points/ledger.service.ts`, or `api/src/rewards/redemption.service.ts`
2. Write SQL with string interpolation — all queries must use parameterized statements
3. Write UPDATE or DELETE statements targeting `point_transactions`
4. Allow a member's effective balance to go below 0 — always check before INSERT
5. Remove or weaken HMAC-SHA256 verification on incoming webhooks
6. Use `===` string comparison for HMAC values — must use `crypto.timingSafeEqual`
7. Remove `idempotency_key` from reward redemption DTOs or database schema
8. Use `document.cookie`, `localStorage`, or `sessionStorage` in widget source files under `widgets/`
9. Raise `WEBHOOK_RATE_LIMIT_PER_HOUR` above `1000` in any config or code
10. Call the Anthropic API from any frontend (`web/`) code

## Quality Gates

A PR passes validation only if ALL gates are green:

- [ ] `pnpm lint` exits 0
- [ ] `cd api && pnpm type-check` exits 0
- [ ] `cd web && pnpm type-check` exits 0
- [ ] `cd api && pnpm test` all tests pass
- [ ] `cd web && pnpm test` all tests pass
- [ ] No modified files under `api/src/auth/`, `api/src/webhooks/hmac.service.ts`, `api/src/points/ledger.service.ts`, `api/src/rewards/redemption.service.ts`
- [ ] No SQL string interpolation
- [ ] No UPDATE or DELETE on `point_transactions` table
- [ ] No code path that permits negative balance INSERT
- [ ] No `===` comparison of HMAC values (must use `timingSafeEqual`)
- [ ] No `cookie`, `localStorage`, or `sessionStorage` in `widgets/` source
- [ ] `WEBHOOK_RATE_LIMIT_PER_HOUR` value unchanged
- [ ] New features include at least one unit test covering happy path and one error case

## Auto-Reject Triggers

The validate workflow must immediately reject a PR and apply `factory:needs-human` if any of the following are detected in the diff:

- Any diff in `api/src/auth/**`, `api/src/webhooks/hmac.service.ts`, `api/src/points/ledger.service.ts`, or `api/src/rewards/redemption.service.ts`
- Any SQL UPDATE or DELETE on `point_transactions`
- Any SQL statement using template literals or string concatenation
- Any HMAC comparison using `===` instead of `timingSafeEqual`
- Any code path that allows negative balance INSERT
- Any `cookie`, `localStorage`, or `sessionStorage` reference in `widgets/`
- Any removal of `idempotency_key` from redemption schema or DTO
- Any change to `WEBHOOK_RATE_LIMIT_PER_HOUR` value in config files
- Any call to `anthropic` SDK from `web/` source files

## Escalation

- After **2 failed fix attempts** on the same PR, apply `factory:needs-human` and stop
- Any issue touching webhook security, HMAC verification, or ledger integrity must apply `factory:needs-human` at triage if scope is unclear
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
- `api/src/webhooks/hmac.service.ts`
- `api/src/points/ledger.service.ts`
- `api/src/rewards/redemption.service.ts`
- `.env` (any environment file containing secrets)
