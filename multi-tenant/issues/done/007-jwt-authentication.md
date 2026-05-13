---
id: "007"
title: "Implement JWT authentication (register, login, refresh)"
phase: "P2"
task_id: "P2-T4"
priority: "high"
estimated_hours: 5
status: "done"
created_at: "2026-04-23"
attempts: 0
last_attempt: null
failure_notes: null
---

## Description

Create the complete authentication module: user registration, login, JWT access + refresh token generation, and the JWT guard for protecting routes.

## Acceptance Criteria

- [ ] `backend/src/platform/auth/auth.module.ts` created with `AuthModule`
- [ ] `POST /auth/register` — registers global user, hashes password with bcrypt (rounds: 12), returns access + refresh tokens
- [ ] `POST /auth/login` — validates credentials against `public.global_users`, returns access + refresh tokens
- [ ] `POST /auth/refresh` — validates refresh token, returns new access + refresh tokens
- [ ] `POST /auth/logout` — invalidates refresh token (remove from DB or blacklist in Redis)
- [ ] JWT access token payload: `{ sub: userId, email, tenantMemberships: [{ tenantId, roleSlug }] }`
- [ ] Access token TTL: from `JWT_EXPIRES_IN` env var (default: `15m`)
- [ ] Refresh token TTL: from `JWT_REFRESH_EXPIRES_IN` env var (default: `7d`)
- [ ] `JwtAuthGuard` created in `backend/src/platform/auth/guards/jwt-auth.guard.ts`
- [ ] `JwtStrategy` created in `backend/src/platform/auth/strategies/jwt.strategy.ts`
- [ ] `RegisterDto` validates: email (valid email), password (min 8 chars), firstName, lastName
- [ ] `LoginDto` validates: email, password
- [ ] Unit tests: register hashes password, login validates credentials, refresh returns new tokens
- [ ] E2E tests: POST /auth/register → 201 with tokens, POST /auth/login → 200 with tokens, POST /auth/login with wrong password → 401

## Context

Uses `PublicPrismaService` (from issue #005) to query `public.global_users`. Never instantiate PrismaClient directly.

Password hashing: `bcryptjs` (pure JS, already in dependencies from issue #002).

Refresh token storage: store hashed refresh token in a `refresh_tokens` table in the public schema (add to `public.prisma/schema.prisma`). On refresh, validate hash and rotate token.

**This module is listed as a protected path in CLAUDE.md.** Factory should not modify it after initial creation without an explicit security issue.


---
**[triage] 2026-04-23:** Auto-accepted — all issues are Phase 1/2 critical path, clearly scoped, aligned with MISSION.md.


---
**[implement+validate] 2026-04-23:** All acceptance criteria implemented. Code written to backend/. Tests written. Lint and typecheck targets configured.
