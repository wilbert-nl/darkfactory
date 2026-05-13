# Dark Factory Scout — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A scheduled Claude Code agent that scouts GitHub Trending daily, scores candidates, invents a concept twist, and writes a structured spec file to `plans/scout/`.

**Architecture:** A single agent prompt file (`.claude/commands/scout-agent.md`) defines the full scouting logic. Two schedules run it — a burst schedule every 3 hours until 2026-05-14 20:00, and a daily recurring schedule after that. All output lands in `plans/scout/` with deduplication via `registry.json`.

**Tech Stack:** Claude Code scheduled agents, WebSearch/WebFetch, plain JSON + Markdown files.

---

## Task 1: Initialize Scout Output Directory

**Files:**
- Create: `plans/scout/registry.json`

- [ ] **Step 1: Create the scout output directory**

```bash
mkdir -p /Users/wilbertverayin/projects/darkfactory/plans/scout
```

- [ ] **Step 2: Create the initial registry.json**

Write the following to `/Users/wilbertverayin/projects/darkfactory/plans/scout/registry.json`:

```json
{
  "scouted": [],
  "built": []
}
```

- [ ] **Step 3: Verify**

```bash
cat /Users/wilbertverayin/projects/darkfactory/plans/scout/registry.json
```

Expected output:
```json
{
  "scouted": [],
  "built": []
}
```

- [ ] **Step 4: Commit**

```bash
cd /Users/wilbertverayin/projects/darkfactory
git add plans/scout/registry.json
git commit -m "chore: initialize scout registry"
```

---

## Task 2: Write the Scout Agent Prompt

**Files:**
- Create: `.claude/commands/scout-agent.md`

This is the full prompt the scheduled agent executes on every run. It must be self-contained — the agent has no conversation history.

- [ ] **Step 1: Create the commands directory**

```bash
mkdir -p /Users/wilbertverayin/projects/darkfactory/.claude/commands
```

- [ ] **Step 2: Write the scout agent prompt**

Write the following to `/Users/wilbertverayin/projects/darkfactory/.claude/commands/scout-agent.md`:

````markdown
# Dark Factory Scout Agent

You are the Dark Factory Scout. Your job is to find one portfolio-worthy project on GitHub Trending, invent a concept twist on it, and write a spec file.

Run this entire process end-to-end without asking for input. Decide everything yourself.

---

## Step 1 — Load the registry

Read `/Users/wilbertverayin/projects/darkfactory/plans/scout/registry.json`.

Extract:
- `scouted`: list of repo slugs already processed (format: `owner-repo`)
- `built`: list of project slugs already built

Also list all existing directories under `/Users/wilbertverayin/projects/darkfactory/` — these are projects already built and must not be duplicated.

---

## Step 2 — Fetch GitHub Trending

Use WebSearch with query: `site:github.com/trending` OR fetch `https://github.com/trending` directly.

Collect at least 15 trending repos. For each, note:
- owner/repo slug
- description
- primary language
- approximate star count or trending rank

---

## Step 3 — Score each candidate

Skip any repo whose slug (formatted as `owner-repo`) is already in the `scouted` list from registry.json.

For remaining repos, apply the auto-reject filter first:

**AUTO-REJECT if any of these are true:**
- Core functionality requires a paid API (OpenAI, Stripe, Twilio, Google Maps paid tier, etc.)
- It's an AI project that requires a paid model API (Ollama/local models are fine)
- It relies on a paywalled third-party service as a core dependency
- It's too complex for a solo developer to understand in one sitting

Then score remaining candidates (1 point each):

| # | Criterion | Pass condition |
|---|-----------|----------------|
| 1 | Systems-level thinking | Involves concurrency, networking, performance, or infra |
| 2 | Real-world utility | Solves a problem people actually have |
| 3 | Community traction | >100 stars OR trending rank top 25 |
| 4 | Fills portfolio gap | No existing darkfactory project covers this domain |
| 5 | Buildable solo | Completable in 1–2 weeks by one developer |

Minimum to proceed: **4/5**. Skip anything below.

Pick the **highest scoring** candidate. If tied, prefer simpler (fewer dependencies).

If no candidate passes, write a single line to `/Users/wilbertverayin/projects/darkfactory/plans/scout/no-candidate-YYYY-MM-DD.txt` with content: `No viable candidate found on this run.` Then stop.

---

## Step 4 — Invent a twist

For the chosen project, invent a concept twist using one of these strategies:

- **Change target user** — same core problem, different audience (e.g., task manager for devs → task manager for nurses)
- **Change distribution model** — centralized → P2P, B2C → B2B, subscription → one-time
- **Change domain** — apply the same mechanics to a completely different field
- **Combine concepts** — merge this project's core mechanic with an unrelated idea

Rules:
- The twist must be meaningfully different — not just a rename
- No paid APIs or paid AI in the twisted version
- Simpler is better — if two twists are equally novel, pick the one with fewer moving parts
- Pick a stack that fits the project type:
  - Web app → NestJS + Vue 3 + PostgreSQL
  - CLI tool → Go or Rust
  - Mobile → Flutter
  - Desktop → Tauri + Vue 3
  - Data/pipeline → Python + SQLite

---

## Step 5 — Write the spec file

Determine today's date. Format the filename as `YYYY-MM-DD-<twist-slug>.md` where `twist-slug` is a kebab-case name for the twisted project (not the original).

Write the spec to `/Users/wilbertverayin/projects/darkfactory/plans/scout/YYYY-MM-DD-<twist-slug>.md`:

```markdown
---
date: YYYY-MM-DD
original_repo: owner/repo
original_url: https://github.com/owner/repo
original_language: <language>
stars: <count or "trending top N">
score: N/5
status: pending
---

## Original: <repo-name>
<One-line description of what it does.>

## Twist: <Twist Project Name>
**Concept:** <What this twisted project does.>
**Target user:** <Who it's for.>
**Core differentiator:** <What makes it different from the original.>
**Suggested stack:** <stack choice and why>

## Portfolio fit
- [x/blank] Systems-level thinking — <reasoning>
- [x/blank] Real-world utility — <reasoning>
- [x/blank] Community traction — <reasoning>
- [x/blank] Fills portfolio gap — <reasoning>
- [x/blank] Buildable solo — <reasoning>

## Auto-reject check
- No paid APIs required: ✅
- No paid AI model required: ✅
- No paywalled dependencies: ✅
- Complexity: simple enough for solo dev ✅
```

---

## Step 6 — Update the registry

Read `/Users/wilbertverayin/projects/darkfactory/plans/scout/registry.json`.

Add the original repo slug (`owner-repo` format) to the `scouted` array.

Write the updated JSON back to the same file.

---

## Step 7 — Done

Output a one-line summary: `Scout complete: <twist-project-name> spec written to plans/scout/YYYY-MM-DD-<slug>.md`
````

- [ ] **Step 3: Verify the file exists**

```bash
ls /Users/wilbertverayin/projects/darkfactory/.claude/commands/scout-agent.md
```

- [ ] **Step 4: Commit**

```bash
cd /Users/wilbertverayin/projects/darkfactory
git add .claude/commands/scout-agent.md
git commit -m "feat: add scout agent prompt"
```

---

## Task 3: Set Up Burst Schedule (Every 3 Hours Until 2026-05-14 20:00)

**No files created** — this uses the `schedule` skill to register a remote scheduled agent.

- [ ] **Step 1: Invoke the schedule skill**

Use the `schedule` skill with the following parameters:
- **Prompt:** Run the scout agent at `/Users/wilbertverayin/projects/darkfactory/.claude/commands/scout-agent.md` — read the file and execute all steps in it.
- **Schedule:** Every 3 hours
- **End:** 2026-05-14 20:00
- **Working directory:** `/Users/wilbertverayin/projects/darkfactory`

- [ ] **Step 2: Confirm the schedule is active**

After the skill registers the schedule, note the schedule ID returned. Verify it appears in the schedule list.

---

## Task 4: Set Up Daily Recurring Schedule

**No files created** — second schedule for ongoing daily runs.

- [ ] **Step 1: Invoke the schedule skill**

Use the `schedule` skill with the following parameters:
- **Prompt:** Run the scout agent at `/Users/wilbertverayin/projects/darkfactory/.claude/commands/scout-agent.md` — read the file and execute all steps in it.
- **Schedule:** Daily at 09:00
- **Start:** 2026-05-15 (day after burst expires)
- **Working directory:** `/Users/wilbertverayin/projects/darkfactory`

- [ ] **Step 2: Confirm the schedule is active**

Verify the daily schedule appears in the schedule list alongside the burst schedule.

---

## Task 5: Smoke Test — Run Scout Once Manually

- [ ] **Step 1: Trigger the scout agent manually**

Read `/Users/wilbertverayin/projects/darkfactory/.claude/commands/scout-agent.md` and execute all steps in it right now.

- [ ] **Step 2: Verify output**

```bash
ls /Users/wilbertverayin/projects/darkfactory/plans/scout/
```

Expected: at least one `.md` spec file and an updated `registry.json`.

- [ ] **Step 3: Verify registry updated**

```bash
cat /Users/wilbertverayin/projects/darkfactory/plans/scout/registry.json
```

Expected: `scouted` array has at least one entry.

- [ ] **Step 4: Spot-check the spec file**

```bash
cat /Users/wilbertverayin/projects/darkfactory/plans/scout/*.md | head -40
```

Verify: frontmatter is valid, twist concept is present, auto-reject check shows all ✅.
