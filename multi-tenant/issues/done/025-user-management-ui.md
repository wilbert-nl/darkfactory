---
id: "025"
title: "Build user management UI (admin)"
phase: "P6"
task_id: "P6-T10"
priority: "high"
estimated_hours: 5
status: "done"
created_at: "2026-04-23"
attempts: 0
last_attempt: null
failure_notes: null
---

## Description

Build `pages/admin/UsersPage.vue` — a full user management interface for TenantOwners to list, invite, update roles, and deactivate tenant users.

## Acceptance Criteria

- [ ] `pages/admin/UsersPage.vue` under `AdminLayout`, guarded to `tenant_owner` role
- [ ] Data table listing tenant users: name, email, role, status (active/inactive), createdAt
- [ ] Invite user flow: dialog with email + role selector → calls `POST /tenants/users/invite`
- [ ] Update role: inline dropdown or edit dialog → calls `PATCH /tenants/users/:userId/role`
- [ ] Deactivate/reactivate user: toggle → calls `PATCH /tenants/users/:userId/status`
- [ ] Search/filter by name or email (client-side filter on loaded data)
- [ ] Pagination via `q-table` server-side pagination (page, limit params sent to API)
- [ ] Success/error toast notifications via `$q.notify`
- [ ] Confirmation dialog before deactivating a user
- [ ] Mobile-responsive table (collapses to card list on mobile)
- [ ] Vitest component test: renders table, opens invite dialog (mock API)
- [ ] `npm run typecheck` passes

## Context

All API calls through `services/api-client.ts`. User management endpoints are at `/tenants/users/*` (built in issue #012). Role options available: `tenant_owner`, `tenant_user`, plus any custom roles from the tenant's roles endpoint.
