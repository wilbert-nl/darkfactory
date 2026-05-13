---
id: "024"
title: "Create admin Dashboard page"
phase: "P6"
task_id: "P6-T9"
priority: "high"
estimated_hours: 3
status: "done"
created_at: "2026-04-23"
attempts: 0
last_attempt: null
failure_notes: null
---

## Description

Build `pages/admin/DashboardPage.vue` — the landing page for authenticated tenant users after login. Shows summary stats and quick-access cards.

## Acceptance Criteria

- [ ] `pages/admin/DashboardPage.vue` under `AdminLayout`
- [ ] Summary stat cards: total products (active), total reservations (today), total orders (pending), total users
- [ ] Stats fetched from existing API endpoints (products list count, reservations list count, orders list count, users list count)
- [ ] Loading skeleton cards while data loads (`q-skeleton`)
- [ ] Quick-action buttons: "New Product", "New Reservation", "Invite User" — navigate to respective pages
- [ ] Shows tenant name and logo in page header
- [ ] Role-aware: TenantUser sees read-only stats; TenantOwner sees full stats + quick actions
- [ ] Mobile-responsive grid (2-col on mobile, 4-col on desktop)
- [ ] `npm run typecheck` passes

## Context

No separate dashboard API endpoint exists — aggregate data from existing GET endpoints. Use `Promise.all` to fetch in parallel. Stats should show a `-` dash rather than an error if any individual fetch fails (graceful degradation).
