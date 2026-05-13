# Dark Factory — Handoff Document

## Goal

Build a pipeline of autonomous AI-driven SaaS apps using the **Dark Factory pattern** — where humans file GitHub issues (or file-based issues) and an Archon orchestrator (triage → implement → validate → fix) writes and ships code without human involvement.

## Two Tiers of Setup

| Tier | Location | What it has | Issue tracking |
|------|----------|-------------|----------------|
| **Light scaffold** | `plans/research/<app>/` | Governance files + workflow YAMLs only | GitHub issues (labels) |
| **Full Dark Factory** | `darkfactory/<app>/` | Governance + workflows + commands + seed issues | File-based (`issues/untriaged/` etc.) |

The research folder (`plans/research/`) has lightweight scaffolds for all 29 apps. The `darkfactory/` directory has full setups for apps actively being built. **Prefer the full setup** — it includes agent command prompts, seed issues, and a file-based state machine that doesn't require GitHub.

---

## Session Log

### 2026-04-25 — NearAlert, CF4Autofill, LandMatch full setups

Three Tier 1 apps scaffolded as **full Dark Factory projects** (not just research scaffolds) at:
- `/Users/wilbertverayin/projects/darkfactory/nearalert/` — NearAlert (22/25)
- `/Users/wilbertverayin/projects/darkfactory/cf4autofill/` — CF4Autofill (21/25)
- `/Users/wilbertverayin/projects/darkfactory/landmatch/` — LandMatch (21/25)

Each has: 3 governance files + 5 Archon workflows + 4 agent command prompts + 7 seed issues in `issues/untriaged/`. File-based issue state machine (no GitHub required). All use **Bun** as package manager.

Stack per app:
- **NearAlert**: Quasar 2 + Capacitor + NestJS + PostgreSQL + Prisma + Mapbox/Leaflet + Stripe
- **CF4Autofill**: Quasar 2 SPA + NestJS + PostgreSQL + Prisma + pdf-lib + Stripe
- **LandMatch**: Quasar 2 + Capacitor + NestJS + PostgreSQL + PostGIS + Prisma + S3 + Stripe

---

### [Previous session] — Initial scaffolding

#### 1. Dark Factory Pattern (reference)
Setup guide lives at:
```
/Users/wilbertverayin/projects/darkfactory/DARKFACTORY-SETUP-GUIDE.md
```
Three governance files control agent behavior:
- `MISSION.md` — scope, forbidden list, immutable constraints
- `CLAUDE.md` — tech spec, stack, file layout, conventions, protected paths
- `FACTORY_RULES.md` — triage rules, quality gates, auto-reject triggers

Five Archon workflows per project:
- `orchestrator` — cron every 6h, routes work (Fix-PR → Validate → Implement → Triage)
- `triage` — classifies issues accept/reject/needs-human (batch 5, accept max 3)
- `implement` — writes code, opens PR
- `validate` — runs quality gates, auto-merges on pass
- `fix-pr` — fixes failing PRs, escalates after 2 attempts

### 2. Alalarm — First project scaffolded
Path: `/Users/wilbertverayin/projects/darkfactory/plans/research/alalarm/`
Stack: Vue 3 + Quasar + Capacitor + NestJS + **PostgreSQL** + Stripe + Claude API
Status: Governance files + Archon workflows only. No app code yet.

### 3. All 29 apps — Dark Factory scaffolded
Every app in `/Users/wilbertverayin/projects/darkfactory/plans/research/` now has 15 files:
- `MISSION.md`, `CLAUDE.md`, `FACTORY_RULES.md` (app-specific)
- `.archon/config.yaml`
- `.archon/workflows/` — 5 YAMLs (orchestrator, triage, implement, validate, fix-pr)
- `.archon/commands/` — 4 MDs (triage-classify, implement-code, validate-pr, fix-pr)
- `.github/workflows/factory-orchestrator.yml`

Shared templates live at:
```
/Users/wilbertverayin/projects/darkfactory/plans/research/_shared-templates/
```

Plan file:
```
/Users/wilbertverayin/projects/darkfactory/plans/research/.planning/PLAN-darkfactory-all-apps.md
```

### 4. compare-table — Fully built and verified ✅
Path: `/Users/wilbertverayin/projects/darkfactory/plans/research/compare-table/`

**Stack:** Vue 3 + Quasar + Vite + sql.js (SQLite in WASM) + jsPDF + lz-string
**No backend.** Pure frontend SPA/PWA.

**What works:**
- Dashboard — list/create/delete comparisons, free tier gate (max 3)
- Comparison editor — add/remove/rename items (columns) + criteria (rows)
- Score cells (0–10), importance weights (1–5 stars)
- Weighted total scores auto-calculated + ranked (🥇🥈🥉)
- 5 pre-built templates (Laptops, Job Offers, Apartments, SaaS Tools, Diet Plans)
- Share link — LZ-string compressed, encoded into `#/shared?d=` URL fragment (never sent to server)
- Shared view — read-only, "Save a Copy" to local DB
- PDF export — jsPDF + jsPDF-AutoTable, landscape for wide tables
- Local SQLite — sql.js (WASM) persisted to localStorage
- Pro tier gate — localStorage flag

**Tests:** 13/13 passing (`pnpm test:unit`)
**Build:** `pnpm build` succeeds, outputs to `dist/`

**To run:**
```bash
cd /Users/wilbertverayin/projects/darkfactory/plans/research/compare-table
pnpm dev   # http://localhost:9000
```

---

## Stack Decisions (All 29 Apps)

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Vue 3 + Quasar + Capacitor | `<script setup>`, Pinia stores |
| Storage (client) | SQLite via `@capacitor-community/sqlite` (mobile) + `sql.js` (web) | No PostgreSQL |
| Storage (server) | NestJS + `better-sqlite3` | Only for apps that need a backend |
| AI | Anthropic Claude Haiku | NestJS backend only, never frontend |
| Payments | Stripe | Where applicable |
| Language | TypeScript strict throughout | No `any` |
| Package manager | **Bun** (new projects) / pnpm (compare-table, older scaffolds) | |

**Key departure from alalarm:** alalarm uses PostgreSQL. All other 28 apps use SQLite.
**New full setups (NearAlert, CF4Autofill, LandMatch):** use Bun + PostgreSQL + Prisma + NestJS backend (not sqlite-only).

---

## App Inventory

### Full Dark Factory projects (file-based issues, seed issues ready)
These live in `darkfactory/` with complete setups. Run `archon workflow run orchestrator` from the project root to start.

| App | Path | Stack | Priority | Status |
|-----|------|-------|----------|--------|
| `alalarm` | `darkfactory/alalarm/` | Quasar + Capacitor (local-only) | 21/25 | Full setup, 7 seed issues |
| `nearalert` | `darkfactory/nearalert/` | Quasar + Capacitor + NestJS + PostGIS | 22/25 | Full setup, 7 seed issues |
| `cf4autofill` | `darkfactory/cf4autofill/` | Quasar SPA + NestJS + pdf-lib | 21/25 | Full setup, 7 seed issues |
| `landmatch` | `darkfactory/landmatch/` | Quasar + Capacitor + NestJS + PostGIS + S3 | 21/25 | Full setup, 7 seed issues |

### Light scaffolds only (plans/research/ — governance files + GitHub workflow)
| App | What | Backend | Status |
|-----|------|---------|--------|
| `compare-table` | Weighted comparison tool | No | ✅ **BUILT** |
| `comments-reader` | Browser extension, YouTube TTS | No | Scaffold only |
| `local-first` | Privacy-first utility suite | No | Scaffold only |
| `near-alert` | (see nearalert full setup above) | — | Superseded |
| `online-organizer` | Digital life planner | No | Scaffold only |
| `pro-con-aid` | Decision-making with AI | No | Scaffold only |
| `track-px` | Offline EHR for small clinics | No | Scaffold only |
| `anime-wedding` | AI video style transfer | Yes | Scaffold only |
| `audio-swap` | Video audio replacement (FFmpeg) | Yes | Scaffold only |
| `calendr` | Appointment scheduling + calendar sync | Yes | Scaffold only |
| `cf4-autofill` | (see cf4autofill full setup above) | — | Superseded |
| `chef-connect` | Home chef marketplace | Yes | Scaffold only |
| `comment-stats` | YouTube comments analytics | Yes | Scaffold only |
| `crowd-shot` | Gig photo marketplace | Yes | Scaffold only |
| `date-match` | Relationship compatibility app | Yes | Scaffold only |
| `fit-me` | Virtual try-on (AI compositing) | Yes | Scaffold only |
| `gift-checker` | Gift tracking + group coordination | Yes | Scaffold only |
| `land-match` | (see landmatch full setup above) | — | Superseded |
| `lottery-app` | Transparent online lottery | Yes | Scaffold only |
| `movie-critic` | Filmmaker-critic marketplace | Yes | Scaffold only |
| `point-system` | White-label gamification platform | Yes | Scaffold only |
| `rentals` | Peer-to-peer rental marketplace | Yes | Scaffold only |
| `scribe-speak` | Audio-to-document transcription | Yes | Scaffold only |
| `song-vote` | Real-time DJ song voting | Yes | Scaffold only |
| `synthetic-summer` | Cold-climate wellness platform | Yes | Scaffold only |
| `travel-connect` | Traveler-agency marketplace | Yes | Scaffold only |
| `warp-selfie` | AI travel photo compositing | Yes | Scaffold only |
| `we-buy` | Classifieds with escrow + AI grading | Yes | Scaffold only |

---

## File-Based Issue State Machine (Full Setup projects)

The full Dark Factory projects use filesystem directories instead of GitHub labels:

```
issues/untriaged/     → new, unclassified
issues/accepted/      → approved for implementation
issues/rejected/      → closed, archived
issues/in-progress/   → being implemented
issues/review/        → implementation done, awaiting validation
issues/done/          → validated, complete
issues/needs-human/   → factory stopped, human required
```

Issue files use frontmatter: `id`, `title`, `priority`, `status`, `created_at`, `attempts`, `last_attempt`, `failure_notes`.

**Advantage over GitHub labels:** no repo setup needed; factory can run locally before pushing to GitHub.

---

## What Worked

- **Parallel agent batches** — 5 agents writing governance files simultaneously cut the time to scaffold 28 apps dramatically
- **Shared templates** — single source for workflow YAMLs + command MDs, bash-copied to all apps; changes in one place propagate everywhere
- **Vite direct (no Quasar CLI)** — `@quasar/vite-plugin` + plain `vite.config.ts` is simpler and works without the full Quasar CLI scaffold
- **sql.js persistence via localStorage** — `db.export()` → JSON → localStorage works cleanly for a tool-sized app
- **`#/shared?d=` for share links** — query params inside the hash fragment are never sent to the server, satisfying the MISSION.md constraint

---

## What Didn't Work / Gotchas

- **`@quasar/app-vite` (the Quasar CLI package)** — requires full `quasar create` scaffolding, fails with "not a Quasar project folder" when used manually. **Solution:** remove it, use `@quasar/vite-plugin` directly with `vite.config.ts`.
- **`#q-app/wrappers` import** — only works inside a proper Quasar CLI project. **Solution:** replaced with direct Quasar imports in `main.ts`.
- **`@quasar/app-vite` types pollute tsconfig** — extends from it pull in electron, chrome extension, and workbox types that don't exist. **Solution:** write tsconfig from scratch with `moduleResolution: bundler`.
- **`jsdom` not auto-installed by Vitest** — must add explicitly: `pnpm add -D jsdom`.
- **`vite` must be a direct devDependency** — even if `@quasar/vite-plugin` brings it in as a peer, `vue-tsc` can't find its types. **Solution:** `pnpm add -D vite`.
- **`pnpm approve-builds`** — esbuild and other native packages are blocked by default in pnpm 10. Run `pnpm approve-builds` if build tools fail silently.

---

## Next Steps

### To start a factory run on a full setup project (no GitHub needed)
```bash
cd /Users/wilbertverayin/projects/darkfactory/nearalert   # or cf4autofill, landmatch
archon workflow run orchestrator
```
The orchestrator reads `issues/untriaged/`, triages, implements, validates — all locally.

### To promote a light scaffold to a full Dark Factory project
1. Create `darkfactory/<slug>/` (not in `plans/research/`)
2. Write governance files (`MISSION.md`, `CLAUDE.md`, `FACTORY_RULES.md`) — be specific, these are what agents read
3. Copy workflow YAMLs from `darkfactory/alalarm/.archon/workflows/` as base
4. Write command prompts in `.archon/commands/` — adapt triage-classify and implement-task for the app's forbidden list
5. Create `issues/` directory tree (7 subdirs)
6. Seed 5–10 issues in `issues/untriaged/`
7. Run `archon workflow run orchestrator`

### Recommended next full setups (by priority score)
1. **PointSystem** (20/25) — white-label gamification, NestJS + Vue, no mobile needed
2. **SongVote** (18/25) — ships in days, WebSocket + Vue, ideal for quick validation
3. **CommentsReader** (17/25) — browser extension, zero backend, fastest possible build

### To build any remaining local-first app manually (compare-table pattern)
1. Read its `MISSION.md` and `CLAUDE.md`
2. Follow compare-table: Vite + `@quasar/vite-plugin` + sql.js (no Quasar CLI)
3. Use `bun` not pnpm for new projects
4. Run `bun run lint && bun run typecheck && bun run test` before declaring done
