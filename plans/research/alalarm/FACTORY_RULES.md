# Factory Rules — Alalarm

## Governance Hierarchy

MISSION.md > CLAUDE.md > FACTORY_RULES.md

If no rule covers a situation, err on safety. When uncertain, escalate to `factory:needs-human`.

---

## Triage Rules

### Batch Size
- Process **up to 5 untriaged issues** per orchestrator run.

### Accept Criteria (ALL must be true)
- Issue is clearly within MISSION.md scope
- Reproducible bug: has repro steps OR clear feature: has acceptance criteria
- Does not touch protected files
- Does not involve auth, payments, or schema changes (those escalate)
- Estimated diff size ≤ 500 lines
- No security-sensitive surface (permissions, data storage, API keys)

### Reject Criteria (ANY triggers rejection)
- Out of MISSION.md scope
- Vague title or missing description ("it's broken", "make it better")
- Duplicate of an existing open issue
- Requests clinical/medical features
- Requests changes to pricing, free-tier cap, or payment processor
- Feature that requires exposing API keys to the frontend
- Spam or off-topic

### Escalate to Human (factory:needs-human) When
- Auth module changes (api/src/auth/)
- Schema changes (api/prisma/schema.prisma)
- Stripe webhook or subscription logic changes
- Security-related issues (data exposure, injection, auth bypass)
- Issues requesting changes to protected files
- Any feature affecting free-tier enforcement logic
- After 2 failed fix attempts on a PR
- Governance file modifications requested

### Flood Protection
- Max 3 issues accepted per orchestrator run, regardless of batch size

---

## Implementation Rules (Absolute Prohibitions)

1. **Never modify tests to make them pass** — fix the source code
2. **Never touch protected files** (listed in CLAUDE.md Protected Paths)
3. **Never add npm/pnpm dependencies** without explicit justification in the PR body
4. **Never skip the full validation suite** — all lint, type-check, unit, and integration tests must pass
5. **Never implement beyond the linked issue scope** — one issue, one PR
6. **Never commit secrets or API keys** — check `.env` files are gitignored before committing
7. **Never expose ANTHROPIC_API_KEY in frontend code** — all Claude API calls go through the NestJS backend
8. **Never change free-tier alarm cap** without explicit human instruction
9. **Never modify Stripe webhook verification logic** without human review
10. **Never modify Prisma schema** without a corresponding migration file

---

## Quality Gates (ALL must pass for auto-merge)

- [ ] `pnpm lint` passes in both `app/` and `api/`
- [ ] `pnpm type-check` passes in both `app/` and `api/`
- [ ] Unit tests pass (`pnpm test:unit` in app, `pnpm test` in api)
- [ ] Integration tests pass against real test database
- [ ] E2E tests pass (`pnpm test:e2e`)
- [ ] No critical or high severity findings from code review agent
- [ ] Protected files are untouched (diff verified)
- [ ] PR size ≤ 500 lines changed (excluding lockfiles and generated Prisma client)
- [ ] Fix attempts ≤ 2
- [ ] PR body contains `Closes #N` linking to originating issue
- [ ] No `.env` files or secrets in diff

---

## Auto-Reject Triggers (Any Single Trigger Closes the PR)

- Protected file modified
- Secret or API key found in diff
- Security finding (critical or high) from validator
- Scope mismatch: PR implements more than the linked issue
- Tests modified instead of source code
- Free-tier cap changed in code
- Pricing constants changed in code
- New dependency added without justification in PR body
- PR is missing `Closes #N`

---

## Escalation (factory:needs-human label)

Apply `factory:needs-human` and stop processing when:
- Auth, schema, or payment logic is touched
- 2 fix attempts exhausted on any PR
- Validator finds a security issue
- Triage agent cannot classify an issue with confidence ≥ 0.9
- Any protected file would be modified to implement the issue

Human must re-label to `factory:accepted` (or close) to resume.

---

## Throughput Controls

- Max parallel workflows: **3**
- Max fix attempts per PR: **2** (then escalate)
- Orchestrator priority order: **Fix-PR → Validate → Implement → Triage**
- Max issues accepted per run: **3**
- Max budget per AI node: $0.10 USD (set `maxBudgetUsd: 0.10` on all AI nodes)

---

## Separation of Concerns

**Validators** read ONLY:
- The issue body (linked from PR)
- The PR diff
- Test output
- Governance files (MISSION.md, CLAUDE.md, FACTORY_RULES.md)

Validators **cannot** read:
- Implementation plans
- Prior agent comments on the PR
- Internal orchestrator logs

This prevents validators from being influenced by the implementer's framing.

---

## Protected Files (Agents Must Never Modify)

```
MISSION.md
CLAUDE.md
FACTORY_RULES.md
.archon/workflows/orchestrator.yaml
.archon/workflows/triage.yaml
.archon/workflows/implement.yaml
.archon/workflows/validate.yaml
.archon/workflows/fix-pr.yaml
.archon/commands/
.github/workflows/factory-orchestrator.yml
api/src/auth/
api/src/subscriptions/stripe-webhook.controller.ts
api/prisma/schema.prisma
app/src/boot/stripe.ts
.env
.env.local
.env.production
```
