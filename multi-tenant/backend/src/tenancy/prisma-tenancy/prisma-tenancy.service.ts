import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient as TenantPrismaClient } from '../../generated/tenant-client';
import { TenantContextService } from '../tenant-context/tenant-context.service';

@Injectable()
export class PrismaTenancyService implements OnModuleDestroy {
  private readonly logger = new Logger(PrismaTenancyService.name);
  private readonly pool = new Map<string, TenantPrismaClient>();
  private readonly maxPoolSize: number;
  private readonly insertOrder: string[] = [];

  constructor(
    private readonly config: ConfigService,
    private readonly tenantContext: TenantContextService,
  ) {
    this.maxPoolSize = this.config.get<number>('tenant.prismaPoolMax') ?? 100;
  }

  getClientForCurrentTenant(): TenantPrismaClient {
    const tenantId = this.tenantContext.getCurrentTenantId();
    return this.getClientForTenant(tenantId);
  }

  getClientForTenant(tenantId: string): TenantPrismaClient {
    if (this.pool.has(tenantId)) {
      return this.pool.get(tenantId)!;
    }

    const client = this.createClientForTenant(tenantId);
    this.evictIfNeeded();
    this.pool.set(tenantId, client);
    this.insertOrder.push(tenantId);

    this.logger.debug(`Created Prisma client for tenant: ${tenantId}. Pool size: ${this.pool.size}`);
    return client;
  }

  async disconnectAll(): Promise<void> {
    const disconnections = Array.from(this.pool.values()).map((c) =>
      c.$disconnect().catch((err: unknown) => this.logger.warn(`Disconnect error: ${err}`)),
    );
    await Promise.all(disconnections);
    this.pool.clear();
    this.insertOrder.length = 0;
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnectAll();
  }

  private createClientForTenant(tenantId: string): TenantPrismaClient {
    const baseUrl = this.config.get<string>('database.url');
    if (!baseUrl) {
      throw new InternalServerErrorException('DATABASE_URL is not configured');
    }

    const separator = baseUrl.includes('?') ? '&' : '?';
    const tenantUrl = `${baseUrl}${separator}schema=tenant_${tenantId}`;

    return new TenantPrismaClient({
      datasources: { db: { url: tenantUrl } },
    });
  }

  private evictIfNeeded(): void {
    if (this.pool.size < this.maxPoolSize) return;

    const oldest = this.insertOrder.shift();
    if (oldest) {
      const client = this.pool.get(oldest);
      if (client) {
        client.$disconnect().catch((err: unknown) =>
          this.logger.warn(`Eviction disconnect error for tenant ${oldest}: ${err}`),
        );
        this.pool.delete(oldest);
        this.logger.debug(`Evicted tenant client: ${oldest}`);
      }
    }
  }
}
