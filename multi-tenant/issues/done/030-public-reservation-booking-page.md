---
id: "030"
title: "Build public reservation booking page"
phase: "P6"
task_id: "P6-T15"
priority: "high"
estimated_hours: 5
status: "done"
created_at: "2026-04-23"
attempts: 0
last_attempt: null
failure_notes: null
---

## Description

Build `pages/public/BookingPage.vue` — customer-facing reservation flow. No login required. Multi-step: select product → pick date/time → enter contact info → confirm.

## Acceptance Criteria

- [ ] `pages/public/BookingPage.vue` under `PublicLayout`, no auth required
- [ ] Step 1: Product selector (pre-selected if `?productId=` query param present)
- [ ] Step 2: Date picker → fetch available time slots (`GET /reservations/availability?date=&productId=`) → slot grid
- [ ] Step 3: Customer info form — firstName, lastName, email, phone (optional), notes (optional)
- [ ] Step 4: Confirmation summary → submit calls `POST /reservations` (public create endpoint)
- [ ] Success screen: booking reference number, date/time, product, customer name
- [ ] Stepper UI via `q-stepper` with back/next navigation
- [ ] Validation on each step before allowing next
- [ ] Slot grid shows unavailable slots as disabled/greyed
- [ ] Fully themed via `useTheme()`
- [ ] Mobile-responsive (single-column wizard)
- [ ] `npm run typecheck` passes

## Context

Public reservation creation endpoint must not require JWT. The `POST /reservations` endpoint must accept a `guestCustomer` object (name, email) in the request body when no auth token is present. If this doesn't exist in the backend (issue #015), file a `needs-human` issue rather than implementing auth bypass logic on the frontend.
