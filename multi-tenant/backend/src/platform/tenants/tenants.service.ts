import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { PublicPrismaService } from '../../tenancy/prisma-tenancy/public-prisma.service';
import { PrismaTenancyService } from '../../tenancy/prisma-tenancy/prisma-tenancy.service';
import { MigrationRunnerService } from '../../tenancy/migration-runner/migration-runner.service';
import { TenantContextService } from '../../tenancy/tenant-context/tenant-context.service';
import { InviteUserDto } from './dto/invite-user.dto';
import { TenantSignupDto } from './dto/signup.dto';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    private readonly publicPrisma: PublicPrismaService,
    private readonly prismaTenancy: PrismaTenancyService,
    private readonly migrationRunner: MigrationRunnerService,
    private readonly tenantContext: TenantContextService,
    private readonly config: ConfigService,
  ) {}

  async getPublicConfig(slug: string) {
    const tenant = await this.publicPrisma.tenant.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true, status: true },
    });
    if (!tenant) throw new NotFoundException(`Tenant "${slug}" not found`);

    const tenantClient = this.prismaTenancy.getClientForTenant(tenant.id);
    const settings = await tenantClient.tenantSettings.findFirst();

    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      status: tenant.status,
      primaryColor: settings?.primaryColor ?? '#1976D2',
      accentColor: settings?.accentColor ?? '#FF4081',
      fontFamily: settings?.fontFamily ?? 'Roboto',
      logoUrl: settings?.logoUrl ?? null,
    };
  }

  // Self-service signup — creates tenant (PENDING) + owner account
  async selfServiceSignup(dto: TenantSignupDto) {
    const existing = await this.publicPrisma.tenant.findFirst({
      where: { OR: [{ slug: dto.slug }, { subdomain: dto.subdomain }] },
    });
    if (existing) throw new ConflictException('Slug or subdomain already taken');

    const existingUser = await this.publicPrisma.globalUser.findUnique({
      where: { email: dto.ownerEmail },
    });

    const rounds = this.config.get<number>('auth.bcryptRounds') ?? 12;
    const passwordHash = await bcrypt.hash(dto.ownerPassword, rounds);

    const [tenant, user] = await Promise.all([
      this.publicPrisma.tenant.create({
        data: {
          name: dto.tenantName,
          slug: dto.slug,
          subdomain: dto.subdomain,
          status: 'PENDING',
        },
      }),
      existingUser
        ? Promise.resolve(existingUser)
        : this.publicPrisma.globalUser.create({
            data: {
              email: dto.ownerEmail,
              passwordHash,
              firstName: dto.ownerFirstName,
              lastName: dto.ownerLastName,
            },
          }),
    ]);

    await this.publicPrisma.userTenantMembership.create({
      data: { userId: user.id, tenantId: tenant.id, roleSlug: 'tenant_owner' },
    });

    await this.migrationRunner.provisionTenantSchema(tenant.id);
    this.logger.log(`Self-service signup: ${tenant.slug} (PENDING approval)`);

    return { tenant, message: 'Tenant created. Awaiting activation.' };
  }

  // List members of the current tenant
  async listMembers() {
    const tenantId = this.tenantContext.getCurrentTenantId();
    return this.publicPrisma.userTenantMembership.findMany({
      where: { tenantId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isActive: true,
          },
        },
      },
    });
  }

  // Invite existing global user to current tenant
  async inviteUser(dto: InviteUserDto) {
    const tenantId = this.tenantContext.getCurrentTenantId();
    const user = await this.publicPrisma.globalUser.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new NotFoundException(`No account found for ${dto.email}`);

    const existing = await this.publicPrisma.userTenantMembership.findFirst({
      where: { userId: user.id, tenantId },
    });
    if (existing) throw new ConflictException('User is already a member');

    return this.publicPrisma.userTenantMembership.create({
      data: {
        userId: user.id,
        tenantId,
        roleSlug: dto.roleSlug ?? 'tenant_user',
      },
    });
  }

  // Remove user from current tenant
  async removeMember(userId: string) {
    const tenantId = this.tenantContext.getCurrentTenantId();
    const membership = await this.publicPrisma.userTenantMembership.findFirst({
      where: { userId, tenantId },
    });
    if (!membership) throw new NotFoundException('Membership not found');

    await this.publicPrisma.userTenantMembership.delete({
      where: { id: membership.id },
    });
  }
}
