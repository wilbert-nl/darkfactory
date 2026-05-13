import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaTenancyService } from '../../tenancy/prisma-tenancy/prisma-tenancy.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(private readonly prismaTenancy: PrismaTenancyService) {}

  async findAll(includeInactive = false) {
    const client = this.prismaTenancy.getClientForCurrentTenant();
    return client.customer.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const client = this.prismaTenancy.getClientForCurrentTenant();
    const customer = await client.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException(`Customer ${id} not found`);
    return customer;
  }

  async create(dto: CreateCustomerDto) {
    const client = this.prismaTenancy.getClientForCurrentTenant();
    return client.customer.create({ data: dto });
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.findOne(id);
    const client = this.prismaTenancy.getClientForCurrentTenant();
    return client.customer.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    const client = this.prismaTenancy.getClientForCurrentTenant();
    return client.customer.update({ where: { id }, data: { isActive: false } });
  }
}
