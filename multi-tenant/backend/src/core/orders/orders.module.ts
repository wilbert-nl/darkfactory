import { Module } from '@nestjs/common';
import { TenancyModule } from '../../tenancy/tenancy.module';
import { AuthModule } from '../../platform/auth/auth.module';
import { TenantsModule } from '../../platform/tenants/tenants.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [TenancyModule, AuthModule, TenantsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
