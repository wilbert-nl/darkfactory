---
id: "038"
title: "Implement password reset flow (forgot + reset)"
phase: "P3"
task_id: "P3-T1"
priority: "high"
estimated_hours: 4
status: "untriaged"
created_at: "2026-04-23"
attempts: 0
last_attempt: null
failure_notes: null
---

## Description

Implement the forgot-password / reset-password flow for global users. This is explicitly listed in MISSION.md as a Core Platform requirement. The flow: user requests a reset link → a signed token is generated and stored → user submits the new password with the token → token is validated and consumed.

For MVP, no email sending is required — the reset token is returned directly in the API response (or logged). A real email transport can be added in a future issue.

## Acceptance Criteria

- [ ] `POST /auth/forgot-password` — accepts `{ email }`, looks up `global_users`, generates a time-limited reset token (UUID or JWT, expires in 1 hour), stores the hashed token + expiry in a `password_reset_tokens` table in the public schema
- [ ] `POST /auth/reset-password` — accepts `{ token, newPassword }`, validates token (exists, not expired, not used), hashes new password with bcrypt (rounds: 12), updates `global_users.passwordHash`, marks token as used
- [ ] `password_reset_tokens` table added to `backend/prisma/schema.prisma` with fields: `id`, `userId`, `tokenHash`, `expiresAt`, `usedAt?`, `createdAt`
- [ ] Migration generated and applied
- [ ] Returns `200 OK` with `{ message: "Password reset successful" }` on success
- [ ] Returns `400 Bad Request` if token is invalid, expired, or already used
- [ ] Always returns `200` for `forgot-password` even if email not found (prevents user enumeration)
- [ ] `ForgotPasswordDto` validates: email (valid email format)
- [ ] `ResetPasswordDto` validates: token (non-empty string), newPassword (min 8 chars)
- [ ] Unit tests: token generation, token validation, expired token rejection, already-used token rejection
- [ ] E2E test: full happy path (forgot → reset → login with new password succeeds)

## Context

This feature touches `platform/auth/` which is a **protected path** in CLAUDE.md. Per FACTORY_RULES.md, this issue must be escalated to `needs-human` at triage unless a security-aware human explicitly approves it.

Do not add an email transport (SMTP, SendGrid) — out of scope for MVP. Token value returned in response body is acceptable for MVP.

Use `PublicPrismaService` to query public schema. Never instantiate `PrismaClient` directly.
