# Mission

## What This Builds
Alalarm is a cross-platform mobile/web alarm app for custom-interval recurring reminders. Users set alarms that repeat every X minutes, hours, or days — not just at fixed daily times. Use cases: medication, hydration, exercise breaks, focus timers, and any custom interval routine.

## Primary Users
- Adults managing medication schedules (non-clinical, general wellness)
- Remote workers needing movement/hydration breaks
- People building habits requiring periodic reminders throughout the day
- Power users replacing Pomodoro timers with fully customizable intervals

## In Scope (Factory Can Build)
- Alarm creation with custom interval (every X min/hr/day)
- Alarm categories: medication, water, exercise, focus, custom
- Smart scheduling window ("only between 8am–10pm")
- Snooze with configurable delay
- Alarm history and compliance streak tracker
- Named alarms with notes
- Natural language alarm creation (AI-assisted: "remind me to stretch every 45 minutes")
- Freemium gating: free tier = 3 alarms, Pro = unlimited
- Stripe subscription integration (monthly $2.99, annual $14.99)
- Push notifications via Capacitor Local Notifications
- Local data storage (no required cloud sync in MVP)
- Optional cloud sync for Pro users (NestJS backend + PostgreSQL)
- Unit, integration, and E2E tests
- Bug fixes and performance improvements
- App Store / Play Store metadata and assets

## Out of Scope (Never Build)
- Clinical or medical device features (dosage tracking, drug interactions, medical records)
- HIPAA-compliant health data storage
- Integration with EHRs, pharmacies, or health APIs
- Social/sharing features between users
- Multi-user household management
- Apple Watch / wearable-native apps (Capacitor web view only)
- Desktop-native apps (Electron, Tauri)
- B2B white-label admin portal (post-MVP)
- Real-time collaborative alarms
- Notification delivery via SMS, email, or push via a server — local only in MVP

## Immutable Constraints (Cannot Change, Ever)
- Free tier is hard-capped at 3 active alarms — never increase without human approval
- Pro pricing ($2.99/mo, $14.99/yr) is hardcoded — never change in code without human approval
- All alarm data is stored locally by default — never upload without explicit user consent
- Disclaimer displayed in app: "Alalarm is not a substitute for professional medical advice"
- No user health data transmitted to third parties
- Stripe is the only permitted payment processor
- Claude API (Anthropic) is the only permitted AI provider for natural language parsing
- Governance files (MISSION.md, CLAUDE.md, FACTORY_RULES.md) are human-only — agents never modify them
