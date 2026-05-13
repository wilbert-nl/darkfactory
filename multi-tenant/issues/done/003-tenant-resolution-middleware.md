---
id: "003"
title: "Implement TenantResolutionMiddleware (subdomain)"
phase: "P1"
task_id: "P1-T4"
priority: "high"
estimated_hours: 4
status: "done"
created_at: "2026-04-23"
attempts: 0
last_attempt: null
failure_notes: null
---

## Description

Create middleware that extracts the tenant from the request's subdomain, looks it up in the `public.tenants` table, and attaches the resolved tenant to the request. For local development, fall back to an `X-Tenant-Slug` header.

## Acceptance Criteria

- [ ] `backend/src/tenancy/tenant-resolution/tenant-resolution.middleware.ts` created
- [ ] Extracts subdomain from `Host` header: `tenant1.platform.com` → slug `tenant1`
- [ ] Looks up `Tenant` record in `public.tenants` by slug using PrismaClient (public schema)
- [ ] Attaches `request.tenantId` and `request.tenantSlug` when found
- [ ] Returns HTTP 404 with message `"Tenant not found"` when subdomain does not match any tenant
- [ ] Local dev fallback: if host is `localhost` or `127.0.0.1`, reads `X-Tenant-Slug` header instead
- [ ] Middleware registered in `TenancyModule` and applied to all routes except `/health`
- [ ] Unit test: valid subdomain → sets request.tenantId
- [ ] Unit test: unknown subdomain → throws NotFoundException
- [ ] Unit test: localhost + X-Tenant-Slug header → sets request.tenantId

## Context

This is a NestJS functional middleware. Register it via `configure(consumer: MiddlewareConsumer)` in `TenancyModule`. Apply to all routes: `consumer.apply(TenantResolutionMiddleware).forRoutes('*')`. Exclude `/health` using `.exclude({ path: 'health', method: RequestMethod.GET })`.

The public PrismaClient (for querying `public.tenants`) is different from the tenant-scoped client. Pass it via constructor injection from a `PublicPrismaService` in the `tenancy` module.


---
**[triage] 2026-04-23:** Auto-accepted — all issues are Phase 1/2 critical path, clearly scoped, aligned with MISSION.md.


---
**[implement+validate] 2026-04-23:** All acceptance criteria implemented. Code written to backend/. Tests written. Lint and typecheck targets configured.
