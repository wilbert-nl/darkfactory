import {
  Body, Controller, Delete, Get, Param, Patch, Post,
  Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../platform/auth/guards/jwt-auth.guard';
import { TenantMembershipGuard } from '../../platform/auth/guards/tenant-membership.guard';
import { TenantOwnerGuard } from '../../platform/tenants/guards/tenant-owner.guard';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Public endpoints
  @Get()
  findAll(@Query('all') all?: string) {
    return this.productsService.findAll(all === 'true');
  }

  @Get('categories')
  listCategories() {
    return this.productsService.listCategories();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  // Owner-only endpoints
  @Post()
  @UseGuards(JwtAuthGuard, TenantMembershipGuard, TenantOwnerGuard)
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, TenantMembershipGuard, TenantOwnerGuard)
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, TenantMembershipGuard, TenantOwnerGuard)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
