import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import databaseConfig from './config/database.config';
import authConfig from './config/auth.config';
import redisConfig from './config/redis.config';
import tenantConfig from './config/tenant.config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TenancyModule } from './tenancy/tenancy.module';
import { PlatformModule } from './platform/platform.module';
import { CoreModule } from './core/core.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, authConfig, redisConfig, tenantConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    TenancyModule,
    PlatformModule,
    CoreModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
