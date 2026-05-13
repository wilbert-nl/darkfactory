# Thought: Governance Document Design

Date: 2026-04-23

## What I'm Working From

The source doc is a full architecture + implementation plan for a multi-tenant SaaS platform. It has:
- Clear stack decisions (NestJS, Prisma, PostgreSQL schema-per-tenant, Quasar)
- 7 phases, ~241 hours of work
- 60+ granular tasks (P1-T1 through P7-T10)
- Explicit architecture decisions with rationale

## How I Split It Into Three Governance Files

### MISSION.md (What to Build)
Extracted from:
- Section 1 (Clarifying Questions & Decisions) → immutable constraints
- Section 8.1 (Architecture Decisions Summary) → scope decisions
- Section 6 (Reusable Vertical Design) → what's core vs future

Key insight: the "out of scope" list from section 1 is as important as in-scope. Agents need hard stops to avoid scope creep. Things I marked as NEVER BUILD:
- Custom domains (future, not MVP)
- OAuth / SSO (future)
- Mobile builds (future)
- Billing (future)
- Layout customization beyond theming (future)
- Non-PostgreSQL databases
- Switching from Prisma

Immutable constraints derived from section 1 decisions:
1. Schema-per-tenant - the core isolation strategy is locked
2. Application-layer filtering (no PostgreSQL RLS)
3. One global login per person (not per-tenant accounts)
4. Subdomain resolution for MVP
5. No secrets in repository

### CLAUDE.md (How to Build)
Extracted from:
- Section 3.3 (NestJS Module Structure)
- Section 3.4 (Quasar Folder Structure)
- Section 6.3 (Database Schema Design)
- Section 7.4 (Commands)
- Section 1.18 (ORM Preference)

Key decisions encoded in CLAUDE.md:
- Prisma logic isolated in `tenancy/prisma-tenancy/` only
- All tenant queries MUST use PrismaTenancyService, never raw PrismaClient
- AsyncLocalStorage for tenant context (not request decorators)
- DTOs with class-validator everywhere
- No direct DB calls in controllers

### FACTORY_RULES.md (How the Factory Operates)
This is the one with no direct equivalent in the source doc. I derived it from:
- Section 5 (task breakdown) → what "done" looks like
- Section 7.2 (AI Review Checklist) → quality gates
- General dark factory patterns (from DARKFACTORY-SETUP-GUIDE.md)

Key additions I made:
- Triage bias toward reject for ambiguous issues
- Max 2 fix attempts per issue before escalating
- Security-sensitive files that require human (auth/, tenancy/prisma-tenancy/)
- Quality gate: must run `npm run lint` + `tsc --noEmit` + tests

## Tricky Decisions

**Multi-schema Prisma**: The architecture says "Prisma logic isolated in single module." I made this a hard rule in CLAUDE.md: `PrismaTenancyService` is the ONLY place that creates tenant-scoped clients. Any PR that instantiates PrismaClient directly in a service gets auto-rejected.

**Tenant context propagation**: Using AsyncLocalStorage is a subtle pattern. I documented it explicitly in CLAUDE.md so agents know not to pass tenantId as a parameter everywhere.

**Migration management**: Per-tenant migrations are complex. I locked this to the `tenancy/migration-runner/` module. Agents cannot add migration logic elsewhere.
