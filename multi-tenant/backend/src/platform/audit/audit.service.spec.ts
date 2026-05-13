import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PublicPrismaService } from '../../tenancy/prisma-tenancy/public-prisma.service';

const mockAuditLog = {
  id: 'audit-1',
  actorId: 'actor-123',
  action: 'CREATE',
  resource: 'products',
  tenantId: 'tenant-1',
  metadata: { productName: 'Test Product' },
  createdAt: new Date(),
};

const mockPublicPrisma = {
  auditLog: {
    create: jest.fn().mockResolvedValue(mockAuditLog),
    findMany: jest.fn().mockResolvedValue([mockAuditLog]),
  },
};

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PublicPrismaService, useValue: mockPublicPrisma },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    jest.clearAllMocks();

    mockPublicPrisma.auditLog.create.mockResolvedValue(mockAuditLog);
    mockPublicPrisma.auditLog.findMany.mockResolvedValue([mockAuditLog]);
  });

  describe('log', () => {
    it('calls auditLog.create with correct fields', async () => {
      const actorId = 'user-456';
      const action = 'UPDATE';
      const resource = 'orders';
      const tenantId = 'tenant-2';
      const metadata = { orderId: 'ord-1', status: 'shipped' };

      const result = await service.log(actorId, action, resource, tenantId, metadata);

      expect(mockPublicPrisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          actorId,
          action,
          resource,
          tenantId,
          metadata: metadata as object,
        },
      });
      expect(result).toEqual(mockAuditLog);
    });

    it('handles null actorId when logging system actions', async () => {
      const result = await service.log(null, 'SYSTEM_INIT', 'tenant', 'tenant-1');

      expect(mockPublicPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            actorId: null,
            action: 'SYSTEM_INIT',
          }),
        }),
      );
      expect(result).toEqual(mockAuditLog);
    });

    it('casts metadata as object when provided', async () => {
      const metadata = { key: 'value', count: 42 };

      await service.log('actor-1', 'TEST', 'resource', 'tenant-1', metadata);

      expect(mockPublicPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          metadata: metadata as object,
        }),
      });
    });

    it('handles undefined metadata', async () => {
      await service.log('actor-1', 'TEST', 'resource', 'tenant-1', undefined);

      expect(mockPublicPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          metadata: undefined,
        }),
      });
    });

    it('handles undefined tenantId', async () => {
      await service.log('actor-1', 'GLOBAL_ACTION', 'resource', undefined);

      expect(mockPublicPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: undefined,
        }),
      });
    });
  });

  describe('findAll', () => {
    it('returns all audit logs when no tenantId provided', async () => {
      const result = await service.findAll();

      expect(result).toEqual([mockAuditLog]);
      expect(mockPublicPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: undefined,
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
      );
    });

    it('filters by tenantId when provided', async () => {
      const tenantId = 'tenant-5';

      const result = await service.findAll(tenantId);

      expect(result).toEqual([mockAuditLog]);
      expect(mockPublicPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
      );
    });

    it('respects custom limit parameter', async () => {
      await service.findAll('tenant-1', 100);

      expect(mockPublicPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        }),
      );
    });

    it('orders results by createdAt descending', async () => {
      await service.findAll();

      expect(mockPublicPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });
  });

  describe('findByActor', () => {
    it('calls findMany with where: { actorId }', async () => {
      const actorId = 'actor-789';

      const result = await service.findByActor(actorId);

      expect(result).toEqual([mockAuditLog]);
      expect(mockPublicPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { actorId },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
      );
    });

    it('respects custom limit parameter', async () => {
      await service.findByActor('actor-1', 25);

      expect(mockPublicPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 25,
        }),
      );
    });

    it('orders results by createdAt descending', async () => {
      await service.findByActor('actor-1');

      expect(mockPublicPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('returns empty array when no logs found for actor', async () => {
      mockPublicPrisma.auditLog.findMany.mockResolvedValueOnce([]);

      const result = await service.findByActor('unknown-actor');

      expect(result).toEqual([]);
      expect(mockPublicPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { actorId: 'unknown-actor' },
        }),
      );
    });
  });
});
