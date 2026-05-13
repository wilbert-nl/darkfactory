# FACTORY_RULES.md — land-match

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
2. It does not touch any protected path (`api/src/auth/`, `api/src/verification/`, `api/src/documents/`)
3. It does not introduce automated document verification or automated verified badge assignment
4. It does not add, change, or remove pricing values (Pro Seller $19.99, Pro Buyer $9.99)
5. It does not introduce property valuation, price suggestion, or AVM of any kind
6. It does not change GPS coordinate precision requirements (must remain ≥6 decimal places)
7. It does not change document encryption behavior
8. It has a clear, testable acceptance criterion in the issue body
9. It is a single, atomic unit of work — not a multi-feature epic

An issue is **rejected** if any of the following are true:

- It touches `api/src/auth/`, `api/src/verification/`, or `api/src/documents/` for any reason
- It proposes automating the verified badge
- It proposes automated valuation, price estimation, or AVM
- It changes Pro Seller or Pro Buyer pricing
- It proposes GPS precision < 6 decimal places
- It proposes removing document encryption
- It is ambiguous about what "done" looks like
- It requires changes to multiple unrelated systems simultaneously

**Default posture: reject.** If uncertain, close the issue with a request for clarification.

## Implementation Rules

Agents implementing accepted issues must never:

1. Modify any file under `api/src/auth/`, `api/src/verification/`, or `api/src/documents/`
2. Write SQL with string interpolation — all queries must use parameterized statements
3. Store GPS coordinates with fewer than 6 decimal places or as integers
4. Store GeoJSON boundary data in any format other than a JSON string validated before INSERT
5. Allow listing price of 0 or negative — validation must throw before database write
6. Set `verified = true` on any listing without a human reviewer action in the call chain
7. Store uploaded documents as plaintext — encryption via `DOCUMENT_ENCRYPTION_KEY` is mandatory
8. Hard-code or change Pro Seller ($19.99) or Pro Buyer ($9.99) pricing values
9. Introduce WebSocket connections — async messaging uses polling or SSE only in MVP
10. Call the Anthropic API from any frontend (web/) code

## Quality Gates

A PR passes validation only if ALL gates are green:

- [ ] `pnpm lint` exits 0
- [ ] `cd api && pnpm type-check` exits 0
- [ ] `cd web && pnpm type-check` exits 0
- [ ] `cd api && pnpm test` all tests pass
- [ ] `cd web && pnpm test` all tests pass
- [ ] No new files added under `api/src/auth/`, `api/src/verification/`, or `api/src/documents/`
- [ ] No modified files under `api/src/auth/`, `api/src/verification/`, or `api/src/documents/`
- [ ] No SQL string interpolation (grep: `WHERE.*\$\{` or template literals in `.prepare(`)
- [ ] No listing price validation removed or loosened
- [ ] No `verified` field set to `true` in any service or migration without reviewer role check
- [ ] New features include at least one unit test covering the happy path and one covering an error case

## Auto-Reject Triggers

The validate workflow must immediately reject a PR (add `factory:needs-human` label, close PR) if any of the following are detected in the diff:

- Any diff in `api/src/auth/**`, `api/src/verification/**`, or `api/src/documents/**`
- Any SQL statement using template literals or string concatenation
- Any code path that sets `verified = true` without checking `user.role === 'reviewer'` or equivalent
- Any code that skips document encryption before file write
- Any hardcoded price value other than `1999` cents for Pro Seller or `999` cents for Pro Buyer
- Any GPS coordinate stored as INTEGER or with fewer than 6 decimal places
- Any call to `anthropic` SDK or Claude API from `web/` source files
- Removal of `listingPrice >= 1` validation

## Escalation

- After **2 failed fix attempts** on the same PR, apply `factory:needs-human` and stop
- If triage is uncertain on any compliance or legal boundary (valuation, document law), apply `factory:needs-human` immediately
- Human must resolve `factory:needs-human` issues — agents must not retry them automatically

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
- `api/src/verification/**`
- `api/src/documents/**`
- `.env` (any environment file containing secrets)
