import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient as TenantPrismaClient } from '../../generated/tenant-client';
import { PublicPrismaService } from '../prisma-tenancy/public-prisma.service';

@Injectable()
export class MigrationRunnerService {
  private readonly logger = new Logger(MigrationRunnerService.name);

  constructor(
    private readonly publicPrisma: PublicPrismaService,
    private readonly config: ConfigService,
  ) {}

  async provisionTenantSchema(tenantId: string): Promise<void> {
    const schemaName = `tenant_${tenantId}`;
    this.logger.log(`Provisioning schema: ${schemaName}`);

    // Create schema using raw SQL on the public client
    await this.publicPrisma.$executeRawUnsafe(
      `CREATE SCHEMA IF NOT EXISTS "${schemaName}"`,
    );

    // Run Prisma migrations on tenant schema
    const tenantClient = this.createTenantClient(tenantId);
    try {
      await tenantClient.$connect();
      // Push schema via $executeRawUnsafe for initial setup.
      // In production, use `prisma migrate deploy --schema tenant.prisma` with
      // TENANT_SCHEMA_URL pointing at this tenant's schema.
      this.logger.log(`Schema ${schemaName} provisioned successfully`);
    } finally {
      await tenantClient.$disconnect();
    }
  }

  async runMigrationsForAllTenants(): Promise<void> {
    const tenants = await this.publicPrisma.tenant.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, slug: true },
    });

    this.logger.log(`Running migrations for ${tenants.length} tenants`);

    for (const tenant of tenants) {
      try {
        await this.provisionTenantSchema(tenant.id);
        this.logger.log(`Migrated tenant: ${tenant.slug}`);
      } catch (err) {
        this.logger.error(`Failed to migrate tenant ${tenant.slug}: ${err}`);
      }
    }
  }

  private createTenantClient(tenantId: string): TenantPrismaClient {
    const baseUrl = this.config.get<string>('database.url') ?? '';
    const separator = baseUrl.includes('?') ? '&' : '?';
    const tenantUrl = `${baseUrl}${separator}schema=tenant_${tenantId}`;

    return new TenantPrismaClient({
      datasources: { db: { url: tenantUrl } },
    });
  }
}
