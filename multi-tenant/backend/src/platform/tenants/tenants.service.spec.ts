import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TenantsService } from './tenants.service';
import { PublicPrismaService } from '../../tenancy/prisma-tenancy/public-prisma.service';
import { MigrationRunnerService } from '../../tenancy/migration-runner/migration-runner.service';
import { TenantContextService } from '../../tenancy/tenant-context/tenant-context.service';

const mockTenant = {
  id: 'tenant-1',
  name: 'Test Tenant',
  slug: 'test',
  subdomain: 'test',
  status: 'PENDING',
  createdAt: new Date(),
};

const mockUser = {
  id: 'user-1',
  email: 'owner@test.com',
  firstName: 'John',
  lastName: 'Doe',
  isActive: true,
  passwordHash: 'hash',
};

const mockMembership = {
  id: 'mem-1',
  userId: 'user-1',
  tenantId: 'tenant-1',
  roleSlug: 'tenant_owner',
};

const mockPublicPrisma = {
  tenant: {
    findFirst: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue(mockTenant),
  },
  globalUser: {
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue(mockUser),
  },
  userTenantMembership: {
    findMany: jest.fn().mockResolvedValue([mockMembership]),
    findFirst: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue(mockMembership),
    delete: jest.fn().mockResolvedValue(mockMembership),
  },
};

const mockMigrationRunner = {
  provisionTenantSchema: jest.fn().mockResolvedValue(undefined),
};

const mockTenantContext = {
  getCurrentTenantId: jest.fn().mockReturnValue('tenant-1'),
};

const mockConfig = {
  get: jest.fn().mockReturnValue(4),
};

describe('TenantsService', () => {
  let service: TenantsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockPublicPrisma.tenant.findFirst.mockResolvedValue(null);
    mockPublicPrisma.tenant.create.mockResolvedValue(mockTenant);
    mockPublicPrisma.globalUser.findUnique.mockResolvedValue(null);
    mockPublicPrisma.globalUser.create.mockResolvedValue(mockUser);
    mockPublicPrisma.userTenantMembership.findMany.mockResolvedValue([mockMembership]);
    mockPublicPrisma.userTenantMembership.findFirst.mockResolvedValue(null);
    mockPublicPrisma.userTenantMembership.create.mockResolvedValue(mockMembership);
    mockPublicPrisma.userTenantMembership.delete.mockResolvedValue(mockMembership);
    mockMigrationRunner.provisionTenantSchema.mockResolvedValue(undefined);
    mockConfig.get.mockReturnValue(4);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        { provide: PublicPrismaService, useValue: mockPublicPrisma },
        { provide: MigrationRunnerService, useValue: mockMigrationRunner },
        { provide: TenantContextService, useValue: mockTenantContext },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
  });

  describe('selfServiceSignup', () => {
    const signupDto = {
      tenantName: 'Test Tenant',
      slug: 'test',
      subdomain: 'test',
      ownerEmail: 'owner@test.com',
      ownerFirstName: 'John',
      ownerLastName: 'Doe',
      ownerPassword: 'securepassword123',
    };

    it('should create tenant, user, membership and provision schema', async () => {
      const result = await service.selfServiceSignup(signupDto);

      expect(mockPublicPrisma.tenant.findFirst).toHaveBeenCalled();
      expect(mockPublicPrisma.tenant.create).toHaveBeenCalled();
      expect(mockPublicPrisma.globalUser.create).toHaveBeenCalled();
      expect(mockPublicPrisma.userTenantMembership.create).toHaveBeenCalled();
      expect(mockMigrationRunner.provisionTenantSchema).toHaveBeenCalledWith('tenant-1');
      expect(result).toHaveProperty('tenant');
    });

    it('should throw ConflictException when slug already exists', async () => {
      mockPublicPrisma.tenant.findFirst.mockResolvedValue(mockTenant);

      await expect(service.selfServiceSignup(signupDto)).rejects.toThrow(ConflictException);
      expect(mockPublicPrisma.tenant.create).not.toHaveBeenCalled();
      expect(mockMigrationRunner.provisionTenantSchema).not.toHaveBeenCalled();
    });

    it('should reuse existing global user instead of creating a new one', async () => {
      mockPublicPrisma.globalUser.findUnique.mockResolvedValue(mockUser);

      await service.selfServiceSignup(signupDto);

      expect(mockPublicPrisma.globalUser.create).not.toHaveBeenCalled();
      expect(mockPublicPrisma.userTenantMembership.create).toHaveBeenCalled();
    });
  });

  describe('listMembers', () => {
    it('should return memberships for the current tenant', async () => {
      const result = await service.listMembers();

      expect(mockTenantContext.getCurrentTenantId).toHaveBeenCalled();
      expect(mockPublicPrisma.userTenantMembership.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
      );
      expect(result).toEqual([mockMembership]);
    });
  });

  describe('inviteUser', () => {
    const inviteDto = { email: 'existing@test.com', roleSlug: 'tenant_user' };

    it('should create membership when user exists and is not already a member', async () => {
      mockPublicPrisma.globalUser.findUnique.mockResolvedValue(mockUser);

      const result = await service.inviteUser(inviteDto);

      expect(mockPublicPrisma.globalUser.findUnique).toHaveBeenCalledWith({ where: { email: inviteDto.email } });
      expect(mockPublicPrisma.userTenantMembership.create).toHaveBeenCalled();
      expect(result).toEqual(mockMembership);
    });

    it('should throw NotFoundException when user account does not exist', async () => {
      mockPublicPrisma.globalUser.findUnique.mockResolvedValue(null);

      await expect(service.inviteUser(inviteDto)).rejects.toThrow(NotFoundException);
      expect(mockPublicPrisma.userTenantMembership.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when user is already a member', async () => {
      mockPublicPrisma.globalUser.findUnique.mockResolvedValue(mockUser);
      mockPublicPrisma.userTenantMembership.findFirst.mockResolvedValue(mockMembership);

      await expect(service.inviteUser(inviteDto)).rejects.toThrow(ConflictException);
      expect(mockPublicPrisma.userTenantMembership.create).not.toHaveBeenCalled();
    });
  });

  describe('removeMember', () => {
    it('should delete membership when found', async () => {
      mockPublicPrisma.userTenantMembership.findFirst.mockResolvedValue(mockMembership);

      await service.removeMember('user-1');

      expect(mockPublicPrisma.userTenantMembership.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'mem-1' } }),
      );
    });

    it('should throw NotFoundException when membership does not exist', async () => {
      mockPublicPrisma.userTenantMembership.findFirst.mockResolvedValue(null);

      await expect(service.removeMember('user-999')).rejects.toThrow(NotFoundException);
      expect(mockPublicPrisma.userTenantMembership.delete).not.toHaveBeenCalled();
    });
  });
});
