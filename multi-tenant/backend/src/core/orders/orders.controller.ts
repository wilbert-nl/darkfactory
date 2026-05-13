import {
  Body, Controller, Get, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { TenantMembershipGuard } from '../../platform/auth/guards/tenant-membership.guard';
import { TenantOwnerGuard } from '../../platform/tenants/guards/tenant-owner.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard, TenantMembershipGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@Query('status') status?: string) {
    return this.ordersService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Patch(':id/status')
  @UseGuards(TenantOwnerGuard)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }
}
