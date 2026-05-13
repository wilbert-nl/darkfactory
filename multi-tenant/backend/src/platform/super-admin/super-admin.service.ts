import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PublicPrismaService } from '../../tenancy/prisma-tenancy/public-prisma.service';
import { MigrationRunnerService } from '../../tenancy/migration-runner/migration-runner.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { StartImpersonationDto } from './dto/start-impersonation.dto';

const IMPERSONATION_TTL_MS = 30 * 60 * 1000; // 30 minutes

@Injectable()
export class SuperAdminService {
  private readonly logger = new Logger(SuperAdminService.name);

  constructor(
    private readonly publicPrisma: PublicPrismaService,
    private readonly migrationRunner: MigrationRunnerService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async createTenant(dto: CreateTenantDto) {
    const existing = await this.publicPrisma.tenant.findFirst({
      where: { OR: [{ slug: dto.slug }, { subdomain: dto.subdomain }] },
    });
    if (existing) throw new ConflictException('Slug or subdomain already in use');

    const tenant = await this.publicPrisma.tenant.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        subdomain: dto.subdomain,
        plan: dto.plan ?? 'free',
        status: 'ACTIVE',
      },
    });

    await this.migrationRunner.provisionTenantSchema(tenant.id);
    this.logger.log(`Tenant created and provisioned: ${tenant.slug}`);
    return tenant;
  }

  async listTenants(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [tenants, total] = await Promise.all([
      this.publicPrisma.tenant.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.publicPrisma.tenant.count(),
    ]);
    return { tenants, total, page, limit };
  }

  async getTenant(id: string) {
    const tenant = await this.publicPrisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException(`Tenant ${id} not found`);
    return tenant;
  }

  async updateTenant(id: string, dto: UpdateTenantDto) {
    await this.getTenant(id);
    return this.publicPrisma.tenant.update({ where: { id }, data: dto });
  }

  async suspendTenant(id: string) {
    await this.getTenant(id);
    return this.publicPrisma.tenant.update({
      where: { id },
      data: { status: 'SUSPENDED' },
    });
  }

  async listAllUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.publicPrisma.globalUser.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          isSuperAdmin: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.publicPrisma.globalUser.count(),
    ]);
    return { users, total, page, limit };
  }

  async startImpersonation(superAdminId: string, dto: StartImpersonationDto) {
    const targetUser = await this.publicPrisma.globalUser.findUnique({
      where: { id: dto.targetUserId },
      include: {
        memberships: { select: { tenantId: true, roleSlug: true } },
      },
    });
    if (!targetUser) throw new NotFoundException(`User ${dto.targetUserId} not found`);

    const expiresAt = new Date(Date.now() + IMPERSONATION_TTL_MS);

    const log = await this.publicPrisma.impersonationLog.create({
      data: {
        superAdminId,
        targetUserId: dto.targetUserId,
        targetTenantId: dto.targetTenantId,
        reason: dto.reason,
        expiresAt,
      },
    });

    const payload: JwtPayload = {
      sub: targetUser.id,
      email: targetUser.email,
      isSuperAdmin: false,
      tenantMemberships: targetUser.memberships,
      isImpersonation: true,
      impersonatedBy: superAdminId,
      impersonationId: log.id,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('auth.jwtSecret'),
      expiresIn: '30m',
    });

    this.logger.log(
      `SuperAdmin ${superAdminId} started impersonation ${log.id} for user ${targetUser.email}`,
    );

    return { accessToken, impersonationId: log.id, expiresAt };
  }

  async endImpersonation(impersonationId: string, superAdminId: string) {
    const log = await this.publicPrisma.impersonationLog.findUnique({
      where: { id: impersonationId },
    });
    if (!log || log.superAdminId !== superAdminId) {
      throw new NotFoundException(`Impersonation session ${impersonationId} not found`);
    }

    const updated = await this.publicPrisma.impersonationLog.update({
      where: { id: impersonationId },
      data: { endedAt: new Date() },
    });

    this.logger.log(`Impersonation ${impersonationId} ended by SuperAdmin ${superAdminId}`);
    return updated;
  }

  async listImpersonationLogs(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      this.publicPrisma.impersonationLog.findMany({
        skip,
        take: limit,
        orderBy: { startedAt: 'desc' },
      }),
      this.publicPrisma.impersonationLog.count(),
    ]);
    return { logs, total, page, limit };
  }
}
