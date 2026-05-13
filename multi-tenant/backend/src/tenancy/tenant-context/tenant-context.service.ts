import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

interface TenantStore {
  tenantId: string;
}

// WARNING: AsyncLocalStorage context is NOT propagated into setTimeout,
// setInterval, or EventEmitter callbacks. Only use async/await chains
// within runWithTenant to guarantee context availability.

@Injectable()
export class TenantContextService {
  private readonly als = new AsyncLocalStorage<TenantStore>();

  runWithTenant<T>(tenantId: string, fn: () => Promise<T>): Promise<T> {
    return this.als.run({ tenantId }, fn);
  }

  getCurrentTenantId(): string {
    const store = this.als.getStore();
    if (!store) {
      throw new InternalServerErrorException(
        'No tenant context found. Ensure TenantResolutionMiddleware is applied.',
      );
    }
    return store.tenantId;
  }

  getCurrentTenantIdOrNull(): string | null {
    return this.als.getStore()?.tenantId ?? null;
  }
}
