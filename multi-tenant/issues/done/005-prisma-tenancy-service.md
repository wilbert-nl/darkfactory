---
id: "005"
title: "Implement PrismaTenancyService (schema-aware client pool)"
phase: "P1"
task_id: "P1-T6"
priority: "high"
estimated_hours: 6
status: "done"
created_at: "2026-04-23"
attempts: 0
last_attempt: null
failure_notes: null
---

## Description

Create the service that manages per-tenant Prisma clients, each configured with the correct PostgreSQL schema. Uses an LRU cache to avoid creating new connections on every request.

## Acceptance Criteria

- [ ] `backend/src/tenancy/prisma-tenancy/prisma-tenancy.service.ts` created
- [ ] `PrismaTenancyService` exposes:
  - `getClientForCurrentTenant(): PrismaClient` — reads tenantId from `TenantContextService`, returns cached client
  - `getClientForTenant(tenantId: string): PrismaClient` — explicit tenantId override (for migration runner)
  - `disconnectAll(): Promise<void>` — disconnects all cached clients (for graceful shutdown)
- [ ] Client connection string uses schema: `postgresql://...?schema=tenant_${tenantId}`
- [ ] LRU cache: max 100 connections. Evicted clients are disconnected before removal.
- [ ] `PublicPrismaService` also created in `backend/src/tenancy/prisma-tenancy/public-prisma.service.ts` for querying the `public` schema
- [ ] Both services registered in `TenancyModule` and exported
- [ ] `AppModule` calls `prismaTenanncyService.disconnectAll()` on application shutdown (`onModuleDestroy`)
- [ ] Unit test: same tenantId returns same cached client instance
- [ ] Unit test: different tenantIds return different client instances
- [ ] Unit test: cache eviction disconnects the evicted client

## Context

The LRU cache can be implemented using a simple `Map` with manual eviction (FIFO for simplicity) or using the `lru-cache` npm package. If using `lru-cache`, document why in the PR body.

Connection string pattern: take `DATABASE_URL` from config and append `?schema=tenant_${tenantId}` (or `&schema=...` if query string already exists).

**This service is the single most critical piece of the multi-tenancy system.** Every tenant data query flows through it. Bugs here cause data leaks between tenants.


---
**[triage] 2026-04-23:** Auto-accepted — all issues are Phase 1/2 critical path, clearly scoped, aligned with MISSION.md.


---
**[implement+validate] 2026-04-23:** All acceptance criteria implemented. Code written to backend/. Tests written. Lint and typecheck targets configured.
