import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PrismaTenancyService } from './prisma-tenancy.service';
import { TenantContextService } from '../tenant-context/tenant-context.service';

jest.mock('../../generated/tenant-client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      $connect: jest.fn().mockResolvedValue(undefined),
      $disconnect: jest.fn().mockResolvedValue(undefined),
    })),
  };
});

const mockConfig = {
  get: jest.fn((key: string) => {
    if (key === 'database.url') return 'postgresql://user:pass@localhost/db?schema=public';
    if (key === 'tenant.prismaPoolMax') return 100;
    return null;
  }),
};

const mockTenantContext = {
  getCurrentTenantId: jest.fn().mockReturnValue('tenant-abc'),
};

describe('PrismaTenancyService', () => {
  let service: PrismaTenancyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaTenancyService,
        { provide: ConfigService, useValue: mockConfig },
        { provide: TenantContextService, useValue: mockTenantContext },
      ],
    }).compile();

    service = module.get<PrismaTenancyService>(PrismaTenancyService);
  });

  it('returns the same cached client for the same tenantId', () => {
    const c1 = service.getClientForTenant('tenant-001');
    const c2 = service.getClientForTenant('tenant-001');
    expect(c1).toBe(c2);
  });

  it('returns different clients for different tenantIds', () => {
    const c1 = service.getClientForTenant('tenant-001');
    const c2 = service.getClientForTenant('tenant-002');
    expect(c1).not.toBe(c2);
  });

  it('calls TenantContextService to resolve current tenant', () => {
    mockTenantContext.getCurrentTenantId.mockReturnValue('tenant-ctx');
    const client = service.getClientForCurrentTenant();
    expect(mockTenantContext.getCurrentTenantId).toHaveBeenCalled();
    expect(client).toBeDefined();
  });

  it('disconnects all clients on module destroy', async () => {
    const c1 = service.getClientForTenant('tenant-d1');
    const c2 = service.getClientForTenant('tenant-d2');

    await service.disconnectAll();

    expect(c1.$disconnect).toHaveBeenCalled();
    expect(c2.$disconnect).toHaveBeenCalled();
  });
});
