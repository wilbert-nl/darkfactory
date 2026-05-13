import { Module } from '@nestjs/common';
import { TenancyModule } from '../../tenancy/tenancy.module';
import { AuthModule } from '../../platform/auth/auth.module';
import { TenantsModule } from '../../platform/tenants/tenants.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [TenancyModule, AuthModule, TenantsModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
