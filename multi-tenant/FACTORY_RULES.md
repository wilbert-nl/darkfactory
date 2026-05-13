# Factory Rules

## Governance Hierarchy

```
MISSION.md (scope)
    > CLAUDE.md (code standards)
        > FACTORY_RULES.md (process safety)
```

If no rule covers a situation, **err on the side of safety**. Ambiguity = reject + request clarification.

---

## Issue State Machine (Filesystem)

State is determined by which directory an issue file lives in:

```
issues/untriaged/     → new, unclassified
issues/accepted/      → approved for implementation
issues/rejected/      → closed, archived
issues/in-progress/   → being implemented
issues/review/        → implementation done, awaiting validation
issues/done/          → validated, complete
issues/needs-human/   → factory stopped, human required
```

Transitions:
```
untriaged → accepted         (triage: accepted)
untriaged → rejected         (triage: rejected)
untriaged → needs-human      (triage: ambiguous/security)
accepted → in-progress       (implement starts)
in-progress → review         (implement done)
review → done                (validate pass)
review → in-progress         (validate fail, attempts ≤ 2)
review → needs-human         (validate fail, attempts > 2)
in-progress → needs-human    (implement error, attempts > 2)
```

---

## Triage Rules

### Batch Size
- Process up to **5 issues per triage run**

### Accept Criteria
Issue is accepted if it meets ALL of:
- Clearly describes what to build or fix
- Has measurable acceptance criteria (a reader can verify it's done)
- Aligns with an in-scope feature from MISSION.md
- Is specific enough to implement in ≤ 500 lines of changes
- Does not require modifying protected files (unless it's an explicit security issue)
- Does not touch auth, tenant-context, or prisma-tenancy (unless tagged `security`)

### Reject Criteria (any one = reject)
- Vague description ("improve performance", "fix the bug")
- No acceptance criteria
- Out of scope per MISSION.md forbidden list
- Duplicate of an existing in-progress or done issue
- Requires modifying MISSION.md, CLAUDE.md, or FACTORY_RULES.md
- Requires changes to billing/subscriptions (not MVP)
- Asks for a new ORM, new database type, or GraphQL

### Escalate to `needs-human` (any one = escalate)
- Touches auth module (`platform/auth/`)
- Touches tenant isolation (`tenancy/prisma-tenancy/`, `tenancy/tenant-context/`)
- Requests schema migration changes to public schema (tenant registry, users)
- Security vulnerability report
- Requires environment variable changes (new secrets)
- Triage agent is genuinely uncertain (< 70% confidence)
- Infrastructure changes (docker-compose, Dockerfile, CI/CD)

### Bias Rule
**When in doubt, reject.** A closed issue requesting clarification is recoverable. A bad implementation is expensive to undo.

---

## Implementation Rules

### Absolute Prohibitions

1. **Never modify tests to make them pass** — fix the source code, not the test.
2. **Never touch protected files** (see CLAUDE.md Protected Paths) unless the issue explicitly targets them with human approval.
3. **Never add npm dependencies** without justification in the issue or PR body.
4. **Never skip the full validation suite** (`lint + typecheck + tests`).
5. **Never implement beyond the linked issue's scope** — if you discover related problems, file new issues.
6. **Never commit secrets** — no API keys, JWT secrets, passwords, or connection strings in code.
7. **Never instantiate PrismaClient directly** — always use `PrismaTenancyService`.
8. **Never access `process.env` directly** — use the config service.

### Implementation Scope
- Read the issue's acceptance criteria before writing any code
- Read MISSION.md to confirm the feature is in scope
- Read CLAUDE.md for file placement and conventions
- Write only what the issue asks for — no bonus refactors, no extra features
- Add tests for every new service method and API endpoint

---

## Quality Gates (ALL must pass for promotion to `done`)

- [ ] `npm run lint` passes (no ESLint errors)
- [ ] `npm run typecheck` passes (no TypeScript errors)
- [ ] `npm run test` passes (all unit tests green)
- [ ] All acceptance criteria from the issue are demonstrably met
- [ ] No protected files modified (unless issue explicitly authorized)
- [ ] PR size ≤ 500 lines (excluding `package-lock.json`, generated files)
- [ ] No new `TODO` comments without a linked issue number
- [ ] Issue `attempts` counter ≤ 2 (third failure = needs-human)
- [ ] No hardcoded secrets, env vars, or connection strings
- [ ] `PrismaTenancyService` used for all tenant DB access (grep check)

---

## Validation: Separator of Concerns

The validate workflow operates with `context: fresh`. It reads ONLY:
- The issue file (description + acceptance criteria)
- The code diff (what changed)
- Test output (`npm run lint`, `npm run typecheck`, `npm run test`)
- CLAUDE.md conventions

It **cannot** read:
- The implement agent's reasoning or plan
- Previous workflow run artifacts
- Conversation history

This prevents agents from gaming their own tests.

---

## Auto-Reject Triggers (Immediate Rejection, No Fix Attempts)

Any PR or implementation that:
- Modifies a protected file (list in CLAUDE.md)
- Contains hardcoded secrets or credentials
- Disables or bypasses a guard or authentication check
- Changes the tenant isolation mechanism
- Adds a new ORM or database driver
- Implements out-of-scope features from MISSION.md forbidden list
- Has TypeScript errors (`tsc --noEmit` fails)
- Removes existing test coverage

Auto-rejection moves the issue back to `untriaged` for human re-triage with a failure note.

---

## Escalation — Factory Stops, Human Required

Move issue to `needs-human/` when:
- Validate fails for the **3rd time** on the same issue
- Implementation agent encounters an unresolvable blocker
- Triage confidence is low on a security-sensitive issue
- A protected file modification is required
- A new external service integration is needed (new API key required)

Issues in `needs-human/` are **paused** — factory does not retry them automatically. Human must either:
- Close the issue (add to `rejected/`)
- Fix the problem and move back to `accepted/`
- Handle the escalated concern directly

---

## Throughput Controls

| Control | Value |
|---------|-------|
| Triage batch size | 5 issues per run |
| Max parallel implementations | 1 (sequential only) |
| Max fix attempts per issue | 2 (3rd failure = needs-human) |
| Max PR size | 500 lines |
| Orchestrator priority | Fix → Validate → Implement → Triage |

---

## Issue File Format

Every issue file must have this frontmatter:

```markdown
---
id: "NNN"
title: "Short task title"
phase: "P1"
task_id: "P1-T1"
priority: "high|medium|low"
estimated_hours: N
status: "untriaged|accepted|rejected|in-progress|review|done|needs-human"
created_at: "YYYY-MM-DD"
attempts: 0
last_attempt: null
failure_notes: null
---

## Description
[What needs to be done]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Context
[Why this matters, relevant architecture notes]
```

Frontmatter is updated by factory workflows. Humans should not manually edit frontmatter unless moving from `needs-human` back to `accepted`.

---

## Communication Standards

When factory workflows add notes to issue files:
- Be concise and cite which rule or check failed
- Be neutral and forward-looking (no blame, no apologies)
- Be specific: "ESLint rule `no-explicit-any` violated in `products.service.ts:42`" not "linting failed"
- Identify the workflow: prefix notes with `[triage]`, `[implement]`, `[validate]`, `[fix]`

---

## File Amendment Process

FACTORY_RULES.md is human-controlled only. Factory workflows cannot modify it. New rules take effect on the next orchestrator run without restart.

To amend: commit directly to this file as a human. Factory reads it fresh on each run.

---

*This document is human-controlled. Factory agents cannot modify it.*
