# FACTORY_RULES.md — audio-swap

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
- Implementation does not touch `api/src/ffmpeg/` or `api/src/royalty-free-library/`
- Issue does not require changing pricing, upload limits, or duration caps
- Issue is scoped to one area (frontend, backend, billing, storage)
- Issue includes enough detail to write an acceptance test

### Reject Criteria
- Requests changes to `api/src/ffmpeg/` or `api/src/royalty-free-library/`
- Requests YouTube, Instagram, TikTok, or social platform video download support
- Requests video re-encoding or codec changes (video stream must remain `-c:v copy`)
- Requests price changes or limit relaxation
- Out of scope per MISSION.md
- Duplicate of an existing accepted issue

### Escalate Criteria
- Requests FFmpeg binary version update
- Requests adding community-submitted tracks to the royalty-free library
- Involves Stripe pricing ID changes
- Security vulnerability reports
- Ambiguous scope that touches protected paths

## Implementation Rules

Agents implementing accepted issues must never:

1. Modify, delete, or move any file under `api/src/ffmpeg/`
2. Modify, delete, or move any file under `api/src/royalty-free-library/`
3. Remove or alter the `-c:v copy` flag from any FFmpeg command
4. Change `STRIPE_PRO_PRICE_ID` or any pricing constant
5. Relax `MAX_UPLOAD_MB_FREE`, `MAX_UPLOAD_MB_PRO`, `MAX_DURATION_FREE_MINUTES`, or `MAX_DURATION_PRO_MINUTES`
6. Add support for fetching video from YouTube or any social platform
7. Use `any` TypeScript type
8. Write raw SQL string concatenation — parameterized queries only
9. Invoke FFmpeg from any module outside `api/src/ffmpeg/`
10. Add `console.log` — use NestJS `Logger` only

## Quality Gates

Every PR must pass all of the following before merge:

- [ ] `pnpm --filter api lint` exits 0
- [ ] `pnpm --filter app lint` exits 0
- [ ] `pnpm --filter api typecheck` exits 0
- [ ] `pnpm --filter app typecheck` exits 0
- [ ] `pnpm --filter api test` — all existing tests pass, no regressions
- [ ] `pnpm --filter app test` — all existing tests pass, no regressions
- [ ] New code has at least one new test
- [ ] No new `any` types introduced
- [ ] No hardcoded secrets or API keys in source
- [ ] No `-c:v` flag removed or changed to anything other than `copy`
- [ ] FFmpeg calls remain exclusively in `api/src/ffmpeg/`
- [ ] PR description includes: problem, solution, test plan

## Auto-Reject Triggers

A PR is automatically rejected if it:

- Touches any file under `api/src/ffmpeg/` or `api/src/royalty-free-library/`
- Changes `STRIPE_PRO_PRICE_ID` or any pricing constant
- Adds a URL import handler for YouTube, Instagram, TikTok, or similar platforms
- Removes `-c:v copy` or changes the video stream encoding
- Relaxes upload size or duration limits
- Contains hardcoded credentials
- Fails lint or typecheck
- Has no associated test

## Escalation

Label `factory:needs-human` and pause work when:

- 2 consecutive fix attempts on a PR fail quality gates
- FFmpeg binary needs version update (human decision required)
- Royalty-free library needs new tracks (human curation required)
- Stripe pricing change is requested
- Security vulnerability found in FFmpeg execution path

## Throughput Controls

- Max concurrent FFmpeg jobs: 3 (configurable via `FFMPEG_CONCURRENCY` env, default 3)
- Max `maxBudgetUsd` per AI node invocation: $1.00
- Max 2 fix attempts per PR before escalation
- Orchestrator runs on cron every 6 hours

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
api/src/ffmpeg/**
api/src/royalty-free-library/**
.env
.env.production
```
