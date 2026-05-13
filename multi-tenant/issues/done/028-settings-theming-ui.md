---
id: "028"
title: "Create settings and theming UI (admin)"
phase: "P6"
task_id: "P6-T13"
priority: "high"
estimated_hours: 4
status: "done"
created_at: "2026-04-23"
attempts: 0
last_attempt: null
failure_notes: null
---

## Description

Build `pages/admin/SettingsPage.vue` — TenantOwner can update tenant branding (colors, font, logo) and general settings. Changes apply in real-time to the app.

## Acceptance Criteria

- [ ] `pages/admin/SettingsPage.vue` under `AdminLayout`, guarded to `tenant_owner` role
- [ ] Branding tab: primary color picker (`q-color`), accent color picker, font family selector (dropdown of 5 safe web fonts), logo upload
- [ ] Live preview panel: shows how header would look with chosen colors/font before saving
- [ ] Save button: calls `PUT /tenant-settings` (issue #013); on success, updates `tenant-store` and re-applies theme via `useTheme()`
- [ ] General tab: tenant name (read-only display), contact info fields if exposed by API
- [ ] Logo upload: file input accepting PNG/JPG, calls upload endpoint, shows preview thumbnail
- [ ] Unsaved changes indicator — warn before navigating away if form is dirty
- [ ] `$q.notify` on save success/error
- [ ] Mobile-responsive
- [ ] `npm run typecheck` passes

## Context

Settings API at `/tenant-settings/*` (issue #013). Public config endpoint at `GET /tenants/:slug/public-config` — after saving, re-fetch public config and update `tenant-store` so `useTheme()` re-applies instantly. Theme changes must be reactive (not require page reload).
