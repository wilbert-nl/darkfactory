---
id: "027"
title: "Build reservation management UI (admin)"
phase: "P6"
task_id: "P6-T12"
priority: "high"
estimated_hours: 5
status: "done"
created_at: "2026-04-23"
attempts: 0
last_attempt: null
failure_notes: null
---

## Description

Build `pages/admin/ReservationsPage.vue` — reservation management for TenantOwners and TenantUsers. Table + calendar view.

## Acceptance Criteria

- [ ] `pages/admin/ReservationsPage.vue` under `AdminLayout`
- [ ] Default view: `q-table` listing reservations — customerName, date, time slot, status, productName
- [ ] Toggle to calendar view (`q-date` or simple day grid showing reservations per slot)
- [ ] Create reservation dialog: date picker, time slot selector (fetched from availability endpoint), customer name/email, notes, productId
- [ ] Status workflow actions: `PENDING → CONFIRMED → COMPLETED`, `CANCELLED` from any state — via `PATCH /reservations/:id/status`
- [ ] Filter by date range and status
- [ ] Reservation detail drawer/dialog showing full info + metadata
- [ ] Server-side pagination + date range filter passed as query params
- [ ] `$q.notify` on status change success/error
- [ ] TenantUser can view but cannot cancel/complete (guarded by role check in UI)
- [ ] Mobile-responsive
- [ ] `npm run typecheck` passes

## Context

Reservations API at `/reservations/*` (issue #015). Availability slots returned by `GET /reservations/availability?date=YYYY-MM-DD&productId=uuid`. The `metadata` field is display-only in admin — show as formatted JSON read-only block.
