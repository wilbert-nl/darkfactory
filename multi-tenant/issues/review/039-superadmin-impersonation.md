---
id: "039"
title: "Implement SuperAdmin impersonation (audited, time-limited)"
phase: "P3"
task_id: "P3-T2"
priority: "high"
estimated_hours: 5
status: "untriaged"
created_at: "2026-04-23"
attempts: 0
last_attempt: null
failure_notes: null
---

## Description

Implement SuperAdmin impersonation: a SuperAdmin can start an impersonation session as any tenant user, receive a short-lived JWT scoped to that tenant, and end the session. Every session is logged to `public.impersonation_logs` per MISSION.md immutable constraints.

The `ImpersonationLog` model and `SuperAdmin.impersonations` relation already exist in `backend/prisma/schema.prisma`.

## Acceptance Criteria

- [ ] `POST /super-admin/impersonate` — accepts `{ targetUserId, targetTenantId, reason? }`, guarded by `SuperAdminGuard`, returns a short-lived impersonation JWT (TTL: 30 minutes, non-renewable)
- [ ] Impersonation JWT payload: `{ sub: targetUserId, email: targetUserEmail, tenantMemberships: [...], isImpersonation: true, impersonatedBy: superAdminId, impersonationId: logId }`
- [ ] `ImpersonationLog` record created on start: `superAdminId`, `targetUserId`, `targetTenantId`, `reason`, `startedAt`, `expiresAt` (30 min from now), `endedAt: null`
- [ ] `POST /super-admin/impersonate/:impersonationId/end` — sets `endedAt = now()` on the log record; guarded by `SuperAdminGuard`
- [ ] `GET /super-admin/impersonation-logs` — paginated list of all impersonation sessions, guarded by `SuperAdminGuard`
- [ ] `StartImpersonationDto` validates: `targetUserId` (UUID), `targetTenantId` (UUID), `reason` (optional string, max 500 chars)
- [ ] Impersonation JWT is signed with the same `JWT_SECRET` but includes `isImpersonation: true` so guards can distinguish it
- [ ] `JwtAuthGuard` and `TenantMembershipGuard` must continue to work with impersonation JWTs (no changes to existing guard logic beyond accepting the new payload shape)
- [ ] Unit tests: impersonation start creates log, end sets `endedAt`, expired impersonation log records are queryable
- [ ] E2E test: SuperAdmin starts impersonation → receives JWT → uses JWT on a tenant endpoint → ends session → log shows `endedAt`

## Context

The `ImpersonationLog` model is already in `backend/prisma/schema.prisma` — no schema migration needed.

Impersonation JWTs must NOT be refreshable. The short TTL (30 min) is the only session duration; no refresh endpoint should accept an impersonation token.

MISSION.md immutable constraint: "SuperAdmin impersonation is always audited — every impersonation session logged to `public.impersonation_logs` with userId, targetTenantId, startTime, endTime."

SuperAdmin impersonation lives in `platform/super-admin/` — not a protected path — so factory can implement this without human escalation.
