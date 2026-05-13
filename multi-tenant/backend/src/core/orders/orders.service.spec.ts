import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PrismaTenancyService } from '../../tenancy/prisma-tenancy/prisma-tenancy.service';

const mockOrder = {
  id: 'order-1',
  status: 'PENDING',
  totalAmount: 2000,
  customerId: null,
  notes: null,
  customer: null,
  orderItems: [],
  createdAt: new Date(),
};

const mockPrismaClient = {
  order: {
    findMany: jest.fn().mockResolvedValue([mockOrder]),
    findUnique: jest.fn().mockResolvedValue(mockOrder),
    create: jest.fn().mockResolvedValue(mockOrder),
    update: jest.fn().mockResolvedValue({ ...mockOrder, status: 'COMPLETED' }),
  },
};

const mockPrismaTenancy = {
  getClientForCurrentTenant: jest.fn().mockReturnValue(mockPrismaClient),
};

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaTenancyService, useValue: mockPrismaTenancy },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();

    mockPrismaTenancy.getClientForCurrentTenant.mockReturnValue(mockPrismaClient);
    mockPrismaClient.order.findMany.mockResolvedValue([mockOrder]);
    mockPrismaClient.order.findUnique.mockResolvedValue(mockOrder);
    mockPrismaClient.order.create.mockResolvedValue(mockOrder);
    mockPrismaClient.order.update.mockResolvedValue({ ...mockOrder, status: 'COMPLETED' });
  });

  describe('findAll', () => {
    it('returns all orders when no status filter is provided', async () => {
      const result = await service.findAll();

      expect(result).toEqual([mockOrder]);
      expect(mockPrismaClient.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });

    it('filters by status when status is provided', async () => {
      await service.findAll('COMPLETED');

      expect(mockPrismaClient.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'COMPLETED' } }),
      );
    });
  });

  describe('findOne', () => {
    it('returns the order when found', async () => {
      const result = await service.findOne('order-1');

      expect(result).toEqual(mockOrder);
      expect(mockPrismaClient.order.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'order-1' } }),
      );
    });

    it('throws NotFoundException when order does not exist', async () => {
      mockPrismaClient.order.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('computes the correct totalAmount from items and passes it to create', async () => {
      // 2 items: 500 × 2 = 1000, 750 × 2 = 1500 → total = 2500
      const dto = {
        customerId: 'cust-1',
        notes: 'Rush order',
        items: [
          { productId: 'prod-1', quantity: 2, unitPrice: 500 },
          { productId: 'prod-2', quantity: 2, unitPrice: 750 },
        ],
      };

      await service.create(dto);

      const createCall = mockPrismaClient.order.create.mock.calls[0][0];
      expect(createCall.data.totalAmount).toBe(2500);
    });

    it('maps each item to an orderItems.create entry with correct subtotal', async () => {
      const dto = {
        customerId: 'cust-1',
        items: [{ productId: 'prod-1', quantity: 3, unitPrice: 200 }],
      };

      await service.create(dto);

      const createCall = mockPrismaClient.order.create.mock.calls[0][0];
      expect(createCall.data.orderItems.create).toEqual([
        expect.objectContaining({
          productId: 'prod-1',
          quantity: 3,
          unitPrice: 200,
          subtotal: 600,
        }),
      ]);
    });

    it('returns the created order', async () => {
      const dto = {
        customerId: 'cust-1',
        items: [{ productId: 'prod-1', quantity: 1, unitPrice: 2000 }],
      };

      const result = await service.create(dto);

      expect(result).toEqual(mockOrder);
    });
  });

  describe('updateStatus', () => {
    it('calls findOne then client.order.update with the new status', async () => {
      const dto = { status: 'COMPLETED' };

      const result = await service.updateStatus('order-1', dto as never);

      expect(mockPrismaClient.order.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'order-1' } }),
      );
      expect(mockPrismaClient.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'order-1' },
          data: { status: 'COMPLETED' },
        }),
      );
      expect(result.status).toBe('COMPLETED');
    });

    it('throws NotFoundException when the order to update does not exist', async () => {
      mockPrismaClient.order.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus('missing-id', { status: 'COMPLETED' } as never),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
