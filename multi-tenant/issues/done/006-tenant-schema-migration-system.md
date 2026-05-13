---
id: "006"
title: "Create tenant schema migration system"
phase: "P1"
task_id: "P1-T7"
priority: "high"
estimated_hours: 5
status: "done"
created_at: "2026-04-23"
attempts: 0
last_attempt: null
failure_notes: null
---

## Description

Implement the system that creates and migrates tenant schemas. When a new tenant is provisioned, a fresh schema is created and all tenant schema tables are initialized.

## Acceptance Criteria

- [ ] `backend/prisma/tenant-schema.prisma` defines all tenant schema models: `User`, `Role`, `Permission`, `UserRole`, `RolePermission`, `TenantSettings`, `Product`, `ProductCategory`, `Reservation`, `Order`, `OrderItem`, `Customer`, `AuditLog`
- [ ] `backend/src/tenancy/migration-runner/migration-runner.service.ts` created
- [ ] `MigrationRunnerService` exposes:
  - `provisionTenantSchema(tenantId: string): Promise<void>` — creates schema and runs all migrations
  - `runMigrationsForAllTenants(): Promise<void>` — iterates all tenants and migrates each
- [ ] `provisionTenantSchema` creates the PostgreSQL schema via `CREATE SCHEMA IF NOT EXISTS tenant_${tenantId}`
- [ ] After schema creation, runs Prisma migrations scoped to the tenant schema
- [ ] Unit test: provisioning creates schema and tables (use test DB)
- [ ] Integration test: two tenants provisioned → schemas are independent

## Context

Tenant schema table definitions (from architecture doc):
- `User`: id UUID, email, firstName, lastName, isActive, globalUserId (FK to public.global_users), createdAt, updatedAt
- `Role`: id UUID, name, description, isCustom bool, isSystem bool, createdAt
- `Permission`: id UUID, action (string from CorePermission enum), resource, createdAt
- `UserRole`: id UUID, userId → User, roleId → Role
- `RolePermission`: id UUID, roleId → Role, permissionId → Permission
- `TenantSettings`: id UUID, logoUrl, primaryColor, accentColor, fontFamily, tenantDisplayName, metadata JSON, updatedAt
- `Product`: id UUID, name, description, price Decimal(10,2), categoryId → ProductCategory, isActive, metadata JSON, createdAt, updatedAt
- `ProductCategory`: id UUID, name, description, isActive, createdAt
- `Reservation`: id UUID, customerId → Customer, productId → Product (nullable), startTime, endTime, status, notes, metadata JSON, createdAt, updatedAt
- `Order`: id UUID, customerId → Customer, status, totalAmount Decimal(10,2), notes, createdAt, updatedAt
- `OrderItem`: id UUID, orderId → Order, productId → Product, quantity int, unitPrice Decimal(10,2), subtotal Decimal(10,2)
- `Customer`: id UUID, firstName, lastName, email, phone, isActive, createdAt, updatedAt
- `AuditLog`: id UUID, actorId, action, resource, metadata JSON, createdAt


---
**[triage] 2026-04-23:** Auto-accepted — all issues are Phase 1/2 critical path, clearly scoped, aligned with MISSION.md.


---
**[implement+validate] 2026-04-23:** All acceptance criteria implemented. Code written to backend/. Tests written. Lint and typecheck targets configured.
