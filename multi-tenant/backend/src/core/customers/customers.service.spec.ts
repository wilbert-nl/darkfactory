import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { PrismaTenancyService } from '../../tenancy/prisma-tenancy/prisma-tenancy.service';

const mockCustomer = {
  id: 'cust-1',
  name: 'Test Customer',
  email: 'test@example.com',
  phone: '555-1234',
  isActive: true,
  metadata: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrismaClient = {
  customer: {
    findMany: jest.fn().mockResolvedValue([mockCustomer]),
    findUnique: jest.fn().mockResolvedValue(mockCustomer),
    create: jest.fn().mockResolvedValue(mockCustomer),
    update: jest.fn().mockResolvedValue(mockCustomer),
  },
};

const mockPrismaTenancy = {
  getClientForCurrentTenant: jest.fn().mockReturnValue(mockPrismaClient),
};

describe('CustomersService', () => {
  let service: CustomersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: PrismaTenancyService, useValue: mockPrismaTenancy },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    jest.clearAllMocks();

    mockPrismaTenancy.getClientForCurrentTenant.mockReturnValue(mockPrismaClient);
    mockPrismaClient.customer.findMany.mockResolvedValue([mockCustomer]);
    mockPrismaClient.customer.findUnique.mockResolvedValue(mockCustomer);
    mockPrismaClient.customer.create.mockResolvedValue(mockCustomer);
    mockPrismaClient.customer.update.mockResolvedValue(mockCustomer);
  });

  describe('findAll', () => {
    it('returns an array of active customers by default', async () => {
      const result = await service.findAll();

      expect(result).toEqual([mockCustomer]);
      expect(mockPrismaClient.customer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isActive: true } }),
      );
    });

    it('passes empty where clause when includeInactive is true', async () => {
      await service.findAll(true);

      expect(mockPrismaClient.customer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });
  });

  describe('findOne', () => {
    it('returns the customer when found', async () => {
      const result = await service.findOne('cust-1');

      expect(result).toEqual(mockCustomer);
      expect(mockPrismaClient.customer.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'cust-1' } }),
      );
    });

    it('throws NotFoundException when customer does not exist', async () => {
      mockPrismaClient.customer.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('calls client.customer.create with the correct data', async () => {
      const dto = {
        firstName: 'New',
        lastName: 'Customer',
        email: 'new@example.com',
        phone: '555-5678',
      };

      const result = await service.create(dto);

      expect(result).toEqual(mockCustomer);
      expect(mockPrismaClient.customer.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            phone: dto.phone,
          }),
        }),
      );
    });
  });

  describe('update', () => {
    it('calls findOne then client.customer.update with the correct args', async () => {
      const dto = { name: 'Updated Name', phone: '555-9999' };

      const result = await service.update('cust-1', dto);

      expect(mockPrismaClient.customer.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'cust-1' } }),
      );
      expect(mockPrismaClient.customer.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'cust-1' },
          data: dto,
        }),
      );
      expect(result).toEqual(mockCustomer);
    });

    it('throws NotFoundException when the customer to update does not exist', async () => {
      mockPrismaClient.customer.findUnique.mockResolvedValue(null);

      await expect(service.update('missing-id', { firstName: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('calls client.customer.update with isActive: false to soft-delete', async () => {
      const result = await service.remove('cust-1');

      expect(mockPrismaClient.customer.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'cust-1' } }),
      );
      expect(mockPrismaClient.customer.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'cust-1' },
          data: { isActive: false },
        }),
      );
      expect(result).toEqual(mockCustomer);
    });

    it('throws NotFoundException when the customer to remove does not exist', async () => {
      mockPrismaClient.customer.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing-id')).rejects.toThrow(NotFoundException);
    });
  });
});
