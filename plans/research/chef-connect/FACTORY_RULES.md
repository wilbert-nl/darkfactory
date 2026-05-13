# FACTORY_RULES.md — chef-connect

## Governance Hierarchy

```
MISSION.md  (scope & constraints — human only, never modified by agents)
CLAUDE.md   (tech spec & conventions — human only, never modified by agents)
FACTORY_RULES.md  (process rules — human only, never modified by agents)
  └── GitHub Issues  (agent work queue)
        └── PRs  (agent output, reviewed by validators)
```

## Triage Rules

- **Batch size:** Process up to 5 new issues per orchestrator run.
- **Accept maximum:** 3 issues per run.
- **Default bias:** Reject if ambiguous. Close with a clarification request comment.

### Accept Criteria
- Issue clearly maps to a feature in MISSION.md "In Scope"
- Implementation does not touch protected paths (`api/src/auth/`, `api/src/payments/`, `api/src/delivery/`, `api/src/verification/`)
- Issue does not require changing commission rate, pricing, or verification requirement
- Issue does not remove or conditionalize the food safety disclaimer
- Issue includes enough detail to write an acceptance test

### Reject Criteria
- Requests changes to `api/src/payments/commission.service.ts` or commission rate
- Requests changes to `api/src/payments/` payout logic
- Requests changes to `api/src/delivery/`
- Requests changes to `api/src/verification/`
- Requests allowing unverified chefs to accept orders
- Requests removing the food safety disclaimer
- Requests price changes to Chef Pro
- Out of scope per MISSION.md
- Duplicate of an existing accepted issue

### Escalate Criteria
- Commission rate change is requested (human decision, always)
- Stripe Connect configuration or payout split change is requested
- DoorDash Drive API version upgrade is needed
- Chef verification workflow needs to change
- Security vulnerability reports involving payments or verification
- Ambiguous scope touching protected paths

## Implementation Rules

Agents implementing accepted issues must never:

1. Modify, delete, or move `api/src/payments/commission.service.ts`
2. Modify, delete, or move any file under `api/src/payments/` (payout logic, Stripe Connect config)
3. Modify, delete, or move any file under `api/src/delivery/`
4. Modify, delete, or move any file under `api/src/verification/`
5. Modify, delete, or move any file under `api/src/auth/`
6. Change `COMMISSION_RATE` constant or derive commission anywhere outside `commission.service.ts`
7. Add any condition that allows unverified chefs to accept, receive, or fulfill orders
8. Remove or conditionalize `FoodSafetyDisclaimer.vue` from the layout
9. Expose DoorDash Drive credentials or signing secret to frontend
10. Use `any` TypeScript type

## Quality Gates

Every PR must pass all of the following before merge:

- [ ] `pnpm --filter api lint` exits 0
- [ ] `pnpm --filter app lint` exits 0
- [ ] `pnpm --filter api typecheck` exits 0
- [ ] `pnpm --filter app typecheck` exits 0
- [ ] `pnpm --filter api test` — all existing tests pass
- [ ] `pnpm --filter app test` — all existing tests pass
- [ ] New code has at least one new test
- [ ] No new `any` types introduced
- [ ] No hardcoded secrets or API keys in source
- [ ] `commission.service.ts` not modified (diff check)
- [ ] `api/src/payments/` payout logic not modified (diff check)
- [ ] `verified-chef.guard.ts` not weakened (diff check)
- [ ] `FoodSafetyDisclaimer.vue` still in layout (diff check on `MainLayout.vue`)
- [ ] PR description includes: problem, solution, test plan

## Auto-Reject Triggers

A PR is automatically rejected if it:

- Touches `api/src/payments/commission.service.ts`
- Touches any payout logic in `api/src/payments/`
- Touches any file under `api/src/delivery/` or `api/src/verification/`
- Touches any file under `api/src/auth/`
- Changes `COMMISSION_RATE` or adds commission calculation outside `commission.service.ts`
- Adds a bypass or condition in `verified-chef.guard.ts`
- Removes `FoodSafetyDisclaimer.vue` from layout or hides it conditionally
- Exposes DoorDash Drive or Stripe keys to the frontend
- Changes `STRIPE_PRO_PRICE_ID` or any pricing constant
- Contains hardcoded credentials
- Fails lint or typecheck
- Has no associated test

## Escalation

Label `factory:needs-human` and pause work when:

- 2 consecutive fix attempts on a PR fail quality gates
- Commission rate change is requested (always escalate — never implement)
- Stripe Connect onboarding flow needs changes
- DoorDash Drive API breaks or requires version upgrade
- Chef verification document encryption needs updating
- Security vulnerability found in payments, delivery, or verification paths
- Admin review workflow for chef verification needs redesign

## Throughput Controls

- Max `maxBudgetUsd` per AI triage/implement/validate node: $1.00
- Max 2 fix attempts per PR before escalation
- Orchestrator runs on cron every 6 hours
- DoorDash Drive webhook handler must always be active — do not disable in any environment config

## Separation of Concerns

- **Triage agent:** reads issue text + MISSION.md + FACTORY_RULES.md only.
- **Implement agent:** reads issue + CLAUDE.md + source files. Never reads triage rationale.
- **Validate agent:** reads PR diff + test output only. Never reads the implementation plan.
- **Fix agent:** reads validator feedback + failing test output only.

## Protected Files

```
MISSION.md
CLAUDE.md
FACTORY_RULES.md
api/src/auth/**
api/src/payments/**
api/src/payments/commission.service.ts
api/src/delivery/**
api/src/verification/**
.env
.env.production
```
