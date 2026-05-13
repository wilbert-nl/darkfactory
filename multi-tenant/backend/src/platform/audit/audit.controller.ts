import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../super-admin/guards/super-admin.guard';
import { AuditService } from './audit.service';

@Controller('audit')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll(
    @Query('tenantId') tenantId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.findAll(
      tenantId,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Get('actor/:actorId')
  findByActor(
    @Param('actorId') actorId: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.findByActor(
      actorId,
      limit ? parseInt(limit, 10) : 50,
    );
  }
}
