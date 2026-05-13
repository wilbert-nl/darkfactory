# Thought: Archon Workflow Design

Date: 2026-04-23

## The Five Workflows

### 1. orchestrator.yaml
**Purpose:** Main entry point. Dispatched on cron. Decides what work to do.

**Priority order (from FACTORY_RULES.md):**
1. Fix → check `in-progress/` for issues with failure_notes (needs fixing)
2. Validate → check `review/` for issues pending validation
3. Implement → check `accepted/` for approved issues
4. Triage → check `untriaged/` for new issues

**Design:** Pure bash nodes (no AI). Just reads filesystem state and calls appropriate sub-workflow via bash. No AI budget spent on orchestration.

```
orchestrator → [bash: check state] → [bash: invoke correct workflow via archon CLI]
```

### 2. triage.yaml
**Purpose:** Read untriaged issues, classify each, move to correct directory.

**Node structure:**
1. `fetch-untriaged` (bash): list and read untriaged issues
2. `fetch-rules` (bash): read MISSION.md + FACTORY_RULES.md
3. `classify` (AI + command): classify batch of issues
4. `apply-decisions` (bash): move files based on decisions, update frontmatter

**Key design choices:**
- Batch: process up to 5 issues per run (not 10, since filesystem is slower to iterate)
- Output format: JSON array of `{id, filename, decision, reason}`
- Bias toward reject - encoded in the command prompt

### 3. implement.yaml
**Purpose:** Take one accepted issue, implement it using Claude Code tools.

**Node structure:**
1. `pick-issue` (bash): find oldest accepted issue, move to in-progress
2. `read-context` (bash): read issue + MISSION.md + CLAUDE.md
3. `implement` (AI + command): write code using Write/Edit/Bash tools
4. `mark-review` (bash): move issue to review/, record what was done

**Key design choices:**
- Process ONE issue at a time (not parallel, too risky)
- Claude Code's allowed_tools: Write, Edit, Bash, Read
- Implementation agent reads governance docs before writing code
- Records a brief implementation summary in the issue frontmatter

### 4. validate.yaml
**Purpose:** Check a reviewed issue's implementation for quality.

**Node structure:**
1. `pick-review` (bash): find oldest review issue
2. `run-checks` (bash): run lint + typecheck + tests, capture output
3. `ai-review` (AI + command): review code changes + test output
4. `apply-result` (bash): move to done/ or back to in-progress/ with notes

**Key design choices:**
- Validator has `context: fresh` - cannot read implementation agent's reasoning
- Records failure_notes in frontmatter so fix agent knows what to address
- Increments attempts counter; at 3 → needs-human

### 5. fix.yaml
**Purpose:** Fix a failed implementation based on validation notes.

**Node structure:**
1. `pick-failed` (bash): find in-progress issue with failure_notes
2. `read-context` (bash): read issue + failure_notes + CLAUDE.md
3. `fix` (AI + command): fix code based on failure notes
4. `mark-review` (bash): move back to review/

**Key design choices:**
- Fix agent reads failure_notes explicitly
- Cannot see previous implementation agent's reasoning (fresh context)
- After fix, resets to review/ for full re-validation

## Why No GitHub in Workflows

All state transitions use `mv` (atomic on same filesystem). No API calls needed.
Bash scripts replace `gh issue edit --add-label`.

This actually makes the factory more portable - can run without GitHub at all.

## Budget Controls

| Workflow | Max Budget |
|----------|-----------|
| orchestrator | $0 (pure bash) |
| triage (per batch of 5) | $0.50 |
| implement (per issue) | $2.00 |
| validate (per issue) | $0.50 |
| fix (per issue) | $1.50 |

## Cron Design

Without GitHub Actions (filesystem-based), cron runs locally or via a systemd timer / launchd plist on the development machine. The orchestrator.yaml is the entry point.

```bash
# launchd plist or crontab
*/360 * * * * cd /path/to/project && archon workflow run orchestrator
```

Or manually:
```bash
./scripts/factory-run.sh
```
