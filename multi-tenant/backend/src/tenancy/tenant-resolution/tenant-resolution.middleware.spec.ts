import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TenantResolutionMiddleware } from './tenant-resolution.middleware';
import { PublicPrismaService } from '../prisma-tenancy/public-prisma.service';
import { TenantContextService } from '../tenant-context/tenant-context.service';

const mockTenant = { id: 'uuid-123', slug: 'acme', status: 'ACTIVE' };

const mockPublicPrisma = {
  tenant: {
    findUnique: jest.fn(),
  },
};

const mockTenantContext = {
  runWithTenant: jest.fn().mockImplementation((_id: string, fn: () => Promise<void>) => fn()),
};

const mockConfig = {
  get: jest.fn((key: string) => {
    const map: Record<string, string> = {
      'tenant.devTenantHeader': 'x-tenant-slug',
      'tenant.platformDomain': 'platform.local',
    };
    return map[key];
  }),
};

describe('TenantResolutionMiddleware', () => {
  let middleware: TenantResolutionMiddleware;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantResolutionMiddleware,
        { provide: PublicPrismaService, useValue: mockPublicPrisma },
        { provide: TenantContextService, useValue: mockTenantContext },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    middleware = module.get<TenantResolutionMiddleware>(TenantResolutionMiddleware);
    jest.clearAllMocks();
  });

  const makeReq = (hostname: string, headers: Record<string, string> = {}) => ({
    hostname,
    headers,
  });

  const makeRes = () => {
    const res: Record<string, unknown> = {};
    res.on = jest.fn().mockImplementation((event: string, cb: () => void) => {
      if (event === 'finish') cb();
    });
    return res;
  };

  it('resolves tenant from X-Tenant-Slug header on localhost', async () => {
    mockPublicPrisma.tenant.findUnique.mockResolvedValue(mockTenant);
    const req = makeReq('localhost', { 'x-tenant-slug': 'acme' }) as never;
    const res = makeRes() as never;
    const next = jest.fn();

    await middleware.use(req, res, next);

    expect(mockPublicPrisma.tenant.findUnique).toHaveBeenCalledWith({
      where: { slug: 'acme' },
      select: { id: true, slug: true, status: true },
    });
    expect((req as Record<string, unknown>).tenantId).toBe('uuid-123');
  });

  it('throws NotFoundException when tenant slug resolves to unknown tenant', async () => {
    mockPublicPrisma.tenant.findUnique.mockResolvedValue(null);
    const req = makeReq('localhost', { 'x-tenant-slug': 'unknown' }) as never;
    const res = makeRes() as never;
    const next = jest.fn();

    await expect(middleware.use(req, res, next)).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException when no slug present on localhost', async () => {
    const req = makeReq('localhost', {}) as never;
    const res = makeRes() as never;
    const next = jest.fn();

    await expect(middleware.use(req, res, next)).rejects.toThrow(NotFoundException);
  });
});
