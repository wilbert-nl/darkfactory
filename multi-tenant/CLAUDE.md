# CLAUDE.md — Code Standards & Technical Specification

> **Local dev setup, ports, seed credentials, and known bootstrap fixes:** see [`DEV_SETUP.md`](./DEV_SETUP.md)

## Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Backend framework | NestJS (TypeScript) | Latest stable |
| ORM | Prisma | ONLY ORM; isolated in `tenancy/prisma-tenancy/` |
| Database | PostgreSQL 15+ | Schema-per-tenant |
| Cache / Sessions | Redis 7+ | Via `ioredis` |
| Auth | Passport.js + JWT | `@nestjs/passport`, `passport-jwt` |
| Validation | class-validator + class-transformer | All DTOs |
| Password hashing | bcrypt | `bcryptjs` (pure JS, no native binding issues) |
| Frontend framework | Quasar (Vue 3) | TypeScript, Composition API |
| State management | Pinia | No Vuex |
| HTTP client | Axios (via Quasar boot) | Typed wrappers in `services/api-client.ts` |
| Testing (backend) | Jest | `@nestjs/testing` |
| Testing (frontend) | Vitest | `@testing-library/vue` |
| Package manager | npm | Both backend and frontend |
| Containers | Docker + Docker Compose | Local dev |
| Logging | Winston | Via `nest-winston` |

---

## Repository Layout

```
multi-tenant-platform/
├── backend/                        ← NestJS application
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── config/
│   │   │   ├── database.config.ts
│   │   │   ├── auth.config.ts
│   │   │   ├── redis.config.ts
│   │   │   └── tenant.config.ts
│   │   ├── common/
│   │   │   ├── decorators/        ← @CurrentUser, @TenantId, etc.
│   │   │   ├── filters/           ← GlobalExceptionFilter
│   │   │   ├── guards/            ← Base guard classes
│   │   │   ├── interceptors/      ← LoggingInterceptor
│   │   │   └── utils/
│   │   ├── platform/              ← Platform-level (public schema)
│   │   │   ├── platform.module.ts
│   │   │   ├── auth/
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── strategies/
│   │   │   │   │   └── jwt.strategy.ts
│   │   │   │   ├── guards/
│   │   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   │   └── tenant-membership.guard.ts
│   │   │   │   └── dto/
│   │   │   ├── tenants/
│   │   │   ├── super-admin/
│   │   │   ├── subscriptions/     ← Placeholder, not implemented MVP
│   │   │   └── audit/
│   │   ├── tenancy/               ← Multi-tenancy infrastructure
│   │   │   ├── tenancy.module.ts
│   │   │   ├── tenant-resolution/ ← Subdomain middleware
│   │   │   ├── tenant-context/    ← AsyncLocalStorage service
│   │   │   ├── prisma-tenancy/    ← Schema-aware Prisma client pool
│   │   │   └── migration-runner/  ← Per-tenant migration execution
│   │   ├── core/                  ← Business modules (tenant schemas)
│   │   │   ├── core.module.ts
│   │   │   ├── users/
│   │   │   ├── roles/
│   │   │   ├── products/
│   │   │   ├── reservations/
│   │   │   ├── orders/
│   │   │   └── settings/
│   │   └── verticals/
│   │       └── laundry/           ← Sample seed only (not full module)
│   ├── prisma/
│   │   ├── schema.prisma          ← Public schema definitions
│   │   ├── tenant-schema.prisma   ← Tenant schema template
│   │   └── migrations/
│   ├── test/                      ← E2E tests
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
│
├── frontend/                      ← Quasar application
│   ├── src/
│   │   ├── boot/
│   │   │   ├── auth.ts
│   │   │   ├── tenant.ts
│   │   │   └── api.ts
│   │   ├── layouts/
│   │   │   ├── PublicLayout.vue
│   │   │   ├── AdminLayout.vue
│   │   │   └── SuperAdminLayout.vue
│   │   ├── pages/
│   │   │   ├── public/
│   │   │   ├── admin/
│   │   │   └── auth/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── tenant/
│   │   │   └── forms/
│   │   ├── composables/
│   │   │   ├── useAuth.ts
│   │   │   ├── useTenant.ts
│   │   │   ├── useTheme.ts
│   │   │   └── useApi.ts
│   │   ├── stores/
│   │   │   ├── auth-store.ts
│   │   │   ├── tenant-store.ts
│   │   │   └── theme-store.ts
│   │   ├── services/
│   │   │   ├── api-client.ts      ← ALL axios calls here
│   │   │   ├── auth.service.ts
│   │   │   └── tenant.service.ts
│   │   ├── router/
│   │   │   ├── index.ts
│   │   │   ├── routes.ts
│   │   │   └── guards.ts
│   │   └── types/
│   ├── quasar.config.js
│   └── package.json
│
├── docker-compose.yml
├── .env.example
├── MISSION.md
├── CLAUDE.md
└── FACTORY_RULES.md
```

---

## File Placement Rules

| What | Where |
|------|-------|
| New backend route | `backend/src/{platform\|core}/{module}/{module}.controller.ts` |
| New backend service | `backend/src/{platform\|core}/{module}/{module}.service.ts` |
| DTO | `backend/src/{platform\|core}/{module}/dto/` |
| Guard | `backend/src/{platform\|core}/{module}/guards/` or `common/guards/` if generic |
| Decorator | `backend/src/common/decorators/` |
| Prisma public schema | `backend/prisma/schema.prisma` |
| Prisma tenant schema | `backend/prisma/tenant-schema.prisma` |
| Quasar page | `frontend/src/pages/{public\|admin\|auth}/` |
| Quasar component | `frontend/src/components/{common\|tenant\|forms}/` |
| Quasar composable | `frontend/src/composables/` (prefix `use`) |
| Quasar API call | `frontend/src/services/api-client.ts` ONLY |
| Pinia store | `frontend/src/stores/` (suffix `-store.ts`) |

---

## Running the Project

```bash
# Start infrastructure
docker-compose up -d postgres redis

# Backend
cd backend
npm install
npm run prisma:generate          # Generate Prisma client
npm run prisma:migrate:dev       # Run migrations
npm run start:dev                # Dev server on :3000

# Frontend
cd frontend
npm install
quasar dev                       # Dev server on :9000
```

---

## Testing

### Backend (Jest)
```bash
cd backend
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:cov          # Coverage report
```

**Rules:**
- Use `@nestjs/testing` and `Test.createTestingModule()` for unit tests
- Mock `PrismaTenancyService` using Jest mocks — never hit real DB in unit tests
- E2E tests use a dedicated test database (`DATABASE_URL_TEST`)
- Every new service method needs a unit test
- Every new API endpoint needs an E2E test for happy path + auth failure

### Frontend (Vitest)
```bash
cd frontend
npm run test
```

**Rules:**
- Use `@testing-library/vue` for component tests
- Mock `api-client.ts` with `vi.mock()`
- Test composables in isolation

---

## Lint, Format, Type Check

### Backend
```bash
cd backend
npm run lint             # ESLint
npm run format           # Prettier
npm run typecheck        # tsc --noEmit
```

### Frontend
```bash
cd frontend
npm run lint             # ESLint
npm run typecheck        # vue-tsc --noEmit
```

All four must pass before a PR is valid.

---

## Backend Code Conventions

### Mandatory Rules

1. **Tenant context always via AsyncLocalStorage** — never pass `tenantId` as a function parameter through service chains. Inject `TenantContextService` and call `getCurrentTenantId()`.

2. **Prisma clients only from `PrismaTenancyService`** — never instantiate `PrismaClient` directly in a service. Always inject `PrismaTenancyService` and call `getClientForCurrentTenant()`.

3. **No direct Prisma in controllers** — controllers call services; services use Prisma.

4. **DTOs on all inputs** — every controller method that accepts a body or query params uses a DTO decorated with class-validator.

5. **Typed responses** — every controller method has a return type or response DTO. No `any`.

6. **Guards on all protected routes** — `@UseGuards(JwtAuthGuard)` minimum. Tenant routes add `TenantMembershipGuard`. SuperAdmin routes add `SuperAdminGuard`.

7. **Async everywhere** — all methods returning Promises must be `async`. No `.then()` chains.

8. **No `console.log`** — use injected Logger: `private readonly logger = new Logger(MyService.name)`.

9. **Errors via NestJS exceptions** — `throw new NotFoundException()`, `throw new ForbiddenException()`, etc. No raw `throw new Error()`.

10. **Config via `@nestjs/config`** — read env vars once in `config/*.config.ts`. Never call `process.env` directly in services.

### Naming Conventions

| Thing | Pattern | Example |
|-------|---------|---------|
| Module | `{Name}Module` | `AuthModule` |
| Controller | `{Name}Controller` | `ProductsController` |
| Service | `{Name}Service` | `ProductsService` |
| Guard | `{Name}Guard` | `TenantMembershipGuard` |
| DTO | `{Action}{Name}Dto` | `CreateProductDto`, `UpdateProductDto` |
| Decorator | `@{Name}` | `@CurrentUser()`, `@TenantId()` |
| Enum | `PascalCase` | `TenantStatus`, `ReservationStatus` |

---

## Frontend Code Conventions

1. **All API calls in `services/api-client.ts`** — components and composables import from there. Never use `fetch()` or `axios` directly in components.

2. **Composition API only** — no Options API. Named exports, one component per file.

3. **Typed props** — all component props typed with TypeScript interfaces. No `any`.

4. **Pinia stores for shared state** — no prop-drilling beyond 2 levels. No event buses.

5. **Composables for business logic** — components stay thin. Extract stateful logic to `composables/use*.ts`.

6. **`useTenant()` composable required** — any component that shows tenant-specific content must use `useTenant()` to get the resolved tenant, never read subdomain directly.

7. **Dynamic theming via `useTheme()`** — all color/font references go through the theme composable. Never hardcode brand colors.

8. **Router guards in `router/guards.ts`** — no inline `beforeEach` logic in components.

---

## Database Conventions

### Schema Structure

```
PostgreSQL Database
├── public schema                ← Platform-level tables
│   ├── tenants
│   ├── super_admins
│   ├── global_users             ← One account per person, cross-tenant
│   ├── user_tenant_memberships
│   ├── subscriptions            ← Placeholder, not used in MVP
│   ├── audit_logs
│   └── impersonation_logs
└── tenant_{id} schema           ← Per-tenant, auto-provisioned
    ├── users                    ← Tenant-local user profiles
    ├── roles
    ├── permissions
    ├── user_roles
    ├── role_permissions
    ├── tenant_settings
    ├── products
    ├── product_categories
    ├── reservations
    ├── orders
    ├── order_items
    ├── customers
    └── audit_logs               ← Tenant-level audit (separate from platform)
```

### Rules

1. **Public schema** — never query `public.*` tables from within tenant-scoped code. Platform services query public; core services query tenant schema only.
2. **Tenant schema** — all queries route through `PrismaTenancyService.getClientForCurrentTenant()`.
3. **No cross-tenant queries** — a tenant service cannot read another tenant's schema.
4. **Timestamps** — all tables use `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`.
5. **UUIDs** — all primary keys are UUIDs: `@id @default(uuid())`.
6. **Soft deletes** — use `isActive Boolean @default(true)` + filter in service layer. No hard deletes for user-facing data.
7. **Metadata JSON** — Products and Reservations have `metadata Json?` for vertical-specific extensions. Agents may not add new columns for vertical data; use metadata.

---

## Environment Variables

All reads in `backend/src/config/*.config.ts`. Never call `process.env` directly elsewhere.

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | YES | PostgreSQL connection (public schema) |
| `DATABASE_URL_TEST` | test only | Test database |
| `REDIS_URL` | YES | Redis connection |
| `JWT_SECRET` | YES | JWT signing secret |
| `JWT_REFRESH_SECRET` | YES | Refresh token secret |
| `JWT_EXPIRES_IN` | no | Access token TTL (default: `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | no | Refresh TTL (default: `7d`) |
| `PORT` | no | API port (default: `3000`) |
| `CORS_ORIGINS` | no | Comma-separated allowed origins |
| `FILE_UPLOAD_DIR` | no | Logo upload path (default: `./uploads`) |

**Never commit `.env` files.** Use `.env.example` with placeholder values.

---

## Protected Paths — Auto-Reject If Touched Without Explicit Issue

| Path | Reason |
|------|--------|
| `backend/src/platform/auth/` | Authentication is security-critical |
| `backend/src/tenancy/prisma-tenancy/` | Core isolation mechanism |
| `backend/src/tenancy/tenant-context/` | AsyncLocalStorage; bugs leak tenant data |
| `backend/src/common/guards/` | Guard changes affect all protected routes |
| `docker-compose.yml` | Infrastructure changes need human review |
| `.env.example` | Only add, never remove existing vars |
| `MISSION.md`, `CLAUDE.md`, `FACTORY_RULES.md` | Governance |

---

## Known Footguns

1. **AsyncLocalStorage context loss in callbacks** — if you use `setTimeout`, `setInterval`, or any callback-based API inside a request handler, the AsyncLocalStorage context may be lost. Use `async/await` and `Promise` chains only.

2. **Prisma schema-switching** — `PrismaClient` does NOT support switching schemas at runtime. The `PrismaTenancyService` creates a separate client per tenant with the schema baked into the connection URL. Never try to `SET search_path` after connection.

3. **Migration runner isolation** — tenant migrations must run on the tenant schema client, not the public schema client. Always use the tenant-specific connection string.

4. **Quasar SSR** — this project is SPA mode, not SSR. Never use SSR-specific Quasar APIs.

5. **Subdomain resolution in localhost** — local dev uses the `X-Tenant-Slug` header as fallback when no subdomain is present (localhost has no subdomain). This is dev-only and must not be deployed.

---

## Commit & PR Conventions

- **Commit messages**: Conventional commits — `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`. Subject < 72 chars. Body explains *why*.
- **PR title**: Same prefix, < 72 chars.
- **PR body**: Must include `Closes issue/in-progress/{filename}` so the factory can track state.
- **One issue per PR** — never bundle multiple issues.
- **New dependencies**: PR body must include a "Dependencies" section: what, why existing won't work, maintenance status.
- **Max 500 lines** changed per PR (excluding generated files like `package-lock.json`).

---

## Dos and Don'ts

**Do:**
- Read MISSION.md and FACTORY_RULES.md before starting any implementation
- Run `npm run lint && npm run typecheck && npm run test` before marking ready for review
- Use `PrismaTenancyService` for all tenant data access
- Write unit tests for every service method you add
- Use `TenantContextService.getCurrentTenantId()` — never accept tenantId as a parameter

**Don't:**
- Instantiate `PrismaClient` directly in any service outside `tenancy/prisma-tenancy/`
- Access `public.*` tables from `core/` modules
- Access `tenant_*` tables from `platform/` modules (except through defined interfaces)
- Add state management libraries beyond Pinia
- Call `process.env` directly (use config service)
- Modify auth guards, tenant context, or Prisma tenancy without an explicit security issue filed
- Leave `TODO` comments without a linked issue number

---

*This document is human-controlled. Factory agents cannot modify it.*
