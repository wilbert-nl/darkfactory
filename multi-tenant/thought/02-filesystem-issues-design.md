# Thought: Filesystem Issues Design

Date: 2026-04-23

## Why Filesystem Instead of GitHub

User explicitly asked for filesystem-based issue tracking. This means:
- No `gh` CLI commands in workflows
- No GitHub API calls
- State tracked by which directory an issue file lives in
- Atomic state transitions = `mv` commands

## Directory = State Design

```
issues/
├── untriaged/    ← new issues, not yet processed
├── accepted/     ← triage approved, ready to implement
├── rejected/     ← triage rejected, archived
├── in-progress/  ← implementation underway
├── review/       ← implementation done, validating
├── done/         ← validated + complete
└── needs-human/  ← factory stopped, human required
```

State machine:
```
untriaged → accepted (triage pass)
untriaged → rejected (triage fail)
untriaged → needs-human (triage ambiguous)
accepted → in-progress (implement starts)
in-progress → review (implement done)
review → done (validate pass)
review → in-progress (validate fail, attempts ≤ 2)
review → needs-human (validate fail, attempts > 2)
in-progress → needs-human (implement fail, attempts > 2)
```

## Issue File Format

YAML frontmatter + markdown body:

```markdown
---
id: "001"
title: "Short task title"
phase: "P1"
task_id: "P1-T1"
priority: "high"
estimated_hours: 2
status: "untriaged"
created_at: "2026-04-23"
attempts: 0
last_attempt: null
failure_notes: null
---

## Description
...

## Acceptance Criteria
- [ ] item 1
- [ ] item 2

## Context
...
```

The `attempts` counter is incremented on each fix attempt. When it hits 3, the issue moves to `needs-human/`.

`failure_notes` is appended by the validate workflow when a validation fails, so the fix workflow knows what to address.

## Naming Convention

Files named: `{zero-padded-id}-{kebab-title}.md`

Examples:
- `001-setup-postgresql-docker.md`
- `002-initialize-nestjs-prisma.md`
- `023-implement-jwt-auth-guard.md`

ID is globally unique and never reused. The ID sequence is determined by the highest existing ID across all state directories.

## Workflow Bash Patterns

**Find next work item:**
```bash
ls issues/accepted/ | head -1
```

**Move issue to next state:**
```bash
mv issues/accepted/001-setup-postgresql-docker.md issues/in-progress/
```

**Update frontmatter (attempts):**
```bash
sed -i 's/^attempts: 0/attempts: 1/' issues/in-progress/001-setup-postgresql-docker.md
```

**Read issue content:**
```bash
cat issues/in-progress/001-setup-postgresql-docker.md
```

**Count untriaged:**
```bash
ls issues/untriaged/ | wc -l
```

## Seeded Issues

I seeded Phase 1 and Phase 2 tasks as initial untriaged issues (P1-T1 through P2-T10). These represent the first 18 tasks from the architecture doc. Later phases can be filed as issues progress.

## Human Interface

Humans add new issues by dropping a markdown file into `issues/untriaged/`. The `scripts/issue-new.sh` script handles proper frontmatter formatting and ID assignment.

```bash
./scripts/issue-new.sh "Add product image upload" "Products need image upload support. Acceptance: file upload endpoint, S3 storage, URL stored in product.imageUrl"
```
