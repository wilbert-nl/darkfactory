# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Directory Is

`plans/` is a scratch workspace for brainstorming and planning new SaaS app ideas that could be built using the **Dark Factory** pattern — an autonomous AI-driven development pipeline.

`ideas.md` is the raw ideas backlog. Ideas progress to dedicated project directories under `~/projects/darkfactory/` once selected.

## Dark Factory Pattern (Context)

The Dark Factory is an AI-agent pipeline where:

1. Humans file GitHub issues and promote releases
2. Archon workflows (orchestrator → triage → implement → validate → fix) handle everything else
3. Three governance files control agent behavior: `MISSION.md` (scope), `CLAUDE.md` (tech spec), `FACTORY_RULES.md` (process rules)

The setup guide lives at `/Users/wilbertverayin/projects/darkfactory/DARKFACTORY-SETUP-GUIDE.md`.

## Starting a New Project from an Idea

To spin up a Dark Factory project from an idea in `ideas.md`:

1. Create `~/projects/darkfactory/<project-slug>/`
2. Write the three governance files (see setup guide for templates):
   - `MISSION.md` — scope, forbidden list, immutable constraints
   - `CLAUDE.md` — stack, file layout, conventions, protected paths, env vars
   - `FACTORY_RULES.md` — triage rules, quality gates, auto-reject triggers
3. Initialize `.archon/workflows/` with 5 core workflows: `orchestrator`, `triage`, `implement`, `validate`, `fix-pr`
4. Create GitHub issue labels: `factory:untriaged`, `factory:accepted`, `factory:rejected`, `factory:needs-human`, `factory:in-progress`, `factory:review`
5. Set up `.github/workflows/factory-orchestrator.yml` (cron every 6h)

## Governance Rules (From Setup Guide)

- Governance files (`MISSION.md`, `CLAUDE.md`, `FACTORY_RULES.md`) are **human-only** — agents must never modify them
- Validators must be isolated: read only PR diff + test output, never the implementation plan
- Bias toward **reject** in triage — if ambiguous, close and request clarification
- Max **2 fix attempts** per PR — after 2 failures, escalate to `needs-human`
- Set `maxBudgetUsd` on all AI nodes — required, not optional

## Existing Dark Factory Project

The reference implementation lives at `/Users/wilbertverayin/projects/darkfactory/multi-tenant/` — a multi-tenant SaaS platform with schema-per-tenant PostgreSQL, NestJS backend, and Quasar/Vue 3 frontend. Refer to it as a template for governance files and workflow structure.
