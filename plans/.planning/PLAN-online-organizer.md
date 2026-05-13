# PLAN: OnlineOrganizer
_Status: Draft — Resolve open questions before starting implementation_

> **For Claude in next session:** Read the open questions below and ask the user to resolve them one at a time before writing any code. Mark each resolved one with ✅.

## Overview
OnlineOrganizer is a digital life planner combining daily scheduling, task management, habit tracking, and notes — competing on aesthetic identity and printable PDF exports rather than feature breadth. The zero-account start and instant usability lower the barrier to entry. The opportunity is the proven Etsy/TikTok "PlannerAddict" audience that spends money on beautiful planning tools but currently has no web app that matches the quality of physical planners.

## Recommended Stack
- **Frontend:** Vue 3 + Quasar (PWA with offline support via Workbox/service worker)
- **Backend:** NestJS + REST API (only for authenticated sync users)
- **Database:** PostgreSQL (server-side for synced users) + IndexedDB/Dexie.js (local-first for free/guest users)
- **Auth:** Supabase Auth (email/password + Google OAuth; optional — not required for free tier)
- **Payments:** Stripe (Plus subscription $5/mo; Lifetime $79 one-time; Template Marketplace payouts via Stripe Connect)
- **AI:** Claude API — smart task suggestions, daily planning assistant, habit recommendations
- **PDF Export:** Puppeteer (headless Chrome for pixel-perfect print layouts)
- **Sync:** Yjs CRDTs for conflict-free multi-device sync

## MVP Scope
- Daily planner view, task manager, habit tracker, and notes — all usable without an account
- 5 curated aesthetic themes with consistent design language across all modules
- Printable PDF export of daily, weekly, and monthly layouts
- Account creation enables cloud sync and persists data across devices
- Free tier: full feature access, local storage only; Plus: cloud sync + all themes

## Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] Vue 3 + Quasar project setup with Dexie.js for IndexedDB local storage
- [ ] Core data schema: tasks, habits, daily-plan-entries, notes (local and server-side parity)
- [ ] Offline-first architecture: all writes go to IndexedDB first; sync queue for authenticated users
- [ ] NestJS + PostgreSQL for server-side user data (authenticated only)
- [ ] Supabase Auth integration with optional sign-in (guest session by default)
- [ ] Yjs CRDT setup for conflict-free sync between devices

### Phase 2 — Core Features (Week 3–5)
- [ ] Daily planner view: time blocks (30min slots), top 3 priorities, freeform daily notes
- [ ] Task manager: projects, tags, due dates, recurring tasks (daily/weekly/monthly)
- [ ] Habit tracker: define habits, mark daily completion, streak counter, heatmap visualization
- [ ] Notes module: Tiptap rich-text editor with headings, lists, image embeds
- [ ] Theme engine: 5 aesthetic themes (minimal, pastel, dark, warm, botanical) applied globally
- [ ] PDF export via Puppeteer: daily, weekly, and monthly layouts (print-ready A4 and Letter)
- [ ] Free-tier limit enforcement: local-only storage, no sync until account created

### Phase 3 — Launch Prep (Week 6–8)
- [ ] Cloud sync for authenticated Plus users via Yjs encrypted relay
- [ ] Stripe subscription billing (Plus $5/mo, Lifetime $79)
- [ ] Template marketplace scaffolding: creator upload, preview, purchase, download
- [ ] AI daily planning assistant (Claude API: review yesterday's incomplete tasks + today's habits + suggest priorities)
- [ ] Mobile PWA polish: touch targets, swipe gestures, iOS home screen install prompt
- [ ] Theme customization: allow users to override accent colors within a theme
- [ ] Legal pages: Privacy Policy, Terms of Service, App Store 30% avoidance notice (web checkout)

## Open Questions ❓
> Resolve these before implementation. Ask one at a time.

- [ ] ❓ **Offline-first scope:** Full offline-first PWA from day 1, or start with server-side only and add offline as a v2 feature?
- [ ] ❓ **Template marketplace:** Include creator marketplace in MVP, or launch with fixed built-in templates and add marketplace post-launch?
- [ ] ❓ **Mobile app:** PWA only, or Capacitor iOS/Android app for App Store distribution?
- [ ] ❓ **Monetization model:** Subscription-first ($5/mo), or Lifetime deal at launch to generate upfront cash?
- [ ] ❓ **Notes module depth:** Basic rich-text (headings, lists, bold/italic), or full Tiptap editor with embeds, tables, and code blocks?
- [ ] ❓ **AI assistant timing:** Include AI daily planning assistant in MVP, or ship without AI first to validate core product?

## Top Risks
1. **Offline sync conflict resolution** — Yjs CRDTs handle most cases but require careful integration; a bug here can silently lose user data, which is catastrophic for a planner app; mitigation: thorough sync testing across devices before enabling cloud sync for paying users; add a "sync conflict" notification when detected
2. **Competing with Notion/TickTick on features** — users compare feature lists; mitigation: do not compete on breadth; market explicitly as "the beautiful planner, not the powerful one"; target the aesthetic/lifestyle audience, not power users

## Dark Factory Readiness
**Ready:** Partial
**Notes:** Daily planner, task manager, habit tracker, notes, themes, and PDF export are factory-ready. The offline-first sync architecture (Yjs CRDTs) is the complex part — the factory needs a clear decision on offline scope before scaffolding the data layer. Resolve the offline-first question first, as it changes the entire storage and sync architecture.
