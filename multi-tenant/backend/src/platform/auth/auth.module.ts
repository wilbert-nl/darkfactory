import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TenancyModule } from '../../tenancy/tenancy.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TenantMembershipGuard } from './guards/tenant-membership.guard';

@Module({
  imports: [
    TenancyModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, TenantMembershipGuard],
  exports: [AuthService, JwtAuthGuard, TenantMembershipGuard, PassportModule],
})
export class AuthModule {}
