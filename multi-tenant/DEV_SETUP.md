# DEV_SETUP.md — Local Development Bootstrap

## Ports (non-default due to conflicts with other projects)

| Service  | Host Port | Container Port |
|----------|-----------|----------------|
| Postgres | **5433**  | 5432           |
| Redis    | **6380**  | 6379           |
| Backend  | 3000      | 3000           |
| Frontend | 9000      | 9000           |

## Start Everything

```bash
# 1. Start infra
docker-compose up -d postgres redis

# 2. Backend (from /backend)
npm run start:dev

# 3. Frontend (from /frontend)
quasar dev
```

## First-Time Setup

```bash
# Generate Prisma clients (both public + tenant schemas)
cd backend && npm run prisma:generate

# Apply public schema to DB
npx prisma db push --schema=./prisma/schema.prisma

# Seed demo data
npm run db:seed
```

## Tenant Resolution in Dev

Tenant is resolved via subdomain in prod. Locally, it reads from `localStorage`.
Set this in the browser console before using the app:

```js
localStorage.setItem('dev_tenant_slug', 'laundry-demo')
location.reload()
```

## Demo Credentials

| Role         | Email                      | Password     |
|--------------|----------------------------|--------------|
| SuperAdmin   | admin@platform.com         | Password123! |
| Tenant Owner | owner@laundry-demo.com     | Password123! |
| Staff        | staff@laundry-demo.com     | Password123! |

## Known Issues Fixed

- `nest-cli.json` — added `assets` entry to copy `src/generated/**` to `dist/src/` (tenant Prisma client)
- `frontend/index.html` — replaced `<div id="q-app">` with `<!-- quasar:entry-point -->`
- `src/boot/pinia.ts` — added Pinia boot file; must be first in `quasar.config.js` boot array
- Error routes wrapped in `PublicLayout.vue` so `QPage` has a parent `QLayout`
- ESLint: installed `@rushstack/eslint-patch`, `@vue/eslint-config-typescript@13`, `eslint-plugin-vue`
