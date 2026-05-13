import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PrismaTenancyService } from '../../tenancy/prisma-tenancy/prisma-tenancy.service';

const mockProduct = {
  id: 'prod-1',
  name: 'Test Product',
  price: 1000,
  isActive: true,
  categoryId: null,
  category: null,
  metadata: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrismaClient = {
  product: {
    findMany: jest.fn().mockResolvedValue([mockProduct]),
    findUnique: jest.fn().mockResolvedValue(mockProduct),
    create: jest.fn().mockResolvedValue(mockProduct),
    update: jest.fn().mockResolvedValue(mockProduct),
  },
};

const mockPrismaTenancy = {
  getClientForCurrentTenant: jest.fn().mockReturnValue(mockPrismaClient),
};

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaTenancyService, useValue: mockPrismaTenancy },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();

    mockPrismaTenancy.getClientForCurrentTenant.mockReturnValue(mockPrismaClient);
    mockPrismaClient.product.findMany.mockResolvedValue([mockProduct]);
    mockPrismaClient.product.findUnique.mockResolvedValue(mockProduct);
    mockPrismaClient.product.create.mockResolvedValue(mockProduct);
    mockPrismaClient.product.update.mockResolvedValue(mockProduct);
  });

  describe('findAll', () => {
    it('returns an array of active products by default', async () => {
      const result = await service.findAll();

      expect(result).toEqual([mockProduct]);
      expect(mockPrismaClient.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isActive: true } }),
      );
    });

    it('passes empty where clause when includeInactive is true', async () => {
      await service.findAll(true);

      expect(mockPrismaClient.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });
  });

  describe('findOne', () => {
    it('returns the product when found', async () => {
      const result = await service.findOne('prod-1');

      expect(result).toEqual(mockProduct);
      expect(mockPrismaClient.product.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'prod-1' } }),
      );
    });

    it('throws NotFoundException when product does not exist', async () => {
      mockPrismaClient.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('calls client.product.create with the correct data', async () => {
      const dto = {
        name: 'New Product',
        description: 'A product',
        price: 500,
        categoryId: undefined,
        isActive: true,
        metadata: undefined,
      };

      const result = await service.create(dto);

      expect(result).toEqual(mockProduct);
      expect(mockPrismaClient.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: dto.name,
            price: dto.price,
          }),
        }),
      );
    });
  });

  describe('update', () => {
    it('calls findOne then client.product.update with the correct args', async () => {
      const dto = { name: 'Updated Name', price: 1500 };

      const result = await service.update('prod-1', dto);

      expect(mockPrismaClient.product.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'prod-1' } }),
      );
      expect(mockPrismaClient.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'prod-1' },
          data: dto,
        }),
      );
      expect(result).toEqual(mockProduct);
    });

    it('throws NotFoundException when the product to update does not exist', async () => {
      mockPrismaClient.product.findUnique.mockResolvedValue(null);

      await expect(service.update('missing-id', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('calls client.product.update with isActive: false to soft-delete', async () => {
      const result = await service.remove('prod-1');

      expect(mockPrismaClient.product.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'prod-1' } }),
      );
      expect(mockPrismaClient.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'prod-1' },
          data: { isActive: false },
        }),
      );
      expect(result).toEqual(mockProduct);
    });

    it('throws NotFoundException when the product to remove does not exist', async () => {
      mockPrismaClient.product.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing-id')).rejects.toThrow(NotFoundException);
    });
  });
});
