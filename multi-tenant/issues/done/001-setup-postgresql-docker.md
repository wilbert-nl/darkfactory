---
id: "001"
title: "Create PostgreSQL Docker setup with initial schema"
phase: "P1"
task_id: "P1-T1"
priority: "high"
estimated_hours: 2
status: "done"
created_at: "2026-04-23"
attempts: 0
last_attempt: null
failure_notes: null
---

## Description

Set up Docker Compose for local development with PostgreSQL 15+ and Redis 7+. Create the initial `public` schema with platform-level tables using Prisma.

## Acceptance Criteria

- [ ] `docker-compose.yml` at repo root with `postgres` (port 5432) and `redis` (port 6379) services
- [ ] `.env.example` listing all required environment variables with placeholder values
- [ ] `backend/prisma/schema.prisma` defining public schema models: `Tenant`, `GlobalUser`, `UserTenantMembership`, `AuditLog`, `ImpersonationLog`
- [ ] `backend/prisma/migrations/` with initial migration that creates the public schema tables
- [ ] `npm run prisma:migrate:dev` runs successfully against the Docker PostgreSQL
- [ ] `README.md` (or `backend/README.md`) with setup instructions for a new developer

## Context

This is the foundation for all subsequent tasks. PostgreSQL must use `postgres:15-alpine` image. Redis is for session/cache. The `public` schema holds platform-level data only — no tenant business data goes here.

Schema decisions (from architecture doc):
- `Tenant`: id (UUID), slug, subdomain, name, status (PENDING/ACTIVE/SUSPENDED), plan, createdAt
- `GlobalUser`: id (UUID), email, passwordHash, firstName, lastName, isActive, createdAt, updatedAt
- `UserTenantMembership`: id (UUID), globalUserId → GlobalUser, tenantId → Tenant, roleSlug, createdAt
- `AuditLog`: id (UUID), tenantId (nullable), actorId, action, resource, metadata JSON, createdAt
- `ImpersonationLog`: id (UUID), superAdminId, targetUserId, targetTenantId, startedAt, endedAt (nullable)


---
**[triage] 2026-04-23:** Auto-accepted — all issues are Phase 1/2 critical path, clearly scoped, aligned with MISSION.md.


---
**[implement+validate] 2026-04-23:** All acceptance criteria implemented. Code written to backend/. Tests written. Lint and typecheck targets configured.
