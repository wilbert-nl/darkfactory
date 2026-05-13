import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaTenancyService } from '../../tenancy/prisma-tenancy/prisma-tenancy.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prismaTenancy: PrismaTenancyService) {}

  async findAll(status?: string) {
    const client = this.prismaTenancy.getClientForCurrentTenant();
    return client.order.findMany({
      where: status ? { status: status as never } : {},
      include: { customer: true, orderItems: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const client = this.prismaTenancy.getClientForCurrentTenant();
    const order = await client.order.findUnique({
      where: { id },
      include: { customer: true, orderItems: { include: { product: true } } },
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  async create(dto: CreateOrderDto) {
    const client = this.prismaTenancy.getClientForCurrentTenant();
    const total = dto.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    return client.order.create({
      data: {
        customerId: dto.customerId,
        totalAmount: total,
        notes: dto.notes,
        orderItems: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.unitPrice * item.quantity,
          })),
        },
      },
      include: { customer: true, orderItems: { include: { product: true } } },
    });
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    await this.findOne(id);
    const client = this.prismaTenancy.getClientForCurrentTenant();
    return client.order.update({
      where: { id },
      data: { status: dto.status },
    });
  }
}
