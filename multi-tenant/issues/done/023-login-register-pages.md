---
id: "023"
title: "Implement Login and Register pages"
phase: "P6"
task_id: "P6-T8"
priority: "high"
estimated_hours: 4
status: "done"
created_at: "2026-04-23"
attempts: 0
last_attempt: null
failure_notes: null
---

## Description

Build `pages/auth/LoginPage.vue` and `pages/auth/RegisterPage.vue` with form validation, error handling, and redirect on success.

## Acceptance Criteria

- [ ] `pages/auth/LoginPage.vue`: email + password fields, submit calls `useAuth().login()`, shows inline error on 401, redirects to `/admin/dashboard` on success
- [ ] `pages/auth/RegisterPage.vue`: firstName, lastName, email, password, confirmPassword fields; submit calls `useAuth().register()`; redirects to login with success message
- [ ] Both pages use `q-form` with class-validator-style rules (inline Quasar validation rules)
- [ ] Loading state on submit button (disabled + spinner while API call in flight)
- [ ] Dynamic branding: tenant logo and name shown above form (via `useTenant()`)
- [ ] Themed with `useTheme()` colors — no hardcoded hex
- [ ] Password field has show/hide toggle
- [ ] Mobile-responsive (single-column card centered on desktop, full-width on mobile)
- [ ] Vitest component tests: renders correctly, shows error on failed login, redirects on success (mock `useAuth`)
- [ ] `npm run typecheck` passes

## Context

Pages use `PublicLayout` (or a minimal auth layout without nav). The register page creates a global user account (public schema user). After registration the user still needs to be added to a tenant — if no tenant membership exists, show a "waiting for tenant invitation" message after login.
