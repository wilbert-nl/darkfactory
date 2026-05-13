/**
 * Demo credentials (local dev only):
 *   SuperAdmin:   admin@platform.com   / Password123!
 *   TenantOwner:  owner@laundry-demo.com / Password123!
 *   TenantUser:   staff@laundry-demo.com / Password123!
 *   Tenant slug:  laundry-demo
 *
 * Run: npm run db:seed
 * Requires: DATABASE_URL set, public schema migrated, tenant.prisma pushed.
 */

import { execSync } from 'node:child_process';
import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { PrismaClient as TenantPrismaClient } from '../src/generated/tenant-client';

if (process.env.NODE_ENV === 'production') {
  throw new Error('Seed must not run in production');
}

const prisma = new PrismaClient();

function buildTenantUrl(tenantId: string): string {
  const base = process.env.DATABASE_URL ?? '';
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}schema=tenant_${tenantId}`;
}

async function hash(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log('🌱 Seeding database...');

  // ── SuperAdmin ──────────────────────────────────────────────────────────────
  const superAdmin = await prisma.globalUser.upsert({
    where: { email: 'admin@platform.com' },
    update: {},
    create: {
      email: 'admin@platform.com',
      passwordHash: await hash('Password123!'),
      firstName: 'Platform',
      lastName: 'Admin',
      isSuperAdmin: true,
    },
  });
  console.log(`✓ SuperAdmin: ${superAdmin.email}`);

  // ── Tenant ──────────────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'laundry-demo' },
    update: {},
    create: {
      slug: 'laundry-demo',
      subdomain: 'laundry-demo',
      name: 'Clean & Fresh Laundry',
      status: 'ACTIVE',
    },
  });
  console.log(`✓ Tenant: ${tenant.name} (${tenant.id})`);

  // ── Provision tenant schema ─────────────────────────────────────────────────
  const schemaName = `tenant_${tenant.id}`;
  await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);

  const tenantUrl = buildTenantUrl(tenant.id);
  console.log(`  Pushing tenant schema tables for ${schemaName}...`);
  execSync(`npx prisma db push --schema=./prisma/tenant.prisma --skip-generate`, {
    env: { ...process.env, TENANT_SCHEMA_URL: tenantUrl },
    stdio: 'inherit',
  });

  // ── Tenant users ────────────────────────────────────────────────────────────
  const owner = await prisma.globalUser.upsert({
    where: { email: 'owner@laundry-demo.com' },
    update: {},
    create: {
      email: 'owner@laundry-demo.com',
      passwordHash: await hash('Password123!'),
      firstName: 'Jane',
      lastName: 'Owner',
    },
  });

  const staff = await prisma.globalUser.upsert({
    where: { email: 'staff@laundry-demo.com' },
    update: {},
    create: {
      email: 'staff@laundry-demo.com',
      passwordHash: await hash('Password123!'),
      firstName: 'John',
      lastName: 'Staff',
    },
  });

  await prisma.userTenantMembership.upsert({
    where: { userId_tenantId: { userId: owner.id, tenantId: tenant.id } },
    update: {},
    create: { userId: owner.id, tenantId: tenant.id, roleSlug: 'owner' },
  });

  await prisma.userTenantMembership.upsert({
    where: { userId_tenantId: { userId: staff.id, tenantId: tenant.id } },
    update: {},
    create: { userId: staff.id, tenantId: tenant.id, roleSlug: 'staff' },
  });

  console.log(`✓ Users: ${owner.email} (owner), ${staff.email} (staff)`);

  // ── Tenant-scoped data ──────────────────────────────────────────────────────
  const tenantClient = new TenantPrismaClient({
    datasources: { db: { url: tenantUrl } },
  });

  try {
    await tenantClient.$connect();

    // Settings
    const existing = await tenantClient.tenantSettings.findFirst();
    if (!existing) {
      await tenantClient.tenantSettings.create({
        data: {
          primaryColor: '#1565C0',
          accentColor: '#FF6F00',
          fontFamily: 'Poppins',
          tenantDisplayName: 'Clean & Fresh Laundry',
        },
      });
    }

    // Categories
    const categoryNames = [
      'Wash & Fold',
      'Dry Cleaning',
      'Ironing',
      'Bedding & Linens',
      'Shoes & Accessories',
    ];

    const categories: Record<string, string> = {};
    for (const name of categoryNames) {
      const cat = await tenantClient.productCategory.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      categories[name] = cat.id;
    }
    console.log(`✓ Categories: ${categoryNames.length} created`);

    // Products
    const products = [
      { name: 'Wash & Fold — Regular', price: 120.0, category: 'Wash & Fold', meta: { unit: 'kg', minWeight: 2 } },
      { name: 'Wash & Fold — Express', price: 180.0, category: 'Wash & Fold', meta: { unit: 'kg', minWeight: 2, express: true } },
      { name: 'Dry Clean — Shirt', price: 95.0, category: 'Dry Cleaning', meta: { garment: 'shirt' } },
      { name: 'Dry Clean — Dress', price: 150.0, category: 'Dry Cleaning', meta: { garment: 'dress' } },
      { name: 'Dry Clean — Coat / Jacket', price: 250.0, category: 'Dry Cleaning', meta: { garment: 'coat' } },
      { name: 'Ironing — Per Piece', price: 35.0, category: 'Ironing', meta: { unit: 'piece' } },
      { name: 'Ironing — 10-Piece Bundle', price: 300.0, category: 'Ironing', meta: { unit: 'bundle', quantity: 10 } },
      { name: 'Bedding — Single Set', price: 200.0, category: 'Bedding & Linens', meta: { size: 'single' } },
      { name: 'Bedding — Queen/King Set', price: 350.0, category: 'Bedding & Linens', meta: { size: 'queen/king' } },
      { name: 'Shoes — Sneaker Clean', price: 200.0, category: 'Shoes & Accessories', meta: { type: 'sneakers' } },
      { name: 'Shoes — Leather Polish', price: 150.0, category: 'Shoes & Accessories', meta: { type: 'leather' } },
    ];

    for (const p of products) {
      const exists = await tenantClient.product.findFirst({ where: { name: p.name } });
      if (!exists) {
        await tenantClient.product.create({
          data: {
            name: p.name,
            price: p.price,
            categoryId: categories[p.category],
            metadata: p.meta,
          },
        });
      }
    }
    console.log(`✓ Products: ${products.length} seeded`);

    // Demo customer
    const customer = await tenantClient.customer.upsert({
      where: { email: 'customer@example.com' },
      update: {},
      create: {
        firstName: 'Maria',
        lastName: 'Santos',
        email: 'customer@example.com',
        phone: '+63 912 345 6789',
      },
    });

    // 3 open reservation slots (future dates)
    const washProduct = await tenantClient.product.findFirst({
      where: { name: 'Wash & Fold — Regular' },
    });

    const slots = [1, 3, 7].map((daysFromNow) => {
      const start = new Date();
      start.setDate(start.getDate() + daysFromNow);
      start.setHours(9, 0, 0, 0);
      const end = new Date(start);
      end.setHours(10, 0, 0, 0);
      return { start, end };
    });

    for (const slot of slots) {
      await tenantClient.reservation.create({
        data: {
          customerId: customer.id,
          productId: washProduct?.id,
          startTime: slot.start,
          endTime: slot.end,
          status: 'CONFIRMED',
          notes: 'Demo reservation',
        },
      });
    }
    console.log(`✓ Reservations: 3 future slots created`);
  } finally {
    await tenantClient.$disconnect();
  }

  console.log('\n✅ Seed complete!');
  console.log('   SuperAdmin:  admin@platform.com / Password123!');
  console.log('   TenantOwner: owner@laundry-demo.com / Password123!');
  console.log('   TenantUser:  staff@laundry-demo.com / Password123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
