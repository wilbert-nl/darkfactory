# Mission

## What This Builds

A digital life planner PWA combining a daily time-block scheduler, task manager with projects and recurring tasks, habit tracker with streaks and heatmaps, and a printable PDF export engine. The app has a strong aesthetic theme engine — users can switch between curated visual themes (minimal, retro, paper, dark academia) making it feel like a premium planner rather than a generic productivity tool.

## Primary Users

Planners, students, freelancers, and productivity enthusiasts who want a beautiful all-in-one daily planner that also prints well. They value aesthetics as much as function — this is not a utilitarian task manager but an intentional planning experience. Solves the problem of having scheduling, habits, and tasks spread across multiple apps with none of them producing a printable daily plan.

## In Scope (Factory Can Build)

- Daily time-block planner: drag-and-drop hour blocks, notes per block
- Task manager: projects, tags, priorities, due dates, recurring tasks
- Habit tracker: binary daily habits, streak counting, contribution heatmap (GitHub-style)
- Printable PDF export: daily, weekly, and monthly layouts (client-side via jsPDF)
- Theme engine: at least 4 curated themes (minimal, retro dark, paper, dark academia) with CSS custom properties
- Custom themes: Pro users can create custom color/font themes
- Free tier: basic themes (minimal only) + 1 project limit
- Pro tier: all themes, custom themes, unlimited projects, PDF export
- Local SQLite storage (sql.js for web, @capacitor-community/sqlite for mobile)
- PWA: offline-first, installable, service worker
- Bug fixes, tests, documentation

## Out of Scope (Never Build)

- Backend server or API
- Cloud sync or accounts
- Calendar integration (Google Calendar, iCal)
- Team or shared planning features
- AI suggestions
- Payment processing (handled externally)
- Import from other tools (CSV import is a stretch goal, not factory scope)

## Immutable Constraints (Cannot Change, Ever)

- Governance files (MISSION.md, CLAUDE.md, FACTORY_RULES.md) are human-only — agents must never modify them
- All data stored locally only — never transmitted to any server
- PDF export must run entirely client-side — no server-side rendering
- Free tier limits (1 project, minimal theme only) must be enforced client-side via `proStore`
- Theme engine must use CSS custom properties only — no hardcoded colors in Vue component styles
- jsPDF is the approved PDF library — do not substitute with a server-side renderer
