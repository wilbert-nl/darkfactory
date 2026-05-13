import { Module } from '@nestjs/common';
import { TenancyModule } from '../../tenancy/tenancy.module';
import { AuthModule } from '../../platform/auth/auth.module';
import { TenantsModule } from '../../platform/tenants/tenants.module';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

@Module({
  imports: [TenancyModule, AuthModule, TenantsModule],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
