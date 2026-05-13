import {
  Body, Controller, Delete, Get, Param, Patch, Post,
  Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { TenantMembershipGuard } from '../../platform/auth/guards/tenant-membership.guard';
import { TenantOwnerGuard } from '../../platform/tenants/guards/tenant-owner.guard';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  // Members: list reservations
  @Get()
  @UseGuards(JwtAuthGuard, TenantMembershipGuard)
  findAll(@Query('status') status?: string) {
    return this.reservationsService.findAll(status);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, TenantMembershipGuard)
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  // Public: create a booking
  @Post()
  create(@Body() dto: CreateReservationDto) {
    return this.reservationsService.create(dto);
  }

  // Owner: update reservation
  @Patch(':id')
  @UseGuards(JwtAuthGuard, TenantMembershipGuard, TenantOwnerGuard)
  update(@Param('id') id: string, @Body() dto: UpdateReservationDto) {
    return this.reservationsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, TenantMembershipGuard, TenantOwnerGuard)
  cancel(@Param('id') id: string) {
    return this.reservationsService.cancel(id);
  }
}
