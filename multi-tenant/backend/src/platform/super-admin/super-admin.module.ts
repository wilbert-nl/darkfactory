import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TenancyModule } from '../../tenancy/tenancy.module';
import { AuthModule } from '../auth/auth.module';
import { SuperAdminController } from './super-admin.controller';
import { SuperAdminService } from './super-admin.service';
import { SuperAdminGuard } from './guards/super-admin.guard';

@Module({
  imports: [TenancyModule, AuthModule, JwtModule.register({})],
  controllers: [SuperAdminController],
  providers: [SuperAdminService, SuperAdminGuard],
  exports: [SuperAdminGuard],
})
export class SuperAdminModule {}
