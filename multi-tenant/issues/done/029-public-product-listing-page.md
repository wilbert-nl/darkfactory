---
id: "029"
title: "Implement public product listing page"
phase: "P6"
task_id: "P6-T14"
priority: "high"
estimated_hours: 4
status: "done"
created_at: "2026-04-23"
attempts: 0
last_attempt: null
failure_notes: null
---

## Description

Build `pages/public/ProductsPage.vue` — unauthenticated public-facing product catalog. Dynamic theming from tenant config. Entry point for customers.

## Acceptance Criteria

- [ ] `pages/public/ProductsPage.vue` under `PublicLayout`, no auth required
- [ ] Fetches products via `GET /products?public=true` (public read endpoint, no JWT required)
- [ ] Card grid: product image (or placeholder), name, category badge, price, "Book Now" button
- [ ] Filter by category: tab/chip group at top filters product cards client-side
- [ ] Search bar: client-side filter by product name
- [ ] Empty state: friendly message when no products available
- [ ] "Book Now" → navigates to `/reservations?productId=:id` (public reservation page)
- [ ] Loading skeleton grid while fetching
- [ ] Fully themed via `useTheme()` — primary color for buttons and accents
- [ ] Mobile-responsive (1-col mobile, 2-col tablet, 3-col desktop)
- [ ] SEO: `<title>` set to `{tenantName} — Products` via Quasar's `useMeta()`
- [ ] `npm run typecheck` passes

## Context

No authentication required for this page. Calls unauthenticated public endpoints only. The `api-client.ts` must NOT inject the auth header for public endpoints — use a separate unauthenticated Axios instance or strip auth header when no token exists.
