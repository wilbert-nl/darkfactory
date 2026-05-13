# Multi-Tenant SaaS Platform Architecture & Implementation Plan

## Executive Summary

This document provides a comprehensive architecture and implementation plan for a reusable multi-tenant SaaS platform built with **NestJS**, **PostgreSQL**, and **Quasar**. The platform supports schema-per-tenant data isolation, white-labeling, subdomain-based access, and is designed to be generic enough for multiple verticals (laundry shops, coffee shops, massage spas, etc.).

---

## Table of Contents

1. [Clarifying Questions & Decisions](#1-clarifying-questions--decisions)
2. [Research Findings](#2-research-findings)
3. [Architecture Recommendations](#3-architecture-recommendations)
4. [Implementation Phases](#4-implementation-phases)
5. [Smallest Executable Tasks](#5-smallest-executable-tasks)
6. [Reusable Vertical Design](#6-reusable-vertical-design)
7. [AI-Friendly Execution Plan](#7-ai-friendly-execution-plan)
8. [Summary & Next Steps](#8-summary--next-steps)

---

## 1. Clarifying Questions & Decisions

### 1.1 Tenant Data Isolation
- **Approach**: Schema-per-tenant
- **Shared/Public Schema**: Platform-level data (tenants, super_admins, subscriptions, audit logs)
- **Tenant Schemas**: Each tenant has isolated schema with users, roles, products, reservations, orders

### 1.2 Row-Level Security
- **Decision**: Application-layer filtering (not PostgreSQL RLS)
- **Rationale**: Schema isolation already separates tenant data; simpler to implement and maintain

### 1.3 Authentication
- **MVP**: Email/password with JWT
- **Future**: Magic links, OAuth, Social login, SSO
- **Architecture**: Flexible auth layer for easy extension

### 1.4 Account Model
- **Approach**: One global login per person
- **Multi-tenancy**: Users can belong to multiple tenants via tenant memberships

### 1.5 SuperAdmin Impersonation
- **Enabled**: Yes, for support and troubleshooting
- **Requirements**: Auditable, time-limited, logged

### 1.6 Tenant Access
- **MVP**: Subdomain-based (`tenant1.platform.com`)
- **Future**: Custom domains (`shop.tenant1.com`)

### 1.7 Tenant Creation
- **Support**: Both SuperAdmin-created and self-service signup
- **Self-service**: Can be marked as `pending` for approval

### 1.8 White-Labeling
- **MVP**: Logo, colors, fonts, tenant name, theme settings
- **Future**: Custom layouts, page structure changes

### 1.9 Layout Customization
- **MVP**: Theming only
- **Future**: Custom layouts as separate enhancement

### 1.10 Platform Scope
- **Approach**: Fully generic from day one
- **Demo**: SQL seed for sample vertical (laundry shop)
- **Core Concepts**: Products, reservation-based services

### 1.11 Vertical Modules
- **MVP**: Products and Reservations modules
- **Future**: Split into separate codebases
- **Architecture**: Modular design for vertical plugins

### 1.12 User Management
- **SuperAdmin**: Manages platform-level users and permissions
- **TenantOwner**: Manages tenant-level users and permissions

### 1.13 Custom Roles
- **Core Roles**: SuperAdmin, TenantOwner, TenantUser
- **Custom**: Tenant-scoped custom roles with fixed permission system

### 1.14 Frontend Structure
- **Approach**: One Quasar app adapting at runtime
- **Support**: Cordova builds for multi-platform
- **Routes**: Public pages, admin dashboard, SuperAdmin pages

### 1.15 Public & Admin Routes
- **Same App**: Public-facing and admin in one Quasar app
- **Separation**: Different routes for public vs admin

### 1.16 Design Priority
- **Focus**: Simplicity over scalability
- **Goal**: Maintainable, reusable, easy to extend

### 1.17 Expected Scale
- **Target**: Hundreds of tenants
- **Approach**: Practical for moderate SaaS, no premature optimization

### 1.18 ORM Preference
- **Primary**: Prisma
- **Flexibility**: ORM logic isolated in single module
- **Future**: Interface-based for potential ORM replacement

### 1.19 Billing
- **Status**: Later milestone, not MVP
- **Architecture**: Ready for integration from start

### 1.20 Deployment
- **Approach**: Docker-first
- **Components**: PostgreSQL, Redis, NestJS API, Quasar app
- **Cloud**: Cloud-agnostic design

---

## 2. Research Findings

### 2.1 Repositories Analyzed

| Repository | Multi-Tenancy | ORM | Pros | Cons | Fit |
|------------|---------------|-----|------|------|-----|
| **reymi-tech/nestjs-multitenant** | Schema-per-tenant | TypeORM/Drizzle | Complete solution, auto schema creation, multiple resolution strategies | Spanish docs, relatively new | ⭐⭐⭐⭐ |
| **darioielardi/nestjs-prisma-multitenant** | Schema-per-tenant | Prisma | Clean Prisma integration | Minimal, just a demo | ⭐⭐⭐ |
| **LucaScorpion/nestjs-typeorm-schema-multitenancy** | Schema-per-tenant | TypeORM | Well-documented, LRU connection cache | TypeORM only | ⭐⭐⭐ |
| **sabinadams/nestjs-prisma-module** | Database-per-tenant | Prisma | Mature, multiple DBs | Wrong isolation level | ⭐⭐ |
| **saadamir1/nestjs-multitenant-foundation** | Row-level | TypeORM | Full SaaS features, GraphQL | GraphQL-only, row-level | ⭐⭐ |
| **moofoo/nestjs-prisma-postgres-tenancy** | Schema-per-tenant + RLS | Prisma | Multiple patterns, frontend demo | Uses PostgreSQL RLS | ⭐⭐⭐ |

### 2.2 Recommended Base Repository

**Primary Recommendation**: Custom implementation combining:
- **Tenant resolution** from `reymi-tech/nestjs-multitenant`
- **Prisma integration** from `darioielardi/nestjs-prisma-multitenant`
- **Connection pooling** patterns from `LucaScorpion/nestjs-typeorm-schema-multitenancy`

**Rationale**: No single repository perfectly matches Prisma + schema-per-tenant requirements. A custom implementation combining the best patterns is optimal.

### 2.3 Supporting References

- **Tenant Resolution**: `reymi-tech/nestjs-multitenant` (subdomain, header, JWT strategies)
- **Prisma Schema Management**: `darioielardi/nestjs-prisma-multitenant`
- **Connection Management**: LRU cache pattern from `LucaScorpion/nestjs-typeorm-schema-multitenancy`
- **White-label Theming**: Custom implementation needed (no good open-source examples)

---

## 3. Architecture Recommendations

### 3.1 Tenancy Model: Schema-Per-Tenant

```
PostgreSQL Database
├── public schema (platform-level)
│   ├── tenants (registry)
│   ├── super_admins
│   ├── subscriptions
│   ├── feature_catalog
│   ├── audit_logs
│   └── impersonation_logs
├── tenant_abc123 schema
│   ├── users
│   ├── roles
│   ├── permissions
│   ├── products
│   ├── reservations
│   ├── orders
│   └── tenant_settings
├── tenant_def456 schema
│   └── ... (same tables, isolated data)
└── tenant_xyz789 schema
    └── ... (same tables, isolated data)
```

**Why Schema-Per-Tenant:**
- ✅ Strong data isolation (better than row-level)
- ✅ Simpler queries (no tenant_id filters everywhere)
- ✅ Easier tenant-specific migrations
- ✅ Better security (schema-level boundaries)
- ✅ Fits "hundreds of tenants" scale perfectly
- ✅ Simpler backup/restore per tenant

**Trade-offs:**
- More complex migration management (run per schema)
- Higher connection count (mitigated with connection pooling)

### 3.2 Authentication & RBAC Structure

**Authentication Flow:**
1. User logs in with email/password
2. System validates credentials against public.users (global accounts)
3. System returns JWT with: userId, email, tenantMemberships[]
4. Frontend stores JWT

**Tenant Access Flow:**
1. User accesses `tenant1.platform.com`
2. Middleware resolves tenant from subdomain → tenantId
3. Guard validates user has membership in tenantId
4. Request-scoped Prisma client connects to `tenant_{tenantId}` schema
5. All queries automatically scoped to that tenant

**Core Permissions (Fixed):**
```typescript
enum CorePermission {
  USERS_READ = 'users:read',
  USERS_CREATE = 'users:create',
  USERS_UPDATE = 'users:update',
  USERS_DELETE = 'users:delete',
  PRODUCTS_READ = 'products:read',
  PRODUCTS_MANAGE = 'products:manage',
  RESERVATIONS_READ = 'reservations:read',
  RESERVATIONS_MANAGE = 'reservations:manage',
  SETTINGS_READ = 'settings:read',
  SETTINGS_WRITE = 'settings:write',
  BILLING_READ = 'billing:read',
  BILLING_MANAGE = 'billing:manage',
}
```

**Roles:**
- **SuperAdmin**: Platform-level, can impersonate, manage all tenants
- **TenantOwner**: Full access within their tenant, can manage users/roles
- **TenantUser**: Standard user within tenant (configurable permissions)
- **Custom Roles**: Tenant-defined roles with permission sets

### 3.3 NestJS Module Structure

```
src/
├── main.ts                          # Application entry
├── app.module.ts                    # Root module
├── config/                          # Configuration
│   ├── database.config.ts
│   ├── auth.config.ts
│   └── tenant.config.ts
│
├── common/                          # Shared utilities
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── utils/
│
├── platform/                        # Platform-level modules (public schema)
│   ├── platform.module.ts
│   ├── auth/                        # Global authentication
│   ├── tenants/                     # Tenant registry management
│   ├── super-admin/                 # SuperAdmin operations
│   ├── subscriptions/               # Billing/subscription (future)
│   └── audit/                       # Audit logging
│
├── tenancy/                         # Multi-tenancy infrastructure
│   ├── tenancy.module.ts
│   ├── tenant-resolution/           # Subdomain/header resolution
│   ├── tenant-context/              # AsyncLocalStorage for tenant
│   ├── prisma-tenancy/              # Schema-aware Prisma client
│   └── migration-runner/            # Per-tenant migrations
│
├── core/                            # Core business modules (tenant schemas)
│   ├── core.module.ts
│   ├── users/                       # User management within tenant
│   ├── roles/                       # Role & permission management
│   ├── products/                    # Generic products
│   ├── reservations/                # Generic reservations
│   ├── orders/                      # Generic orders
│   └── settings/                    # Tenant settings & theming
│
└── verticals/                       # Vertical-specific extensions (future)
    ├── laundry/                     # Laundry shop extensions
    ├── coffee/                      # Coffee shop extensions
    └── spa/                         # Massage spa extensions
```

### 3.4 Quasar Folder Structure

```
quasar-tenant-app/
├── src/
│   ├── boot/                        # Quasar boot files
│   │   ├── auth.ts                  # Auth initialization
│   │   ├── tenant.ts                # Tenant resolution
│   │   └── api.ts                   # API client setup
│   │
│   ├── layouts/                     # Layout components
│   │   ├── PublicLayout.vue         # Public tenant pages
│   │   ├── AdminLayout.vue          # Tenant admin dashboard
│   │   └── SuperAdminLayout.vue     # Platform admin (optional)
│   │
│   ├── pages/                       # Route pages
│   │   ├── public/                  # Public-facing pages
│   │   │   ├── Index.vue
│   │   │   ├── Products.vue
│   │   │   └── Reservations.vue
│   │   ├── admin/                   # Admin dashboard
│   │   │   ├── Dashboard.vue
│   │   │   ├── users/
│   │   │   ├── products/
│   │   │   ├── reservations/
│   │   │   └── settings/
│   │   └── auth/                    # Auth pages
│   │       ├── Login.vue
│   │       └── Register.vue
│   │
│   ├── components/                  # Reusable components
│   │   ├── common/                  # Generic UI components
│   │   ├── tenant/                  # Tenant-aware components
│   │   │   ├── TenantLogo.vue
│   │   │   ├── TenantThemeProvider.vue
│   │   │   └── TenantBranding.vue
│   │   └── forms/                   # Form components
│   │
│   ├── composables/                 # Vue composables
│   │   ├── useAuth.ts
│   │   ├── useTenant.ts
│   │   ├── useTheme.ts
│   │   └── useApi.ts
│   │
│   ├── stores/                      # Pinia stores
│   │   ├── auth-store.ts
│   │   ├── tenant-store.ts
│   │   └── theme-store.ts
│   │
│   ├── services/                    # API services
│   │   ├── api-client.ts
│   │   ├── auth.service.ts
│   │   ├── tenant.service.ts
│   │   └── public-config.service.ts
│   │
│   ├── router/                      # Vue Router config
│   │   ├── index.ts
│   │   ├── routes.ts
│   │   └── guards.ts
│   │
│   ├── types/                       # TypeScript types
│   └── utils/                       # Utilities
│
├── quasar.config.js
├── package.json
└── docker-compose.yml
```

### 3.5 Deployment Architecture

```
                    ┌──────────────┐
                    │   Cloudflare  │
                    │    / CDN      │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  NGINX /     │
                    │  Traefik     │  ← SSL termination, subdomain routing
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐      ┌─────▼─────┐      ┌────▼────┐
   │ Quasar  │      │  NestJS   │      │  Redis  │
   │   App   │◄────►│   API     │◄────►│ (cache/ │
   │ (SPA)   │      │           │      │ session)│
   └─────────┘      └─────┬─────┘      └─────────┘
                          │
                    ┌─────▼─────┐
                    │ PostgreSQL│
                    │  (RDS/    │
                    │  Cloud SQL)│
                    └───────────┘
```

**Docker Compose (Local Development):**
- PostgreSQL container
- Redis container
- NestJS API container
- Quasar dev server (or built files served via NGINX)

**Production:**
- Kubernetes or Docker Swarm
- Managed PostgreSQL (RDS, Cloud SQL)
- Managed Redis (ElastiCache, Memorystore)
- Static hosting for Quasar app (S3, CloudFront)
- Container orchestration for NestJS API

---

## 4. Implementation Phases

### Phase 1: Core Infrastructure (Weeks 1-2)
**Goal**: Tenant resolution, database connection, basic auth

**Key Deliverables:**
- Tenant resolution middleware (subdomain-based)
- Schema-per-tenant Prisma client management
- Public schema with tenant registry
- Basic JWT authentication
- Tenant context propagation (AsyncLocalStorage)

### Phase 2: Authentication & User Management (Weeks 3-4)
**Goal**: Complete auth system with multi-tenant user accounts

**Key Deliverables:**
- Global user accounts (public schema)
- Tenant membership system
- Login/Register endpoints
- JWT with tenant membership claims
- Role-based access control (core permissions)
- Password reset flow

### Phase 3: Tenant Management (Weeks 5-6)
**Goal**: SuperAdmin and TenantOwner management tools

**Key Deliverables:**
- SuperAdmin tenant CRUD
- Self-service tenant signup
- Tenant configuration endpoints
- Tenant user management (TenantOwner can invite/manage users)
- Custom role creation per tenant
- SuperAdmin impersonation feature

### Phase 4: White-Label Configuration (Weeks 7-8)
**Goal**: Theming and branding system

**Key Deliverables:**
- Tenant theme/settings model
- Public config endpoint (branding for public pages)
- Logo upload/storage
- Color scheme configuration
- Font selection
- Tenant-specific UI settings

### Phase 5: Core Business Modules (Weeks 9-12)
**Goal**: Generic products and reservations system

**Key Deliverables:**
- Products module (CRUD, categories, pricing)
- Reservations module (time slots, availability, booking)
- Orders module (basic order management)
- Inventory tracking (basic)
- Customer-facing public pages

### Phase 6: Quasar Frontend (Weeks 10-14)
**Goal**: Complete frontend with tenant adaptation

**Key Deliverables:**
- Tenant resolution on frontend (subdomain)
- Dynamic theming based on tenant config
- Public pages (products, reservations)
- Admin dashboard
- User management UI
- Settings/configuration UI
- Mobile-responsive design

### Phase 7: Testing & Deployment (Weeks 13-16)
**Goal**: Production-ready system

**Key Deliverables:**
- Unit tests for services
- E2E tests for critical flows
- Docker setup
- Deployment documentation
- CI/CD pipeline
- Monitoring and logging

---

## 5. Smallest Executable Tasks

### Phase 1: Core Infrastructure

| Task ID | Task | Priority | Est. Hours |
|---------|------|----------|------------|
| P1-T1 | Create PostgreSQL Docker setup with initial schema | High | 2 |
| P1-T2 | Set up NestJS project with Prisma | High | 2 |
| P1-T3 | Create public schema tables: tenants, super_admins | High | 3 |
| P1-T4 | Implement TenantResolutionMiddleware (subdomain extraction) | High | 4 |
| P1-T5 | Create TenantContext service with AsyncLocalStorage | High | 4 |
| P1-T6 | Implement PrismaTenancyService (schema-aware client) | High | 6 |
| P1-T7 | Create tenant schema migration system | High | 5 |
| P1-T8 | Add tenant schema creation on tenant provisioning | Medium | 3 |

### Phase 2: Authentication & User Management

| Task ID | Task | Priority | Est. Hours |
|---------|------|----------|------------|
| P2-T1 | Create public.users table (global accounts) | High | 2 |
| P2-T2 | Create tenant schema tables: users, roles, permissions | High | 4 |
| P2-T3 | Implement tenant membership linking table | High | 3 |
| P2-T4 | Create AuthModule with JWT strategy | High | 5 |
| P2-T5 | Implement POST /auth/register endpoint | High | 3 |
| P2-T6 | Implement POST /auth/login endpoint | High | 3 |
| P2-T7 | Implement POST /auth/refresh endpoint | Medium | 2 |
| P2-T8 | Create JWT guard with tenant membership validation | High | 4 |
| P2-T9 | Implement password hashing (bcrypt) | High | 2 |
| P2-T10 | Add password reset flow | Medium | 4 |

### Phase 3: Tenant Management

| Task ID | Task | Priority | Est. Hours |
|---------|------|----------|------------|
| P3-T1 | Create SuperAdminGuard | High | 2 |
| P3-T2 | Implement POST /superadmin/tenants (create tenant) | High | 4 |
| P3-T3 | Implement GET /superadmin/tenants (list all) | High | 2 |
| P3-T4 | Implement self-service tenant signup endpoint | High | 3 |
| P3-T5 | Create TenantOwnerGuard | High | 2 |
| P3-T6 | Implement POST /tenants/:tenantId/users (invite user) | High | 4 |
| P3-T7 | Implement GET /tenants/:tenantId/users (list users) | High | 2 |
| P3-T8 | Implement custom role creation endpoints | Medium | 4 |
| P3-T9 | Implement SuperAdmin impersonation endpoint | Medium | 4 |
| P3-T10 | Create impersonation audit logging | Medium | 3 |

### Phase 4: White-Label Configuration

| Task ID | Task | Priority | Est. Hours |
|---------|------|----------|------------|
| P4-T1 | Create tenant_settings table in tenant schema | High | 2 |
| P4-T2 | Add theme fields: colors, fonts, logoUrl | High | 2 |
| P4-T3 | Implement GET /tenants/:tenantId/public-config | High | 3 |
| P4-T4 | Implement PUT /tenants/:tenantId/settings (TenantOwner) | High | 3 |
| P4-T5 | Create file upload service for logos | Medium | 4 |
| P4-T6 | Add validation for theme configuration | Low | 2 |

### Phase 5: Core Business Modules

| Task ID | Task | Priority | Est. Hours |
|---------|------|----------|------------|
| P5-T1 | Create products table in tenant schema | High | 3 |
| P5-T2 | Implement ProductsModule with CRUD | High | 6 |
| P5-T3 | Create product categories | Medium | 3 |
| P5-T4 | Create reservations table in tenant schema | High | 3 |
| P5-T5 | Implement ReservationsModule with time slots | High | 6 |
| P5-T6 | Add availability management | High | 4 |
| P5-T7 | Create orders table in tenant schema | High | 3 |
| P5-T8 | Implement OrdersModule (basic) | High | 5 |
| P5-T9 | Add order status workflow | Medium | 3 |
| P5-T10 | Create public product/reservation endpoints | High | 4 |

### Phase 6: Quasar Frontend

| Task ID | Task | Priority | Est. Hours |
|---------|------|----------|------------|
| P6-T1 | Set up Quasar project with TypeScript | High | 2 |
| P6-T2 | Create tenant resolution composable (subdomain) | High | 4 |
| P6-T3 | Implement auth store (Pinia) | High | 4 |
| P6-T4 | Create tenant store with public config | High | 3 |
| P6-T5 | Build TenantThemeProvider component | High | 4 |
| P6-T6 | Create public layout with dynamic theming | High | 4 |
| P6-T7 | Build admin layout with navigation | High | 4 |
| P6-T8 | Implement Login and Register pages | High | 4 |
| P6-T9 | Create Dashboard page (admin) | High | 3 |
| P6-T10 | Build user management UI | High | 5 |
| P6-T11 | Create products management UI | High | 5 |
| P6-T12 | Build reservation management UI | High | 5 |
| P6-T13 | Create settings/theming UI | High | 4 |
| P6-T14 | Implement public product listing page | High | 4 |
| P6-T15 | Build public reservation booking page | High | 5 |

### Phase 7: Testing & Deployment

| Task ID | Task | Priority | Est. Hours |
|---------|------|----------|------------|
| P7-T1 | Set up Jest for backend testing | High | 2 |
| P7-T2 | Write unit tests for auth service | High | 4 |
| P7-T3 | Write unit tests for tenant service | High | 4 |
| P7-T4 | Create E2E tests for auth flows | Medium | 4 |
| P7-T5 | Set up Docker Compose for local dev | High | 3 |
| P7-T6 | Create production Dockerfile | High | 2 |
| P7-T7 | Write deployment documentation | High | 3 |
| P7-T8 | Set up GitHub Actions CI/CD | Medium | 4 |
| P7-T9 | Add logging (Winston/Pino) | Medium | 3 |
| P7-T10 | Create health check endpoints | Medium | 2 |

---

## 6. Reusable Vertical Design

### 6.1 Core vs Vertical-Specific Models

**CORE MODELS (All Tenants):**
| Model | Description |
|-------|-------------|
| users | User accounts within tenant |
| roles | Role definitions |
| permissions | Permission definitions |
| user_roles | User-role assignments |
| role_permissions | Role-permission assignments |
| tenant_settings | Branding, configuration |
| products | Generic products |
| product_categories | Product categorization |
| reservations | Generic time-based bookings |
| orders | Generic orders |
| order_items | Order line items |
| customers | Customer profiles |
| audit_logs | Activity logging |

**VERTICAL EXTENSIONS (Optional Modules):**

**Laundry Shop:**
- laundry_services (wash & fold, dry cleaning, etc.)
- garment_types (shirts, pants, dresses, etc.)
- pickup_deliveries (scheduling)
- care_instructions

**Coffee Shop:**
- menu_categories (drinks, food, pastries)
- modifiers (milk options, sizes, extras)
- tables (dine-in management)
- loyalty_program

**Massage Spa:**
- service_types (swedish, deep tissue, etc.)
- therapists
- treatment_rooms
- packages (bundled services)
- gift_cards

### 6.2 Vertical Module Architecture

```
Core Platform (Required):
┌─────────────────────────────────────────┐
│  - Tenant management                    │
│  - User/Role management                 │
│  - Authentication                       │
│  - Generic Products                     │
│  - Generic Reservations                 │
│  - White-label theming                  │
└─────────────────────────────────────────┘
                    ▲
                    │ Extends
        ┌───────────┴───────────┐
        │                       │
┌───────▼────────┐      ┌──────▼─────────┐
│ LaundryModule  │      │  CoffeeModule  │
│ (Optional)     │      │  (Optional)    │
├────────────────┤      ├────────────────┤
│ - Services     │      │ - Menu         │
│ - Garments     │      │ - Modifiers    │
│ - Pickups      │      │ - Tables       │
└────────────────┘      └────────────────┘
```

**Implementation Approach:**
1. Core platform defines generic models (products, reservations)
2. Vertical modules add domain-specific fields/relationships
3. Use TypeScript discriminated unions or separate tables
4. Feature flags control which vertical modules are active per tenant

### 6.3 Database Schema Design

```prisma
// Platform schema (public)
model Tenant {
  id          String   @id @default(uuid())
  slug        String   @unique
  subdomain   String   @unique
  name        String
  status      TenantStatus @default(PENDING)
  plan        String   @default("free")
  createdAt   DateTime @default(now())
  
  @@map("tenants")
}

// Tenant schema (dynamically created per tenant)
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  firstName String
  lastName  String
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  
  memberships UserTenantMembership[]
  
  @@map("users")
}

model UserTenantMembership {
  id        String @id @default(uuid())
  userId    String
  tenantId  String
  roleId    String
  
  user User @relation(fields: [userId], references: [id])
  role Role @relation(fields: [roleId], references: [id])
  
  @@map("user_tenant_memberships")
}

model Role {
  id          String @id @default(uuid())
  name        String
  description String?
  isCustom    Boolean @default(false)
  permissions Json // Array of permission strings
  
  memberships UserTenantMembership[]
  
  @@map("roles")
}

model Product {
  id          String   @id @default(uuid())
  name        String
  description String?
  price       Decimal  @db.Decimal(10, 2)
  categoryId  String?
  isActive    Boolean  @default(true)
  metadata    Json?    // Vertical-specific data
  
  category ProductCategory? @relation(fields: [categoryId], references: [id])
  
  @@map("products")
}

model Reservation {
  id          String   @id @default(uuid())
  customerId  String
  startTime   DateTime
  endTime     DateTime
  status      ReservationStatus @default(PENDING)
  notes       String?
  metadata    Json?    // Vertical-specific data
  
  @@map("reservations")
}

model TenantSettings {
  id          String @id @default(uuid())
  theme       Json   // Colors, fonts
  branding    Json   // Logo, favicon
  features    Json   // Enabled features
  config      Json   // Custom configuration
  
  @@map("tenant_settings")
}
```

---

## 7. AI-Friendly Execution Plan

### 7.1 Documentation Structure

Create these markdown files in your repository:

```
docs/
├── 00-overview.md              # Project overview and goals
├── 01-architecture.md          # Architecture decisions and patterns
├── 02-database-schema.md       # Complete Prisma schema
├── 03-api-specification.md     # API endpoints and DTOs
├── 04-frontend-structure.md    # Quasar app structure
├── 05-deployment-guide.md      # Docker and deployment
├── 06-task-breakdown.md        # All tasks from section 4
└── prompts/
    ├── generate-auth-module.md
    ├── generate-tenant-module.md
    ├── generate-prisma-service.md
    ├── generate-quasar-components.md
    └── generate-tests.md
```

### 7.2 Code Generation Prompts

#### Prompt Template for Auth Module

```markdown
# Generate Auth Module

## Context
Building a multi-tenant SaaS platform with NestJS + Prisma + PostgreSQL.
Using schema-per-tenant architecture.

## Requirements
Generate a complete AuthModule with:

1. Entities:
   - public.users (global accounts): id, email, passwordHash, firstName, lastName, isActive, createdAt
   - tenant schema users: id, email, firstName, lastName, isActive (link to global account)
   - user_tenant_memberships: id, userId, tenantId, roleId

2. Services:
   - AuthService: register(), login(), refreshToken(), validateUser()
   - Password hashing with bcrypt
   - JWT generation with access + refresh tokens

3. Controllers:
   - POST /auth/register
   - POST /auth/login
   - POST /auth/refresh
   - POST /auth/logout

4. Guards:
   - JwtAuthGuard
   - TenantMembershipGuard (verifies user belongs to resolved tenant)

5. DTOs with class-validator:
   - RegisterDto, LoginDto, RefreshTokenDto

## JWT Payload Structure
{
  sub: userId,
  email: email,
  tenantMemberships: [
    { tenantId: string, role: string }
  ]
}

## Output
Provide complete TypeScript code for all files with proper imports and decorators.
Use NestJS best practices and dependency injection.
```

#### Prompt Template for Tenant Resolution

```markdown
# Generate Tenant Resolution System

## Context
Multi-tenant NestJS app with schema-per-tenant PostgreSQL.
Need to resolve tenant from subdomain and manage tenant-scoped database connections.

## Requirements
Generate:

1. TenantResolutionMiddleware:
   - Extract tenant from subdomain (tenant1.platform.com)
   - Look up tenant in public.tenants table
   - Attach tenantId to request object
   - Handle missing/invalid tenants (404)

2. TenantContext Service:
   - Use AsyncLocalStorage to store tenantId per request
   - Provide getCurrentTenantId() method
   - Provide runWithTenant(tenantId, callback) method

3. PrismaTenancyService:
   - Maintain connection pool (Map<tenantId, PrismaClient>)
   - Get or create PrismaClient for tenant schema
   - Use connection string: postgresql://.../db?schema=tenant_{tenantId}
   - LRU cache with max 100 connections

4. TenantGuard:
   - Verify user has membership in resolved tenant
   - Extract tenantId from TenantContext
   - Check JWT payload tenantMemberships array

## Output
Complete TypeScript implementation with proper error handling and TypeScript types.
```

### 7.3 MCP Integration Notes

**Model Context Protocol (MCP) Setup:**

```json
{
  "mcpServers": {
    "nestjs-generator": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "/path/to/project"],
      "env": {
        "NESTJS_STYLE_GUIDE": "https://docs.nestjs.com/"
      }
    },
    "prisma-generator": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "/path/to/prisma"],
      "env": {
        "PRISMA_SCHEMA_PATH": "./prisma/schema.prisma"
      }
    }
  }
}
```

**MCP Tools for Code Generation:**
- `@nestjs/generate-module` - Scaffold new modules
- `@nestjs/generate-controller` - Create controllers
- `@nestjs/generate-service` - Create services
- `@prisma/generate-migration` - Generate migrations
- `@prisma/validate-schema` - Validate Prisma schema

### 7.4 Commands for Local Development

**Setup Commands:**
```bash
# Initial setup
git clone <repo>
cd multi-tenant-platform
npm install

# Database setup
docker-compose up -d postgres redis
npx prisma migrate dev --name init
npx prisma generate

# Seed sample data
npm run seed

# Development
npm run start:dev

# Quasar frontend
cd quasar-tenant-app
npm install
quasar dev
```

**Code Generation Commands:**
```bash
# Generate NestJS module
nest generate module features/products

# Generate CRUD
nest generate resource features/products

# Generate Prisma migration
npx prisma migrate dev --name add_products

# Generate Prisma client
npx prisma generate

# Reset database
npx prisma migrate reset
```

**Testing Commands:**
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Lint
npm run lint
```

### 7.5 AI Delegation Workflow

**Phase-Based AI Delegation:**

```
PHASE 1: Infrastructure
├── Task: Create Prisma schema for public + tenant
│   └── AI Prompt: "Generate Prisma schema with public.tenants and tenant schema template..."
├── Task: Implement TenantResolutionMiddleware
│   └── AI Prompt: "Generate NestJS middleware to extract tenant from subdomain..."
├── Task: Create PrismaTenancyService
│   └── AI Prompt: "Generate service to manage tenant-scoped Prisma clients..."
└── Review: Human reviews and integrates components

PHASE 2: Authentication
├── Task: Generate AuthModule
│   └── AI Prompt: "Generate complete AuthModule with JWT, bcrypt, DTOs..."
├── Task: Create JWT strategy and guards
│   └── AI Prompt: "Generate Passport JWT strategy with tenant validation..."
└── Review: Human tests auth flow end-to-end

PHASE 3: Tenant Management
├── Task: Generate TenantAdminController
│   └── AI Prompt: "Generate SuperAdmin controller for tenant CRUD..."
├── Task: Create TenantOwnerController
│   └── AI Prompt: "Generate TenantOwner controller for user management..."
└── Review: Human verifies role-based access

[Continue for each phase...]
```

**AI Review Checklist:**
- [ ] All imports present and correct
- [ ] TypeScript types defined
- [ ] Error handling implemented
- [ ] Validation decorators applied
- [ ] NestJS decorators correct (@Controller, @Injectable, etc.)
- [ ] Prisma queries use proper relations
- [ ] Guards applied to appropriate endpoints
- [ ] DTOs match API specification

---

## 8. Summary & Next Steps

### 8.1 Architecture Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Tenancy Model** | Schema-per-tenant | Strong isolation, fits hundreds of tenants, simpler queries |
| **ORM** | Prisma | Type-safe, excellent migrations, good NestJS integration |
| **Auth** | JWT with global accounts | Supports users across multiple tenants, flexible |
| **Tenant Resolution** | Subdomain (MVP) + Custom domain (later) | Clean URLs, easy to implement, scalable |
| **Frontend** | Single Quasar app | Runtime tenant adaptation, code reuse, simpler deployment |
| **Roles** | Core + Custom per tenant | Flexibility while maintaining security |
| **White-label** | Theming (MVP) + Layouts (later) | Progressive enhancement, core stays simple |

### 8.2 Recommended Base Repository

**Start with:** Custom implementation combining patterns from:
1. **Tenant resolution**: `reymi-tech/nestjs-multitenant`
2. **Prisma schema management**: `darioielardi/nestjs-prisma-multitenant`
3. **Connection pooling**: `LucaScorpion/nestjs-typeorm-schema-multitenancy` (adapt for Prisma)

### 8.3 Immediate Next Steps

1. **Create GitHub repository** with project structure
2. **Set up Docker Compose** (PostgreSQL + Redis)
3. **Initialize NestJS project** with Prisma
4. **Create public schema** (tenants table)
5. **Implement tenant resolution middleware** (subdomain)
6. **Create tenant-scoped Prisma service**
7. **Generate first migration** and test schema creation

### 8.4 GitHub Issues Template

Create these issues to track implementation:

```
Issue #1: [P1-T1] Set up PostgreSQL Docker environment
Issue #2: [P1-T2] Initialize NestJS with Prisma
Issue #3: [P1-T3] Create public schema tables
Issue #4: [P1-T4] Implement tenant resolution middleware
Issue #5: [P1-T5] Create tenant context with AsyncLocalStorage
Issue #6: [P1-T6] Implement PrismaTenancyService
Issue #7: [P1-T7] Create tenant schema migration system
Issue #8: [P1-T8] Add tenant schema creation on provisioning
Issue #9: [P2-T1] Create public.users table
Issue #10: [P2-T2] Create tenant schema user tables
...
```

### 8.5 Total Estimated Effort

| Phase | Duration | Hours |
|-------|----------|-------|
| Phase 1: Core Infrastructure | 2 weeks | ~29 hours |
| Phase 2: Authentication | 2 weeks | ~32 hours |
| Phase 3: Tenant Management | 2 weeks | ~31 hours |
| Phase 4: White-Label | 2 weeks | ~16 hours |
| Phase 5: Business Modules | 4 weeks | ~40 hours |
| Phase 6: Quasar Frontend | 5 weeks | ~62 hours |
| Phase 7: Testing & Deployment | 4 weeks | ~31 hours |
| **Total** | **21 weeks** | **~241 hours** |

---

## Appendix A: Key Technologies

| Layer | Technology | Version |
|-------|------------|---------|
| Backend | NestJS | Latest |
| ORM | Prisma | Latest |
| Database | PostgreSQL | 15+ |
| Cache | Redis | 7+ |
| Frontend | Quasar Framework | Latest |
| State Management | Pinia | Latest |
| Authentication | Passport + JWT | Latest |
| Validation | class-validator | Latest |
| Testing | Jest | Latest |
| Containerization | Docker | Latest |

## Appendix B: Useful Resources

### NestJS Multi-Tenancy References
- [nestjs-multitenant](https://github.com/reymi-tech/nestjs-multitenant) - Schema-per-tenant with TypeORM
- [nestjs-prisma-multitenant](https://github.com/darioielardi/nestjs-prisma-multitenant) - Prisma example
- [NestJS Tenancy](https://github.com/needle-innovision/nestjs-tenancy) - Row-level tenancy

### Prisma Resources
- [Prisma Multi-Schema Support](https://www.prisma.io/docs/guides/database/multi-schema)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)

### Quasar Resources
- [Quasar Framework Docs](https://quasar.dev/)
- [Quasar Theming](https://quasar.dev/style/theme-builder)

---

*Document Version: 1.0*
*Last Updated: 2026-03-20*
*Author: AI Architecture Assistant*
