# Dark Factory Research

> Sources: [dark-factory-experiment](https://github.com/coleam00/dark-factory-experiment) · [Archon](https://github.com/coleam00/Archon) · [YouTube](https://www.youtube.com/watch?v=6woc6ii-zoE)

---

## What Is a Dark Factory?

A "dark factory" borrows from autonomous manufacturing — robots operating in the dark with no humans on the floor. Applied to software: **specs go in, deployable code comes out**, with AI agents handling everything in between.

Humans only:
1. File GitHub issues (specs/features/bugs)
2. Promote releases

AI agents handle: triage → implementation → code review → testing → merge

---

## Architecture: Three Layers

### 1. Archon (Orchestration Layer)
- Open-source YAML workflow engine for AI coding agents
- Makes AI-assisted dev **deterministic and repeatable**
- Workflows live in `.archon/workflows/` and define the full pipeline
- Ships 17 built-in workflows: `archon-fix-github-issue`, `archon-idea-to-pr`, `archon-comprehensive-pr-review`, etc.
- Runs on a **cron schedule** (every 4–6 hours)
- Supports: CLI, Web UI, Slack, Telegram, Discord, GitHub webhooks

### 2. Claude Code (Coding Agent Layer)
- Executes Archon workflow directives
- Tools: file editing, bash execution, GitHub CLI
- Acts as the "hands" — writes, tests, commits, PRs

### 3. MiniMax M2.7 (Model Layer)
- The reasoning model powering the agents
- Chosen for **cost-effectiveness at high throughput**
- Avoids rate-limit constraints that would bottleneck Claude-only setups

---

## Issue State Machine

GitHub issues flow through labeled stages:

```
untriaged → accepted | rejected → in-progress → PR review → auto-merge | human escalation
```

- Triage verdicts are **accept or reject only** (no partial decisions)
- Governance documents stay **human-controlled** (AI cannot modify them)
- Sequential execution — no parallel chaos

---

## The App Being Built

The factory builds itself a **dark-mode chat app** for discussing YouTube video content:

| Layer | Stack |
|-------|-------|
| Frontend | React + Vite + TypeScript + Tailwind |
| Backend | Python FastAPI |
| Database | PostgreSQL + pgvector |
| Retrieval | Hybrid: full-text + semantic similarity |
| LLM | Claude via OpenRouter (streaming) |

---

## Safeguards

- Budget caps per workflow run
- Rate limiting between agent dispatches
- Governance file protection (FACTORY_RULES.md, MISSION.md are locked)
- Validators operate independently from implementers
- No force-pushes; all changes go through PR review

---

## Key Files in the Repo

| File | Purpose |
|------|---------|
| `CLAUDE.md` (32.7 KB) | Full agent behavior instructions |
| `FACTORY_RULES.md` (20.2 KB) | Operational rules for the factory |
| `MISSION.md` (8.2 KB) | What the factory is building and why |
| `.archon/` | Workflow definitions |
| `.github/` | Automation triggers |
| `progress.json` | Current factory state |

---

## Archon Setup

```bash
# Quick install (30 seconds)
curl -fsSL https://archon.sh/install.sh | sh
# or
brew install coleam00/tap/archon

# Full setup (5 minutes — guided wizard)
archon setup
```

Archon uses isolated **git worktrees** per workflow run to prevent state contamination.

---

## How to Replicate This Pattern

1. **Fork** `dark-factory-experiment` as your app skeleton
2. **Install Archon** and configure credentials (GitHub token, model API keys)
3. **Define workflows** in `.archon/workflows/` for your dev lifecycle
4. **Write FACTORY_RULES.md** — the constitution the AI must follow
5. **Set up cron** (GitHub Actions or external) to trigger Archon on schedule
6. **File issues**, not PRs — let the factory ship

---

## Key Insight

> The factory is not about replacing devs — it's about **removing yourself as the bottleneck** for well-scoped, repeatable work. You become the architect and issue-filer; agents become the implementers.
