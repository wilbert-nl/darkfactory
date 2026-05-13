---
id: "040"
title: "Add sample laundry shop seed data"
phase: "P3"
task_id: "P3-T3"
priority: "medium"
estimated_hours: 3
status: "untriaged"
created_at: "2026-04-23"
attempts: 0
last_attempt: null
failure_notes: null
---

## Description

Create a seed script that populates the database with a realistic laundry shop tenant for local development and demo purposes. MISSION.md lists "Sample laundry shop SQL seed data" as a required infrastructure deliverable.

## Acceptance Criteria

- [ ] Seed script at `backend/prisma/seed.ts`, registered in `backend/package.json` under `"prisma": { "seed": "ts-node prisma/seed.ts" }`
- [ ] Seed creates one SuperAdmin user: `admin@platform.com` / `Password123!`
- [ ] Seed creates one tenant: slug `laundry-demo`, name `Clean & Fresh Laundry`, status `active`
- [ ] Seed provisions the tenant schema (calls migration runner for `laundry-demo` tenant)
- [ ] Seed creates one TenantOwner user: `owner@laundry-demo.com` / `Password123!`, linked to `laundry-demo` with role `owner`
- [ ] Seed creates one TenantUser: `staff@laundry-demo.com` / `Password123!`, linked to `laundry-demo` with role `staff`
- [ ] Seed creates 5+ laundry product categories: e.g. "Wash & Fold", "Dry Cleaning", "Ironing", "Bedding", "Shoes"
- [ ] Seed creates 10+ products in the `laundry-demo` tenant schema with realistic prices and `metadata` JSON (e.g. `{ "unit": "kg", "minWeight": 1 }`)
- [ ] Seed creates 3 open reservation slots (future dates) for demo purposes
- [ ] Seed is idempotent — running it twice does not create duplicate records (use upsert or delete-then-insert with known IDs)
- [ ] `npm run db:seed` script added to `backend/package.json`
- [ ] Running `npm run db:seed` completes without errors against a fresh DB
- [ ] Seed file documents all demo credentials in a comment block at the top

## Context

Use `PrismaTenancyService` (or the migration runner service) for tenant schema provisioning — do not call the migration runner's internal methods directly.

For tenant-scoped data (products, reservations), use the tenant Prisma client obtained via `PrismaTenancyService.getClientForCurrentTenant()`. You may need to set up the tenant context manually inside the seed script using `TenantContextService.run(tenantId, callback)`.

All passwords must be hashed with bcrypt (rounds: 12) — never store plaintext.

This is a dev/demo artifact only. The seed script must never run automatically in production (guard with `NODE_ENV !== 'production'` check).
