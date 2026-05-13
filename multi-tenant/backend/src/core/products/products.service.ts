import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaTenancyService } from '../../tenancy/prisma-tenancy/prisma-tenancy.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaTenancy: PrismaTenancyService) {}

  async findAll(includeInactive = false) {
    const client = this.prismaTenancy.getClientForCurrentTenant();
    return client.product.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const client = this.prismaTenancy.getClientForCurrentTenant();
    const product = await client.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async create(dto: CreateProductDto) {
    const client = this.prismaTenancy.getClientForCurrentTenant();
    return client.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        categoryId: dto.categoryId,
        isActive: dto.isActive ?? true,
        metadata: dto.metadata ? (dto.metadata as object) : undefined,
      },
      include: { category: true },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    const { metadata, ...rest } = dto;
    const client = this.prismaTenancy.getClientForCurrentTenant();
    return client.product.update({
      where: { id },
      data: { ...rest, ...(metadata !== undefined ? { metadata: metadata as object } : {}) },
      include: { category: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    const client = this.prismaTenancy.getClientForCurrentTenant();
    return client.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Categories
  async listCategories() {
    const client = this.prismaTenancy.getClientForCurrentTenant();
    return client.productCategory.findMany({ where: { isActive: true } });
  }

  async createCategory(name: string, description?: string) {
    const client = this.prismaTenancy.getClientForCurrentTenant();
    return client.productCategory.create({ data: { name, description } });
  }
}
