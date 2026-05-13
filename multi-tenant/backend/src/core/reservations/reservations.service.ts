import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaTenancyService } from '../../tenancy/prisma-tenancy/prisma-tenancy.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private readonly prismaTenancy: PrismaTenancyService) {}

  async findAll(status?: string) {
    const client = this.prismaTenancy.getClientForCurrentTenant();
    return client.reservation.findMany({
      where: status ? { status: status as never } : {},
      include: { customer: true, product: true },
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(id: string) {
    const client = this.prismaTenancy.getClientForCurrentTenant();
    const reservation = await client.reservation.findUnique({
      where: { id },
      include: { customer: true, product: true },
    });
    if (!reservation) throw new NotFoundException(`Reservation ${id} not found`);
    return reservation;
  }

  async create(dto: CreateReservationDto) {
    const client = this.prismaTenancy.getClientForCurrentTenant();
    return client.reservation.create({
      data: {
        customerId: dto.customerId,
        productId: dto.productId,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        notes: dto.notes,
        metadata: dto.metadata ? (dto.metadata as object) : undefined,
      },
      include: { customer: true, product: true },
    });
  }

  async update(id: string, dto: UpdateReservationDto) {
    await this.findOne(id);
    const { startTime, endTime, ...rest } = dto;
    const client = this.prismaTenancy.getClientForCurrentTenant();
    return client.reservation.update({
      where: { id },
      data: {
        ...rest,
        ...(startTime ? { startTime: new Date(startTime) } : {}),
        ...(endTime ? { endTime: new Date(endTime) } : {}),
      },
      include: { customer: true, product: true },
    });
  }

  async cancel(id: string) {
    await this.findOne(id);
    const client = this.prismaTenancy.getClientForCurrentTenant();
    return client.reservation.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}
