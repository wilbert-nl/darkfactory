---
id: "018"
title: "Create tenant resolution composable (subdomain)"
phase: "P6"
task_id: "P6-T2"
priority: "high"
estimated_hours: 4
status: "done"
created_at: "2026-04-23"
attempts: 0
last_attempt: null
failure_notes: null
---

## Description

Implement `composables/useTenant.ts` that resolves the current tenant from the subdomain, fetches the tenant's public config from the API, and exposes it to all components.

## Acceptance Criteria

- [ ] `composables/useTenant.ts` extracts subdomain from `window.location.hostname`
- [ ] Falls back to `X-Tenant-Slug` header simulation in localhost dev (reads from `localStorage` key `dev_tenant_slug`)
- [ ] Calls `GET /api/tenants/:slug/public-config` on first load and caches result in `stores/tenant-store.ts`
- [ ] Exposes: `tenant`, `tenantSlug`, `isLoading`, `isResolved`, `error`
- [ ] `stores/tenant-store.ts` (Pinia) holds tenant public config: `name`, `slug`, `primaryColor`, `accentColor`, `fontFamily`, `logoUrl`, `status`
- [ ] `boot/tenant.ts` calls `useTenant()` before app mounts; redirects to error page if tenant not found
- [ ] Vitest unit test for composable (mock API call)
- [ ] `npm run typecheck` passes

## Context

The localhost fallback (`localStorage` key `dev_tenant_slug`) is dev-only and must be gated behind `process.env.NODE_ENV === 'development'`. Never deploy the header-based workaround (see CLAUDE.md Known Footguns #5). Any component that shows tenant-specific content must use `useTenant()` — never read `window.location` directly in components.
