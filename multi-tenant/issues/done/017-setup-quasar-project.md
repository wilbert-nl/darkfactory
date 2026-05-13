---
id: "017"
title: "Set up Quasar project with TypeScript"
phase: "P6"
task_id: "P6-T1"
priority: "high"
estimated_hours: 2
status: "done"
created_at: "2026-04-23"
attempts: 0
last_attempt: null
failure_notes: null
---

## Description

Scaffold a Quasar (Vue 3) project with TypeScript in `frontend/`. Configure boot files, router, Pinia, Axios, and ESLint/Prettier. Wire into the monorepo `docker-compose.yml`.

## Acceptance Criteria

- [ ] `frontend/` directory created with `quasar create` (TypeScript, Composition API, no SSR)
- [ ] `frontend/package.json` present with Quasar, Vue 3, Pinia, Axios, `@testing-library/vue`, Vitest
- [ ] `frontend/quasar.config.js` configured for SPA mode, port 9000
- [ ] Boot files scaffolded: `boot/auth.ts`, `boot/tenant.ts`, `boot/api.ts`
- [ ] Router scaffolded at `router/index.ts`, `router/routes.ts`, `router/guards.ts`
- [ ] Pinia configured in boot file
- [ ] `npm run lint` and `npm run typecheck` pass (zero errors)
- [ ] `quasar dev` starts on port 9000 with a basic placeholder page
- [ ] `docker-compose.yml` updated with a `frontend` service (for production builds; dev runs natively)

## Context

Quasar must run in SPA mode (no SSR — see CLAUDE.md Known Footguns). The app adapts at runtime per subdomain using composables. All state management via Pinia; no Vuex. All API calls go through `services/api-client.ts` only — never `fetch()` or raw `axios` in components.

Stack: Quasar (Vue 3), TypeScript, Pinia, Axios, Vitest, `@testing-library/vue`.
