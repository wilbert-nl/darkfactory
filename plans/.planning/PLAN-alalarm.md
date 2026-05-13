# PLAN: Alalarm
_Status: Draft — Resolve open questions before starting implementation_

> **For Claude in next session:** Read the open questions below and ask the user to resolve them one at a time before writing any code. Mark each resolved one with ✅.

## Overview
Alalarm is a custom-interval recurring alarm app that repeats on any schedule the user defines — not just daily. It serves medication reminders, hydration, exercise breaks, and focus timers in a single clean UX. The opportunity is a confirmed gap: no dominant app covers general-purpose interval alarms across health and productivity categories without being medically complex or poorly designed.

## Recommended Stack
- **Frontend:** React Native (Expo) — cross-platform iOS + Android from one codebase; Capacitor is an option but native notification scheduling and background tasks are better-handled natively for an alarm app
- **Backend:** NestJS (minimal — mainly for account sync, pro license validation, and analytics)
- **Database:** PostgreSQL (user accounts, alarm configs, sync); SQLite locally on device for offline-first alarm storage
- **Auth:** Supabase Auth or Firebase Auth (social login + email; keep it simple)
- **Payments:** RevenueCat (cross-platform in-app subscription management for iOS + Android)
- **AI:** Claude API — natural language alarm creation ("remind me to stretch every 45 minutes during work hours" → parsed into alarm config); category-based suggestions

## MVP Scope
- Custom interval alarm creation (every X minutes/hours/days) with scheduling window (e.g., 8am–10pm only)
- Alarm categories: medication, water, exercise, focus, custom
- Snooze with configurable delay; alarm history and streak tracker
- AI natural language setup: describe routine → alarm auto-configured
- Free tier (3 alarms); Pro tier (unlimited + analytics + export)

## Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] Scaffold React Native (Expo) project with NestJS API
- [ ] Set up PostgreSQL + local SQLite sync strategy
- [ ] Implement alarm data model (interval, window, category, label, notes)
- [ ] Build core notification scheduling with Expo Notifications + background task handler
- [ ] Auth flow (sign up, login, guest mode with local-only storage)

### Phase 2 — Core Features (Week 3–5)
- [ ] Alarm creation UI: interval picker, scheduling window, category selector, name + notes
- [ ] Smart scheduling window enforcement (suppress alarms outside defined hours)
- [ ] Snooze logic with configurable delay per alarm
- [ ] Alarm history view + compliance streak tracker
- [ ] AI natural language alarm creation via Claude API
- [ ] Pro subscription gate via RevenueCat

### Phase 3 — Launch Prep (Week 6–8)
- [ ] Analytics dashboard (alarm compliance, streak stats)
- [ ] Export alarm history (CSV/PDF)
- [ ] B2B white-label config (custom branding, limited category set)
- [ ] App Store + Google Play submission (screenshots, metadata, privacy policy)
- [ ] Onboarding flow with use-case templates (medication, hydration, focus)

## Open Questions ❓
> Resolve these before implementation. Ask one at a time.

- [ ] ❓ **Platform:** iOS + Android from day 1, or launch on one platform first to validate?
- [ ] ❓ **Offline-first vs cloud-first:** Should alarms work fully offline (local SQLite only) with optional cloud sync, or require account creation from the start?
- [ ] ❓ **Monetization timing:** Paid Pro from day 1, or free to grow then introduce paywall after first 1,000 users?
- [ ] ❓ **AI feature scope:** Is natural language alarm creation in MVP, or a Phase 2 feature after core scheduling is proven?
- [ ] ❓ **B2B white-label:** Is the corporate wellness / clinic white-label tier a launch goal or a post-traction revenue add?
- [ ] ❓ **Alarm limits on free tier:** Is 3 alarms the right free limit, or should it be unlimited alarms with Pro unlocking analytics and export?

## Top Risks
1. **iOS notification limits** — Apple restricts background notification scheduling; Expo Notifications handles this but has edge cases with very short intervals (< 1 min); mitigation: test edge cases early in Phase 1 and document minimum supported interval
2. **User retention** — Alarm apps see high install-then-forget rates; mitigation: streak tracker + compliance history creates habit loop; test onboarding template flow to get users to a working alarm in under 60 seconds

## Dark Factory Readiness
**Ready:** Yes
**Notes:** Standard mobile app with notification scheduling, no legal complexity, clean scope. Factory needs: confirmed platform decision (iOS/Android/both), confirmed offline-first vs cloud-first data strategy, and RevenueCat account credentials before build starts.
