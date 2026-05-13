# Alalarm — Research Brief

## What It Is
A recurring alarm app that repeats on fully custom intervals (every X minutes, hours, or days — not just daily). Targets medication reminders, hydration, exercise breaks, and focus timers in a single clean UX.

## Competitors
| Name | Description |
|------|-------------|
| Medisafe | ~10M users; dominant medication adherence app; medically focused, not general-purpose |
| MyTherapy | Health tracking + reminders; EU-popular; limited support for non-health intervals |
| Alarmed (iOS) | Feature-rich with "nagging" repeat mode + DayMinder every-X-hours alerts; power-user niche |
| Pill Reminder – All in One | Supports cycles like every 4 hours; scoped entirely to medications |

## Market Size
Medication reminder apps market $1.27B (2024) → $3.5B by 2033 (13% CAGR). Adjacent markets: habit tracking apps (growing) and focus/Pomodoro timers (millions of daily users across Forest, Be Focused). Key gap: no dominant app for general-purpose custom-interval recurring alarms covering medication + hydration + exercise + productivity in one clean UX.

## MVP Features
1. Set alarm with custom repeat interval (every X minutes/hours/days, not just daily)
2. Alarm categories (medication, water, exercise, focus, custom)
3. Smart scheduling window (e.g., "only between 8am–10pm")
4. Snooze with configurable delay
5. Alarm history and compliance streak tracker
6. Named alarms with notes (e.g., "Take ibuprofen with food")

## Differentiators
1. General-purpose intervals — unlike competitors locked to medication, serves water breaks, desk stretches, focus timers, and custom workflows in one app
2. Simplicity over features — existing apps are medically complex; clean minimal UI targets non-medical interval alarm users
3. AI-assisted scheduling — describe routine in plain language ("remind me to stretch every 45 minutes during work hours") and AI sets it up automatically

## Profitability
**Model:** Freemium — free up to 3 alarms; Pro at $2.99/mo or $14.99/yr (unlimited alarms, categories, analytics, export). B2B/wellness tier available for white-labeling to corporate wellness programs or physical therapy clinics.

**Estimate:** 50K paying users × $14.99/yr = $750K ARR. At 200K paying users = ~$3M ARR.

## Build Ease: 5/5
Pure mobile/web app with no complex backend. AI handles natural language scheduling, smart suggestions by alarm category, and notification logic. Full React Native or Capacitor codebase can be scaffolded quickly with no medical regulatory requirements for a general-purpose alarm app.

## Legal Risks
- If marketed for medication use: must disclaim the app is not a substitute for professional medical advice
- Avoid storing health data in HIPAA-triggering ways — keep data local or anonymized
- No FDA/CE classification needed unless clinical claims are made
