# Mission: Multi-Tenant SaaS Platform

## What This Builds

A reusable multi-tenant SaaS platform using **NestJS**, **PostgreSQL** (schema-per-tenant), and **Quasar**. The platform provides a generic foundation — tenant management, authentication, white-label theming, products, reservations, orders — that any vertical business (laundry shop, coffee shop, massage spa) can deploy without code changes to the core.

---

## Primary Users

| Role | Description |
|------|-------------|
| **SuperAdmin** | Platform operators. Manage all tenants, can impersonate any user (audited, time-limited). |
| **TenantOwner** | Business operators. Manage their tenant's users, roles, products, reservations, settings. |
| **TenantUser** | Staff/employees within a tenant. Access scoped to assigned permissions. |
| **Customer** | Public users. Browse products, make reservations (no login required for public pages). |

---

## In Scope — Factory Can Build

### Core Platform
- Schema-per-tenant PostgreSQL isolation (one schema per tenant)
- Subdomain-based tenant resolution (`tenant1.platform.com`)
- Global user accounts (one login across multiple tenants)
- Tenant membership linking (user ↔ tenant ↔ role)
- JWT authentication (access + refresh tokens)
- Password hashing (bcrypt)
- Password reset flow

### Tenant Management
- SuperAdmin tenant CRUD (create, list, update, suspend)
- Self-service tenant signup (status: `pending` → `active`)
- Tenant schema auto-provisioning on creation
- Per-tenant migration runner

### RBAC
- Core roles: SuperAdmin, TenantOwner, TenantUser
- Custom tenant-scoped roles with permission sets
- Fixed permission enum (no runtime permission additions)
- SuperAdmin impersonation (audited, time-limited, logged)

### White-Label Theming
- Per-tenant: logo, primary color, accent color, font family, tenant name
- Public config endpoint (unauthenticated, for frontend theming)
- Logo upload and storage

### Core Business Modules (Generic)
- **Products**: CRUD, categories, pricing, active/inactive toggle, metadata JSON for vertical extensions
- **Reservations**: Time slots, availability, status workflow, notes, metadata JSON
- **Orders**: Basic order management, order items, status workflow
- **Customers**: Customer profiles linked to reservations/orders

### Frontend (Quasar)
- Single Quasar app adapting at runtime per subdomain
- Dynamic theming based on tenant public config
- Public pages: product listing, reservation booking
- Admin dashboard: users, products, reservations, orders, settings
- SuperAdmin pages: tenant management, impersonation
- Mobile-responsive design

### Infrastructure
- Docker Compose local development (PostgreSQL, Redis, NestJS, Quasar)
- Health check endpoints
- Winston/Pino structured logging
- Jest unit + E2E tests
- Sample laundry shop SQL seed data

---

## Out of Scope — Factory Must Never Build

- **Custom domain support** (`shop.tenant.com`) — subdomain only for MVP
- **OAuth / Magic links / SSO / Social login** — email/password JWT only for MVP
- **Mobile app builds** (Cordova, Capacitor, React Native) — web only
- **Billing / subscriptions / payment processing** — architecture ready but not implemented
- **Custom layout structures** beyond theming (page restructuring, custom page builder)
- **Non-PostgreSQL databases** (no MySQL, MongoDB, SQLite)
- **ORM replacement** — Prisma is the only ORM, do not add TypeORM, Drizzle, or raw SQL
- **PostgreSQL RLS** — application-layer filtering only
- **GraphQL API** — REST only
- **Vertical-specific modules** beyond the laundry seed (no coffee, spa code in MVP)
- **Multi-channel / cross-tenant features** (tenants are strictly isolated)
- **Webhooks or external service integrations** without explicit approval

---

## Immutable Constraints — Cannot Change, Ever

1. **Schema-per-tenant isolation** — each tenant has its own PostgreSQL schema (`tenant_{id}`). Row-level security is explicitly rejected.
2. **Application-layer filtering** — no `SET search_path` tricks; tenant context flows via AsyncLocalStorage.
3. **One global login** — users exist in `public.users`. Tenant membership is a separate table. Never duplicate user accounts per tenant.
4. **Prisma isolated in one module** — only `tenancy/prisma-tenancy/` creates tenant-scoped clients. All other modules receive the client via injection.
5. **Subdomain = tenant resolution** — this is the MVP access method. Do not add header-based resolution without explicit approval.
6. **SuperAdmin impersonation is always audited** — every impersonation session logged to `public.impersonation_logs` with userId, targetTenantId, startTime, endTime.
7. **No secrets in repository** — `.env`, credentials, JWT secrets, API keys must never appear in committed code.
8. **Protected governance files** — MISSION.md, CLAUDE.md, FACTORY_RULES.md cannot be modified by factory processes.

---

## Permitted Evolutions (Future Issues Welcome)

- Add OAuth / social login providers to the flexible auth layer
- Add custom domain support to tenant resolution
- Expand admin UI with analytics dashboard
- Add billing module (Stripe integration)
- Add Cordova mobile build support
- Add vertical-specific modules (coffee, spa) as opt-in plugins
- Add webhook support for tenant-triggered events
- Add PostgreSQL read replica support

---

*This document is human-controlled. Factory agents cannot modify it.*
