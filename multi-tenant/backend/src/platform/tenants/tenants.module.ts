import { Module } from '@nestjs/common';
import { TenancyModule } from '../../tenancy/tenancy.module';
import { AuthModule } from '../auth/auth.module';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { TenantOwnerGuard } from './guards/tenant-owner.guard';

@Module({
  imports: [TenancyModule, AuthModule],
  controllers: [TenantsController],
  providers: [TenantsService, TenantOwnerGuard],
  exports: [TenantsService, TenantOwnerGuard],
})
export class TenantsModule {}
