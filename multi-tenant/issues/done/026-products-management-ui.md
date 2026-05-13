---
id: "026"
title: "Create products management UI (admin)"
phase: "P6"
task_id: "P6-T11"
priority: "high"
estimated_hours: 5
status: "done"
created_at: "2026-04-23"
attempts: 0
last_attempt: null
failure_notes: null
---

## Description

Build `pages/admin/ProductsPage.vue` — product management for TenantOwners. Full CRUD with category management.

## Acceptance Criteria

- [ ] `pages/admin/ProductsPage.vue` under `AdminLayout`, guarded to `tenant_owner` role
- [ ] Product list: name, category, price, status (active/inactive), image thumbnail
- [ ] Create product dialog: name, description, price, categoryId, metadata JSON (raw textarea for power users), active toggle
- [ ] Edit product: same dialog pre-filled
- [ ] Delete product: confirmation dialog → soft delete (calls `DELETE /products/:id`)
- [ ] Toggle active/inactive: inline switch → `PATCH /products/:id`
- [ ] Category management: separate tab or panel — list, create, delete categories
- [ ] Image/logo upload field (calls `POST /products/:id/image` if endpoint exists, else stores URL string)
- [ ] Server-side pagination and search via `q-table`
- [ ] `$q.notify` for success/error feedback
- [ ] Mobile-responsive
- [ ] `npm run typecheck` passes

## Context

Products API is at `/products/*` (issue #014). Categories at `/products/categories/*`. The `metadata` field is a free-form JSON for vertical extensions — render as a raw JSON textarea in the form. Price stored in cents (integer) in the DB — display as formatted currency in the UI.
