---
id: "004"
title: "Create TenantContext service with AsyncLocalStorage"
phase: "P1"
task_id: "P1-T5"
priority: "high"
estimated_hours: 4
status: "done"
created_at: "2026-04-23"
attempts: 0
last_attempt: null
failure_notes: null
---

## Description

Implement the tenant context propagation system using Node.js AsyncLocalStorage so any service in the request chain can access the current tenant ID without it being passed as a function parameter.

## Acceptance Criteria

- [ ] `backend/src/tenancy/tenant-context/tenant-context.service.ts` created
- [ ] `TenantContextService` exposes:
  - `runWithTenant(tenantId: string, fn: () => Promise<T>): Promise<T>` — wraps execution in ALS context
  - `getCurrentTenantId(): string` — reads from ALS, throws `InternalServerErrorException` if no context
  - `getCurrentTenantIdOrNull(): string | null` — reads from ALS, returns null if no context
- [ ] `TenantResolutionMiddleware` (from issue #003) updated to call `runWithTenant(tenantId, next)` after resolving the tenant
- [ ] Unit test: `runWithTenant` sets context, `getCurrentTenantId` reads it correctly within the callback
- [ ] Unit test: `getCurrentTenantId` throws when called outside a tenant context
- [ ] Unit test: nested `runWithTenant` calls do not bleed context (inner context isolated)
- [ ] `TenantContextService` is exported from `TenancyModule` and available for injection in all modules

## Context

Use Node.js built-in `AsyncLocalStorage` from `node:async_hooks`. The ALS store holds `{ tenantId: string }`. This is the ONLY mechanism for accessing the current tenant — never pass tenantId as a function parameter through service chains.

**Footgun warning**: AsyncLocalStorage context is lost inside `setTimeout`, `setInterval`, or event emitter callbacks. Document this in a comment above the class so future agents are aware.


---
**[triage] 2026-04-23:** Auto-accepted — all issues are Phase 1/2 critical path, clearly scoped, aligned with MISSION.md.


---
**[implement+validate] 2026-04-23:** All acceptance criteria implemented. Code written to backend/. Tests written. Lint and typecheck targets configured.
