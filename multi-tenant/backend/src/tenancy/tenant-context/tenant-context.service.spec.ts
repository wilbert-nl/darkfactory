import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { TenantContextService } from './tenant-context.service';

describe('TenantContextService', () => {
  let service: TenantContextService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantContextService],
    }).compile();

    service = module.get<TenantContextService>(TenantContextService);
  });

  it('sets tenant context and reads it correctly within the callback', async () => {
    const tenantId = 'tenant-abc-123';

    await service.runWithTenant(tenantId, async () => {
      expect(service.getCurrentTenantId()).toBe(tenantId);
    });
  });

  it('throws InternalServerErrorException when called outside tenant context', () => {
    expect(() => service.getCurrentTenantId()).toThrow(
      InternalServerErrorException,
    );
  });

  it('returns null via getCurrentTenantIdOrNull when no context', () => {
    expect(service.getCurrentTenantIdOrNull()).toBeNull();
  });

  it('isolates nested runWithTenant contexts', async () => {
    const outerTenantId = 'outer-tenant';
    const innerTenantId = 'inner-tenant';

    await service.runWithTenant(outerTenantId, async () => {
      expect(service.getCurrentTenantId()).toBe(outerTenantId);

      await service.runWithTenant(innerTenantId, async () => {
        expect(service.getCurrentTenantId()).toBe(innerTenantId);
      });

      // After inner context ends, outer is restored
      expect(service.getCurrentTenantId()).toBe(outerTenantId);
    });
  });

  it('context is gone after runWithTenant resolves', async () => {
    await service.runWithTenant('some-tenant', async () => {
      // inside context
    });

    expect(service.getCurrentTenantIdOrNull()).toBeNull();
  });
});
