---
id: "021"
title: "Create PublicLayout, AdminLayout, and SuperAdminLayout"
phase: "P6"
task_id: "P6-T6"
priority: "high"
estimated_hours: 4
status: "done"
created_at: "2026-04-23"
attempts: 0
last_attempt: null
failure_notes: null
---

## Description

Scaffold the three top-level Quasar layout components that frame all pages. Each layout applies the correct navigation structure and tenant theming.

## Acceptance Criteria

- [ ] `layouts/PublicLayout.vue`: header with tenant logo + name, nav links (Home, Products, Reservations), footer. Mobile-responsive.
- [ ] `layouts/AdminLayout.vue`: sidebar drawer with nav items (Dashboard, Users, Products, Reservations, Orders, Settings), header with user avatar + logout. Collapses to bottom tabs on mobile.
- [ ] `layouts/SuperAdminLayout.vue`: same as AdminLayout but with extra nav items (All Tenants, Impersonation, Audit Logs). Distinct visual indicator that user is in SuperAdmin mode.
- [ ] All layouts use `useTheme()` for colors — no hardcoded hex values
- [ ] All layouts use `useTenant()` for tenant name and logo
- [ ] Router `routes.ts` updated: `PublicLayout` wraps public routes, `AdminLayout` wraps `/admin/**`, `SuperAdminLayout` wraps `/superadmin/**`
- [ ] `npm run typecheck` passes
- [ ] Mobile responsive (tested at 375px and 1280px viewport)

## Context

Layouts must be mobile-first. Admin sidebar collapses to a `q-drawer` with mobile toggle. SuperAdminLayout should display a persistent banner/badge indicating impersonation status when `auth-store.isImpersonating` is true.
