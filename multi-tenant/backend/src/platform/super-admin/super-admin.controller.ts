import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { SuperAdminService } from './super-admin.service';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { StartImpersonationDto } from './dto/start-impersonation.dto';

@Controller('superadmin')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Post('tenants')
  createTenant(@Body() dto: CreateTenantDto) {
    return this.superAdminService.createTenant(dto);
  }

  @Get('tenants')
  listTenants(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.superAdminService.listTenants(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('tenants/:id')
  getTenant(@Param('id') id: string) {
    return this.superAdminService.getTenant(id);
  }

  @Patch('tenants/:id')
  updateTenant(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.superAdminService.updateTenant(id, dto);
  }

  @Delete('tenants/:id')
  suspendTenant(@Param('id') id: string) {
    return this.superAdminService.suspendTenant(id);
  }

  @Get('users')
  listUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.superAdminService.listAllUsers(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Post('impersonate')
  startImpersonation(
    @Body() dto: StartImpersonationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.superAdminService.startImpersonation(user.sub, dto);
  }

  @Post('impersonate/:id/end')
  endImpersonation(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.superAdminService.endImpersonation(id, user.sub);
  }

  @Get('impersonation-logs')
  listImpersonationLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.superAdminService.listImpersonationLogs(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }
}
