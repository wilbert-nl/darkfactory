import { Injectable, Logger } from '@nestjs/common';
import { PublicPrismaService } from '../../tenancy/prisma-tenancy/public-prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly publicPrisma: PublicPrismaService) {}

  async log(
    actorId: string | null,
    action: string,
    resource: string,
    tenantId?: string,
    metadata?: Record<string, unknown>,
  ) {
    const entry = await this.publicPrisma.auditLog.create({
      data: {
        actorId,
        action,
        resource,
        tenantId,
        metadata: metadata as object | undefined,
      },
    });
    this.logger.log(`Audit: ${action} on ${resource} by actor=${actorId ?? 'system'}`);
    return entry;
  }

  async findAll(tenantId?: string, limit = 50) {
    return this.publicPrisma.auditLog.findMany({
      where: tenantId ? { tenantId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findByActor(actorId: string, limit = 50) {
    return this.publicPrisma.auditLog.findMany({
      where: { actorId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
