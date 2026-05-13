import {
  Injectable,
  Logger,
  NestMiddleware,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';
import { PublicPrismaService } from '../prisma-tenancy/public-prisma.service';
import { TenantContextService } from '../tenant-context/tenant-context.service';

export interface TenantRequest extends Request {
  tenantId: string;
  tenantSlug: string;
}

@Injectable()
export class TenantResolutionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantResolutionMiddleware.name);

  constructor(
    private readonly publicPrisma: PublicPrismaService,
    private readonly tenantContext: TenantContextService,
    private readonly config: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const slug = this.extractSlug(req);

    if (!slug) {
      throw new NotFoundException('Tenant could not be resolved from request');
    }

    const tenant = await this.publicPrisma.tenant.findUnique({
      where: { slug },
      select: { id: true, slug: true, status: true },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant "${slug}" not found`);
    }

    if (tenant.status === 'SUSPENDED') {
      throw new NotFoundException(`Tenant "${slug}" is suspended`);
    }

    (req as TenantRequest).tenantId = tenant.id;
    (req as TenantRequest).tenantSlug = tenant.slug;

    this.logger.debug(`Resolved tenant: ${slug} → ${tenant.id}`);

    await this.tenantContext.runWithTenant(tenant.id, () =>
      new Promise<void>((resolve, reject) => {
        next();
        res.on('finish', resolve);
        res.on('error', reject);
      }),
    );
  }

  private extractSlug(req: Request): string | null {
    const host = req.hostname ?? req.headers.host?.split(':')[0] ?? '';
    const devHeader = this.config.get<string>('tenant.devTenantHeader') ?? 'x-tenant-slug';

    // Local dev fallback: use header when no real subdomain
    const isLocal =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('192.168.');

    if (isLocal) {
      const headerSlug = req.headers[devHeader];
      return typeof headerSlug === 'string' ? headerSlug : null;
    }

    // Production: extract subdomain
    const platformDomain = this.config.get<string>('tenant.platformDomain') ?? '';
    if (platformDomain && host.endsWith(`.${platformDomain}`)) {
      return host.slice(0, host.length - platformDomain.length - 1);
    }

    // Fallback: first subdomain part
    const parts = host.split('.');
    if (parts.length >= 3) return parts[0];

    return null;
  }
}
