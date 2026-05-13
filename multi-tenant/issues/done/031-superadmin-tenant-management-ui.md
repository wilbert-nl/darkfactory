---
id: "031"
title: "SuperAdmin tenant management UI"
phase: "P6"
task_id: "P6-SA1"
priority: "high"
estimated_hours: 5
status: "done"
created_at: "2026-04-23"
attempts: 0
last_attempt: null
failure_notes: null
---

## Description

Build `pages/admin/superadmin/TenantsPage.vue` — SuperAdmin view to list, create, suspend, and impersonate tenants.

## Acceptance Criteria

- [ ] `pages/admin/superadmin/TenantsPage.vue` under `SuperAdminLayout`, guarded to `superadmin` role
- [ ] Tenant data table: name, slug, status badge (PENDING/ACTIVE/SUSPENDED), plan, createdAt
- [ ] Create tenant dialog: name, slug (auto-generated from name, editable), plan selector
- [ ] Suspend/activate tenant: status toggle with confirmation dialog → `PATCH /superadmin/tenants/:id`
- [ ] Impersonate tenant: "Impersonate" button → calls `POST /superadmin/impersonate` → stores impersonation token in `auth-store`; navigates to `/admin/dashboard` with `SuperAdminLayout` showing impersonation banner
- [ ] End impersonation: banner with "End Session" button → restores original SuperAdmin token
- [ ] Search and filter by status
- [ ] Server-side pagination
- [ ] `$q.notify` on all mutations
- [ ] `npm run typecheck` passes

## Context

Impersonation token returned by `POST /superadmin/impersonate` is a short-lived JWT (15min). Store separately in `auth-store` as `impersonationToken`. The `SuperAdminLayout` impersonation banner must always be visible when `auth-store.isImpersonating === true` — it must not be possible to navigate away without ending the session.
