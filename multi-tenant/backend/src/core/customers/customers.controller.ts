import {
  Body, Controller, Delete, Get, Param, Patch, Post,
  Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { TenantMembershipGuard } from '../../platform/auth/guards/tenant-membership.guard';
import { TenantOwnerGuard } from '../../platform/tenants/guards/tenant-owner.guard';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll(@Query('all') all?: string) {
    return this.customersService.findAll(all === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, TenantMembershipGuard, TenantOwnerGuard)
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, TenantMembershipGuard, TenantOwnerGuard)
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, TenantMembershipGuard, TenantOwnerGuard)
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
