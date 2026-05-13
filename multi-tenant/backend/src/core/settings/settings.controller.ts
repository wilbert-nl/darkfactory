import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { TenantMembershipGuard } from '../../platform/auth/guards/tenant-membership.guard';
import { TenantOwnerGuard } from '../../platform/tenants/guards/tenant-owner.guard';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Public: returns theme data for frontend without auth
  @Get('public')
  getPublicConfig() {
    return this.settingsService.getSettings();
  }

  @Get()
  @UseGuards(JwtAuthGuard, TenantMembershipGuard, TenantOwnerGuard)
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Put()
  @UseGuards(JwtAuthGuard, TenantMembershipGuard, TenantOwnerGuard)
  updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(dto);
  }
}
