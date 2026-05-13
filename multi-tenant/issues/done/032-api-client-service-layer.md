---
id: "032"
title: "Implement typed API client and service layer"
phase: "P6"
task_id: "P6-T7"
priority: "high"
estimated_hours: 4
status: "done"
created_at: "2026-04-23"
attempts: 0
last_attempt: null
failure_notes: null
---

## Description

Build `services/api-client.ts` with typed wrappers for all backend endpoints. This is the single source of truth for all HTTP calls in the frontend.

## Acceptance Criteria

- [ ] `services/api-client.ts` exports an Axios instance configured with `baseURL` from env (`VITE_API_BASE_URL`)
- [ ] Request interceptor: injects `Authorization: Bearer <token>` from `auth-store` when token present
- [ ] Response interceptor: on 401, attempts token refresh via `auth-store.refreshTokens()`, retries once; on second failure, calls `auth-store.logout()` and redirects to login
- [ ] Separate `publicAxios` instance (no auth header) for unauthenticated endpoints
- [ ] `services/auth.service.ts`: `login()`, `register()`, `refreshToken()`, `logout()` — typed request/response
- [ ] `services/tenant.service.ts`: `getPublicConfig()`, `getTenantSettings()`, `updateTenantSettings()`, `uploadLogo()`
- [ ] `services/products.service.ts`: full CRUD + categories
- [ ] `services/reservations.service.ts`: full CRUD + availability
- [ ] `services/orders.service.ts`: full CRUD + status update
- [ ] `services/users.service.ts`: list, invite, updateRole, deactivate
- [ ] `services/superadmin.service.ts`: tenant CRUD, impersonation
- [ ] All service functions return typed response DTOs (interfaces in `types/`)
- [ ] `npm run typecheck` passes

## Context

Every API call in the app MUST go through these service files. No component or composable may import `axios` directly. The refresh token retry must use a mutex/queue to prevent parallel refresh calls when multiple requests 401 simultaneously. Use `VITE_` prefix for env vars in Quasar (Vite-based).
