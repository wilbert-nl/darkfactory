import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { PublicPrismaService } from './prisma-tenancy/public-prisma.service';
import { PrismaTenancyService } from './prisma-tenancy/prisma-tenancy.service';
import { TenantContextService } from './tenant-context/tenant-context.service';
import { TenantResolutionMiddleware } from './tenant-resolution/tenant-resolution.middleware';
import { MigrationRunnerService } from './migration-runner/migration-runner.service';

@Module({
  providers: [
    PublicPrismaService,
    PrismaTenancyService,
    TenantContextService,
    MigrationRunnerService,
  ],
  exports: [
    PublicPrismaService,
    PrismaTenancyService,
    TenantContextService,
    MigrationRunnerService,
  ],
})
export class TenancyModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(TenantResolutionMiddleware)
      .exclude(
        { path: 'health', method: RequestMethod.GET },
        { path: 'tenants/:slug/public-config', method: RequestMethod.GET },
        { path: 'tenants/signup', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}
