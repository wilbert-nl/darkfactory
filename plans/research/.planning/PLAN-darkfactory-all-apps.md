# Plan: Dark Factory Scaffolding — All Research Apps

## Stack (All Apps)
- **Frontend/Mobile**: Vue 3 + Quasar + Capacitor (iOS/Android/PWA)
- **Local storage**: SQLite via `@capacitor-community/sqlite` (mobile) + `sql.js` (web/PWA)
- **Backend** (apps that need server): NestJS + better-sqlite3 (SQLite on server, no PostgreSQL)
- **AI**: Claude Haiku via NestJS backend (never in frontend)
- **Payments**: Stripe (where applicable)
- **Language**: TypeScript strict throughout
- **Package manager**: pnpm

## Apps to Scaffold (28 total)

### No backend needed (local-first / frontend-only)
- [ ] comments-reader — browser extension, TTS for YouTube comments
- [ ] compare-table — weighted comparison tool
- [ ] local-first — privacy-first utility suite
- [ ] near-alert — proximity alarm (mobile)
- [ ] online-organizer — digital planner
- [ ] pro-con-aid — decision-making assistant

### Backend needed (marketplace / AI-heavy / real-time)
- [ ] anime-wedding — AI video style transfer (complex)
- [ ] audio-swap — video audio replacement tool
- [ ] calendr — appointment scheduling platform
- [ ] cf4-autofill — Philippine customs form autofill
- [ ] chef-connect — home chef marketplace
- [ ] comment-stats — YouTube comments analytics
- [ ] crowd-shot — gig photo marketplace (mobile+web)
- [ ] date-match — relationship compatibility app
- [ ] fit-me — virtual try-on (AI)
- [ ] gift-checker — gift tracking app
- [ ] land-match — land property marketplace
- [ ] lottery-app — transparent online lottery
- [ ] movie-critic — filmmaker-critic marketplace
- [ ] point-system — white-label gamification platform
- [ ] rentals — peer-to-peer rental marketplace
- [ ] scribe-speak — audio-to-document transcription
- [ ] song-vote — real-time DJ song voting
- [ ] synthetic-summer — cold-climate wellness platform
- [ ] travel-connect — traveler-agency marketplace
- [ ] warp-selfie — AI travel photo compositing
- [ ] we-buy — classifieds with escrow

## Tasks

### Phase 1 — Plan & Templates
- [x] Save this plan
- [ ] Create generic shared templates (workflow YAMLs, command MDs, GitHub Actions)

### Phase 2 — Governance Files (parallel agents, 5 batches)
- [ ] Batch A: comments-reader, compare-table, local-first, near-alert, online-organizer, pro-con-aid
- [ ] Batch B: anime-wedding, audio-swap, calendr, cf4-autofill, chef-connect
- [ ] Batch C: comment-stats, crowd-shot, date-match, fit-me, gift-checker
- [ ] Batch D: land-match, lottery-app, movie-critic, point-system, rentals
- [ ] Batch E: scribe-speak, song-vote, synthetic-summer, travel-connect, warp-selfie, we-buy

### Phase 3 — Shared File Distribution
- [ ] Copy .archon/config.yaml into all 28 app folders
- [ ] Copy .archon/workflows/ (5 YAMLs) into all 28 app folders
- [ ] Copy .archon/commands/ (4 MDs) into all 28 app folders
- [ ] Copy .github/workflows/factory-orchestrator.yml into all 28 app folders

## Governance File Conventions Per App
- MISSION.md: scope, forbidden list, immutable constraints (app-specific)
- CLAUDE.md: Quasar+SQLite stack (shared base) + app-specific layout, env vars, protected paths
- FACTORY_RULES.md: standard triage/quality rules + app-specific auto-reject triggers
