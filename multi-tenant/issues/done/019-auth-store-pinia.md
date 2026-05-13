---
id: "019"
title: "Implement auth store (Pinia)"
phase: "P6"
task_id: "P6-T3"
priority: "high"
estimated_hours: 4
status: "done"
created_at: "2026-04-23"
attempts: 0
last_attempt: null
failure_notes: null
---

## Description

Implement `stores/auth-store.ts` and `composables/useAuth.ts` that manage JWT access/refresh tokens, persist them in `localStorage`, and expose auth state to the app.

## Acceptance Criteria

- [ ] `stores/auth-store.ts` (Pinia) with state: `user`, `accessToken`, `refreshToken`, `isAuthenticated`, `isLoading`
- [ ] Actions: `login(email, password)`, `register(data)`, `logout()`, `refreshTokens()`, `loadFromStorage()`
- [ ] Access token stored in memory (store state); refresh token in `localStorage` (key: `refresh_token`)
- [ ] `boot/auth.ts` calls `loadFromStorage()` on app start; auto-refreshes access token if refresh token valid
- [ ] `composables/useAuth.ts` wraps store and exposes typed helpers: `login`, `logout`, `currentUser`, `isAuthenticated`
- [ ] `services/api-client.ts` Axios instance injects `Authorization: Bearer <token>` header from store
- [ ] `services/api-client.ts` intercepts 401 responses, attempts token refresh, then retries original request once
- [ ] Vitest unit tests for store actions (mock `api-client.ts`)
- [ ] `npm run typecheck` passes

## Context

Access token must NEVER go into `localStorage` (XSS risk) — store only in Pinia state (memory). Refresh token in `localStorage` is acceptable for SPAs. The Axios interceptor for token refresh must use a queue to avoid parallel refresh calls. All API calls go through `services/api-client.ts` only.
