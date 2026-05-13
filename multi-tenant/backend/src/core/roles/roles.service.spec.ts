import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { RolesService } from './roles.service';
import { PrismaTenancyService } from '../../tenancy/prisma-tenancy/prisma-tenancy.service';

const mockRole = {
  id: 'role-1',
  name: 'Editor',
  description: 'Can edit content',
  isCustom: true,
  isSystem: false,
  rolePermissions: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSystemRole = {
  id: 'role-system',
  name: 'Admin',
  description: 'System admin role',
  isCustom: false,
  isSystem: true,
  rolePermissions: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPermission = {
  id: 'perm-1',
  resource: 'products',
  action: 'read',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUserRole = {
  userId: 'user-1',
  roleId: 'role-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRolePermission = {
  roleId: 'role-1',
  permissionId: 'perm-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrismaClient = {
  role: {
    findMany: jest.fn().mockResolvedValue([mockRole]),
    findUnique: jest.fn().mockResolvedValue(mockRole),
    create: jest.fn().mockResolvedValue(mockRole),
    update: jest.fn().mockResolvedValue(mockRole),
    delete: jest.fn().mockResolvedValue(mockRole),
  },
  userRole: {
    upsert: jest.fn().mockResolvedValue(mockUserRole),
    delete: jest.fn().mockResolvedValue(mockUserRole),
  },
  rolePermission: {
    upsert: jest.fn().mockResolvedValue(mockRolePermission),
    delete: jest.fn().mockResolvedValue(mockRolePermission),
  },
  permission: {
    findMany: jest.fn().mockResolvedValue([mockPermission]),
  },
};

const mockPrismaTenancy = {
  getClientForCurrentTenant: jest.fn().mockReturnValue(mockPrismaClient),
};

describe('RolesService', () => {
  let service: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: PrismaTenancyService, useValue: mockPrismaTenancy },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    jest.clearAllMocks();

    mockPrismaTenancy.getClientForCurrentTenant.mockReturnValue(mockPrismaClient);
    mockPrismaClient.role.findMany.mockResolvedValue([mockRole]);
    mockPrismaClient.role.findUnique.mockResolvedValue(mockRole);
    mockPrismaClient.role.create.mockResolvedValue(mockRole);
    mockPrismaClient.role.update.mockResolvedValue(mockRole);
    mockPrismaClient.role.delete.mockResolvedValue(mockRole);
    mockPrismaClient.userRole.upsert.mockResolvedValue(mockUserRole);
    mockPrismaClient.userRole.delete.mockResolvedValue(mockUserRole);
    mockPrismaClient.rolePermission.upsert.mockResolvedValue(mockRolePermission);
    mockPrismaClient.rolePermission.delete.mockResolvedValue(mockRolePermission);
    mockPrismaClient.permission.findMany.mockResolvedValue([mockPermission]);
  });

  describe('findAll', () => {
    it('calls client.role.findMany with include and orderBy', async () => {
      const result = await service.findAll();

      expect(result).toEqual([mockRole]);
      expect(mockPrismaClient.role.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { rolePermissions: { include: { permission: true } } },
          orderBy: { name: 'asc' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('returns the role when found', async () => {
      const result = await service.findOne('role-1');

      expect(result).toEqual(mockRole);
      expect(mockPrismaClient.role.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'role-1' },
          include: { rolePermissions: { include: { permission: true } } },
        }),
      );
    });

    it('throws NotFoundException when role does not exist', async () => {
      mockPrismaClient.role.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('calls client.role.create with isCustom defaulting to true', async () => {
      const dto = {
        name: 'Viewer',
        description: 'Can view content',
      };

      const result = await service.create(dto);

      expect(result).toEqual(mockRole);
      expect(mockPrismaClient.role.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: dto.name,
            description: dto.description,
            isCustom: true,
          }),
        }),
      );
    });

    it('respects isCustom when provided in dto', async () => {
      const dto = {
        name: 'Custom Role',
        description: 'A custom role',
        isCustom: false,
      };

      await service.create(dto);

      expect(mockPrismaClient.role.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isCustom: false,
          }),
        }),
      );
    });
  });

  describe('update', () => {
    it('updates a custom role successfully', async () => {
      const dto = { name: 'Updated Editor' };

      const result = await service.update('role-1', dto);

      expect(mockPrismaClient.role.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'role-1' },
        }),
      );
      expect(mockPrismaClient.role.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'role-1' },
          data: dto,
        }),
      );
      expect(result).toEqual(mockRole);
    });

    it('throws ForbiddenException when trying to update a system role', async () => {
      mockPrismaClient.role.findUnique.mockResolvedValue(mockSystemRole);

      await expect(service.update('role-system', { name: 'X' })).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('deletes a custom role successfully', async () => {
      const result = await service.remove('role-1');

      expect(mockPrismaClient.role.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'role-1' },
        }),
      );
      expect(mockPrismaClient.role.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'role-1' },
        }),
      );
      expect(result).toEqual(mockRole);
    });

    it('throws ForbiddenException when trying to delete a system role', async () => {
      mockPrismaClient.role.findUnique.mockResolvedValue(mockSystemRole);

      await expect(service.remove('role-system')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('assignRoleToUser', () => {
    it('calls client.userRole.upsert with userId and roleId', async () => {
      const dto = { userId: 'user-1', roleId: 'role-1' };

      const result = await service.assignRoleToUser(dto);

      expect(result).toEqual(mockUserRole);
      expect(mockPrismaClient.userRole.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId_roleId: { userId: 'user-1', roleId: 'role-1' } },
          create: { userId: 'user-1', roleId: 'role-1' },
          update: {},
        }),
      );
    });
  });

  describe('removeRoleFromUser', () => {
    it('calls client.userRole.delete with userId and roleId', async () => {
      const result = await service.removeRoleFromUser('user-1', 'role-1');

      expect(result).toEqual(mockUserRole);
      expect(mockPrismaClient.userRole.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId_roleId: { userId: 'user-1', roleId: 'role-1' } },
        }),
      );
    });
  });

  describe('assignPermissionToRole', () => {
    it('calls client.rolePermission.upsert with roleId and permissionId', async () => {
      const dto = { roleId: 'role-1', permissionId: 'perm-1' };

      const result = await service.assignPermissionToRole(dto);

      expect(result).toEqual(mockRolePermission);
      expect(mockPrismaClient.rolePermission.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { roleId_permissionId: { roleId: 'role-1', permissionId: 'perm-1' } },
          create: { roleId: 'role-1', permissionId: 'perm-1' },
          update: {},
        }),
      );
    });
  });

  describe('removePermissionFromRole', () => {
    it('calls client.rolePermission.delete with roleId and permissionId', async () => {
      const result = await service.removePermissionFromRole('role-1', 'perm-1');

      expect(result).toEqual(mockRolePermission);
      expect(mockPrismaClient.rolePermission.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { roleId_permissionId: { roleId: 'role-1', permissionId: 'perm-1' } },
        }),
      );
    });
  });

  describe('listPermissions', () => {
    it('calls client.permission.findMany with orderBy', async () => {
      const result = await service.listPermissions();

      expect(result).toEqual([mockPermission]);
      expect(mockPrismaClient.permission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { resource: 'asc' },
        }),
      );
    });
  });
});
