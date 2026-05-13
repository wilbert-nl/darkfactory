---
id: "020"
title: "Build TenantThemeProvider and useTheme composable"
phase: "P6"
task_id: "P6-T5"
priority: "high"
estimated_hours: 4
status: "done"
created_at: "2026-04-23"
attempts: 0
last_attempt: null
failure_notes: null
---

## Description

Implement dynamic white-label theming: inject tenant's `primaryColor`, `accentColor`, and `fontFamily` into Quasar's CSS variables at runtime. Components must never hardcode brand colors.

## Acceptance Criteria

- [ ] `composables/useTheme.ts` reads theme from `tenant-store` and applies CSS variables to `:root` via `document.documentElement.style.setProperty`
- [ ] Sets Quasar brand variables: `--q-primary`, `--q-secondary`, `--q-accent` from tenant config
- [ ] Sets `--q-font-family` from tenant `fontFamily` (falls back to `'Inter, sans-serif'`)
- [ ] `components/tenant/TenantThemeProvider.vue` wrapper component — mounts once in `App.vue`, calls `useTheme()` reactively
- [ ] Theme re-applies if `tenant-store` updates (reactive watch)
- [ ] Logo displayed via `tenant.logoUrl` with fallback to text-based tenant name if no logo
- [ ] Vitest test: applying theme sets correct CSS variables (mock `document.documentElement`)
- [ ] `npm run typecheck` passes

## Context

All color/font references in components must go through `useTheme()` or Quasar's `$q.dark` / CSS variable system. Never hardcode `#hexcolor` in Vue files. This is the white-label foundation — must be reactive so SuperAdmin impersonation can switch tenant context cleanly.
