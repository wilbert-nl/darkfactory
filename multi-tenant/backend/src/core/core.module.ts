import { Module } from '@nestjs/common';
import { SettingsModule } from './settings/settings.module';
import { ProductsModule } from './products/products.module';
import { ReservationsModule } from './reservations/reservations.module';
import { OrdersModule } from './orders/orders.module';
import { CustomersModule } from './customers/customers.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [SettingsModule, ProductsModule, ReservationsModule, OrdersModule, CustomersModule, RolesModule],
  exports: [SettingsModule, ProductsModule, ReservationsModule, OrdersModule, CustomersModule, RolesModule],
})
export class CoreModule {}
