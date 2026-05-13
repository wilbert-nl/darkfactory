---
id: "022"
title: "Implement router guards for auth and role enforcement"
phase: "P6"
task_id: "P6-T4"
priority: "high"
estimated_hours: 3
status: "done"
created_at: "2026-04-23"
attempts: 0
last_attempt: null
failure_notes: null
---

## Description

Implement all route guard logic in `router/guards.ts`. Routes are protected by authentication and role requirements declared in route meta.

## Acceptance Criteria

- [ ] `router/guards.ts` exports a single `setupGuards(router)` function called in `router/index.ts`
- [ ] Guard reads `auth-store.isAuthenticated` and `auth-store.user.role`
- [ ] Route meta interface: `{ requiresAuth?: boolean; roles?: ('superadmin' | 'tenant_owner' | 'tenant_user')[] }`
- [ ] Unauthenticated access to `requiresAuth: true` route → redirect to `/auth/login`
- [ ] Authenticated access to `/auth/login` or `/auth/register` → redirect to `/admin/dashboard`
- [ ] Role mismatch → redirect to `/403` page
- [ ] Tenant not resolved when accessing public pages → redirect to `/error/tenant-not-found`
- [ ] All routes in `routes.ts` have correct meta defined
- [ ] Vitest test for guard logic (mock router and store)
- [ ] No inline `beforeEach` logic in any component

## Context

All guard logic must live exclusively in `router/guards.ts`. Guards run in order: tenant resolution check → auth check → role check. The `setupGuards` pattern avoids circular imports between router and stores.
