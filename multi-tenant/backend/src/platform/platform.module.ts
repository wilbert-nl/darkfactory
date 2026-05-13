import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { TenantsModule } from './tenants/tenants.module';

@Module({
  imports: [AuthModule, SuperAdminModule, TenantsModule, AuditModule],
  exports: [AuthModule, SuperAdminModule, TenantsModule, AuditModule],
})
export class PlatformModule {}
