# Dark Factory: Setup Guide from Scratch

> Based on: [dark-factory-experiment](https://github.com/coleam00/dark-factory-experiment) + [Archon](https://github.com/coleam00/Archon)

---

## What You Actually Need (The Governance Documents)

You do NOT need just a PRD or FSD. You need **three interlocking governance files** that the AI agents read before every action:

| File | What It Is | Equivalent To |
|------|-----------|---------------|
| `MISSION.md` | Scope boundary — what to build, what's forbidden | PRD (product scope) |
| `CLAUDE.md` | Code standards, stack, file layout, conventions | FSD + Tech Spec |
| `FACTORY_RULES.md` | Process safety, triage rules, quality gates | Operational runbook |

All three are required. The meta-rule is: **if no rule covers a situation, err on safety**.

---

## Step 1 — Install Archon

```bash
# Quick install (CLI only)
curl -fsSL https://archon.sh/install.sh | sh
# or
brew install coleam00/tap/archon

# OR full setup from source
git clone https://github.com/coleam00/Archon.git
cd Archon
bun install
bun run dev   # Web UI on :5173, API on :3090
```

Archon auto-uses SQLite (`~/.archon/archon.db`) if no `DATABASE_URL` is set. Good for local start.

---

## Step 2 — Initialize Your Repo Structure

```
your-project/
├── MISSION.md            ← what to build (scope + forbidden list)
├── FACTORY_RULES.md      ← process rules, quality gates, triage logic
├── CLAUDE.md             ← code conventions, stack, file layout
├── .archon/
│   ├── config.yaml       ← git branch config
│   ├── workflows/        ← YAML workflow definitions
│   └── commands/         ← custom agent prompt files (.md)
├── .github/
│   └── workflows/        ← cron to trigger Archon orchestrator
└── app/                  ← your actual application code
```

`.archon/config.yaml` (minimal):
```yaml
worktree:
  baseBranch: main
```

---

## Step 3 — Write MISSION.md

Answer these questions in your MISSION.md:

```markdown
# Mission

## What This Builds
[One paragraph: what the app does for users]

## Primary Users
[Who uses it, what problem it solves]

## In Scope (Factory Can Build)
- Feature A
- Feature B
- Bug fixes, tests, docs

## Out of Scope (Never Build)
- X integration
- Y feature
- Mobile app

## Immutable Constraints (Cannot Change, Ever)
- [e.g., auth required on all endpoints]
- [e.g., 25 msg/user/day rate limit — hardcoded, non-configurable]
- [e.g., single-tenant only]
```

**Key insight:** The "forbidden" list is just as important as the "in scope" list. Agents need hard stops.

---

## Step 4 — Write CLAUDE.md

This is your **tech spec for the AI**. Include:

```markdown
# CLAUDE.md

## Stack
[Every technology, version, and package manager — be exact]

## Repo Layout
[Directory tree with where every type of file belongs]

## Running the App
[Exact commands to start backend and frontend]

## Testing
[Exact commands, frameworks, rules about mocking]

## Lint / Format / Type Check
[Exact commands for each]

## Code Conventions
[Per-language rules: async/sync, imports, error handling, SQL rules, etc.]

## Database Rules
[ORM or raw SQL? Where do queries live? Placeholder syntax?]

## Environment Variables
[Table of all vars, required/optional, purpose]

## Deployment
[How code gets to prod — DO NOT let agents touch prod secrets]

## Protected Paths (Auto-Reject if Touched)
[List files/dirs agents must never modify: auth/, rate_limit.py, .env, etc.]

## Known Footguns
[Quirks and traps agents should know about]

## Commit & PR Conventions
[Format, required body fields, one issue per PR rule]
```

---

## Step 5 — Write FACTORY_RULES.md

This is your **process constitution**. Include:

```markdown
# Factory Rules

## Governance Hierarchy
MISSION.md > CLAUDE.md > FACTORY_RULES.md. If not covered, err on safety.

## Triage Rules
- Batch size per run: N issues
- Accept criteria: [list]
- Reject criteria: [list, bias toward reject on ambiguity]
- Escalate to human when: [auth changes, schema changes, security-sensitive]
- Flood protection: [e.g., 3 issues/user/day]

## Implementation Rules (Absolute Prohibitions)
1. Never modify tests to pass — fix source code
2. Never touch protected files
3. Never add dependencies without justification
4. Never skip full validation suite
5. Never implement beyond the linked issue scope
6. Never commit secrets

## Quality Gates (ALL must pass for auto-merge)
- [ ] Static checks pass
- [ ] Unit + integration tests pass
- [ ] E2E regression passes
- [ ] Security check passes
- [ ] Code review: no critical/high findings
- [ ] Protected files untouched
- [ ] PR size ≤ 500 lines
- [ ] Fix attempts ≤ 2
- [ ] PR links to originating issue

## Auto-Reject Triggers
[List: protected file modified, security finding, scope mismatch, etc.]

## Escalation (factory:needs-human label)
[When agents must stop and wait for human]

## Throughput Controls
- Max parallel workflows: 4
- Max fix attempts per PR: 2
- Orchestrator priority: Fix-PR → Validate → Implement → Triage

## Separation of Concerns
Validators read ONLY: issue body, PR diff, test output, governance files.
They cannot read implementation plans or prior agent comments. (Prevents gaming tests.)

## Protected Files
[List exactly which files agents can never modify]
```

---

## Step 6 — Write Archon Workflows

Workflows live in `.archon/workflows/*.yaml`. The issue state machine needs at minimum:

### Required Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `orchestrator.yaml` | Cron (every 4–6h) | Routes work: fix → validate → implement → triage |
| `triage.yaml` | Called by orchestrator | Labels issues accept/reject/needs-human |
| `implement.yaml` | Called by orchestrator | Writes code, opens PR |
| `validate.yaml` | Called by orchestrator | Runs tests, checks quality gates |
| `fix-pr.yaml` | Called by orchestrator | Fixes failing PRs |

### Minimal Workflow YAML Structure

```yaml
name: my-workflow
description: What this does and when to use it

provider: claude      # or minimax
model: sonnet

nodes:
  # Bash node (deterministic, no AI)
  - id: fetch-context
    bash: |
      set -euo pipefail
      gh issue list --label "factory:untriaged" --json number,title,body > issues.json
      cat issues.json
    timeout: 60000

  # AI node referencing upstream output
  - id: classify
    command: my-triage-classify      # → .archon/commands/my-triage-classify.md
    depends_on: [fetch-context]
    model: sonnet
    allowed_tools: [Write]
    output_format:
      type: object
      properties:
        decision:
          type: string
          enum: ["accept", "reject", "needs-human"]
        reason:
          type: string
      required: [decision, reason]

  # Conditional branch
  - id: apply-accept
    bash: |
      gh issue edit $ISSUE_NUM --add-label "factory:accepted"
    depends_on: [classify]
    when: "$classify.output.decision == 'accept'"
    timeout: 30000

  - id: apply-reject
    bash: |
      gh issue edit $ISSUE_NUM --add-label "factory:rejected"
    depends_on: [classify]
    when: "$classify.output.decision == 'reject'"
    timeout: 30000
```

### Workflow Node Fields Reference

| Field | Required | Purpose |
|-------|----------|---------|
| `id` | YES | Step identifier |
| `prompt` | ONE OF | Inline AI prompt |
| `bash` | ONE OF | Inline shell script |
| `command` | ONE OF | Reference to `.archon/commands/*.md` file |
| `depends_on` | NO | Array of upstream IDs to wait for |
| `allowed_tools` | NO | Tools AI can use (e.g., `[Write, Bash]`) |
| `timeout` | NO | Max runtime (ms) |
| `when` | NO | Conditional: `"$node-id.output.field == 'value'"` |
| `context` | NO | `fresh` = omit conversation history |
| `output_format` | NO | JSON Schema for structured output validation |
| `model` | NO | Override workflow-level model for this node |
| `maxBudgetUsd` | NO | Token budget cap for this node |

### Command Files (`.archon/commands/*.md`)

These are markdown files containing the AI agent's prompt instructions.

```markdown
<!-- .archon/commands/my-triage-classify.md -->
You are a triage agent for the Dark Factory.

Read the issues from the previous step's output.
For each issue, decide: accept, reject, or needs-human.

Rules (from FACTORY_RULES.md):
- Bias toward reject. If ambiguous, reject and request clarification.
- Accept only: clear bug with repro steps, aligned feature, test additions.
- Reject: vague, out of scope, spam.
- Escalate: auth changes, schema changes, security concerns.

Output a JSON object with `decision` and `reason`.
```

---

## Step 7 — GitHub Issue State Machine (Labels)

Create these labels in your repo:

```
factory:untriaged    → new issue, not yet processed
factory:accepted     → triage approved, ready for implementation
factory:rejected     → triage rejected, issue closed
factory:needs-human  → factory stopped, human required
factory:in-progress  → implementation underway
factory:review       → PR open, validating
```

---

## Step 8 — Cron Trigger (GitHub Actions)

```yaml
# .github/workflows/factory-orchestrator.yml
name: Factory Orchestrator

on:
  schedule:
    - cron: '0 */6 * * *'   # every 6 hours
  workflow_dispatch:         # manual trigger

jobs:
  orchestrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Archon Orchestrator
        run: archon workflow run orchestrator
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

---

## Summary: Minimum Viable Dark Factory

```
Day 1: Write MISSION.md (scope + forbidden list)
Day 2: Write CLAUDE.md (stack + file layout + conventions)
Day 3: Write FACTORY_RULES.md (triage rules + quality gates)
Day 4: Create 4 workflow YAMLs (orchestrator, triage, implement, validate)
Day 5: Set up GitHub labels + Actions cron
Day 6: File first issue. Let the factory run.
```

**You do NOT need a traditional FSD.** The combination of MISSION.md + CLAUDE.md replaces it. The FSD-equivalent lives split across:
- MISSION.md → product requirements, scope, constraints
- CLAUDE.md → technical specification, architecture decisions
- FACTORY_RULES.md → process requirements, quality gates

The more precise and opinionated these three files are, the better the factory performs.

---

## Key Gotchas

1. **Governance files must be human-only** — agents cannot modify MISSION.md, FACTORY_RULES.md, or CLAUDE.md
2. **Validators must be isolated** — they read only the PR diff + test output, never the implementation plan
3. **Bias toward reject in triage** — ambiguous = close and request clarification, never accept and guess
4. **Max 2 fix attempts per PR** — after 2 failures, escalate to human; never infinite loops
5. **Budget caps are required** — set `maxBudgetUsd` on AI nodes; runaway agents are expensive
6. **Protected files list must be explicit** — every auth, rate-limit, secret, and infra file listed
