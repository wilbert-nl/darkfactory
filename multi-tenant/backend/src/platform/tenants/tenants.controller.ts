import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantMembershipGuard } from '../auth/guards/tenant-membership.guard';
import { TenantOwnerGuard } from './guards/tenant-owner.guard';
import { TenantsService } from './tenants.service';
import { InviteUserDto } from './dto/invite-user.dto';
import { TenantSignupDto } from './dto/signup.dto';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  // Public: bootstrap — frontend calls this to resolve tenant before login
  @Get(':slug/public-config')
  getPublicConfig(@Param('slug') slug: string) {
    return this.tenantsService.getPublicConfig(slug);
  }

  // Public: self-service signup
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() dto: TenantSignupDto) {
    return this.tenantsService.selfServiceSignup(dto);
  }

  // Tenant-scoped: list members
  @Get('members')
  @UseGuards(JwtAuthGuard, TenantMembershipGuard, TenantOwnerGuard)
  listMembers() {
    return this.tenantsService.listMembers();
  }

  // Tenant-scoped: invite a user
  @Post('members/invite')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, TenantMembershipGuard, TenantOwnerGuard)
  inviteUser(@Body() dto: InviteUserDto) {
    return this.tenantsService.inviteUser(dto);
  }

  // Tenant-scoped: remove a member
  @Delete('members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, TenantMembershipGuard, TenantOwnerGuard)
  removeMember(@Param('userId') userId: string) {
    return this.tenantsService.removeMember(userId);
  }
}
