import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { PrismaTenancyService } from '../../tenancy/prisma-tenancy/prisma-tenancy.service';

const mockReservation = {
  id: 'res-1',
  status: 'PENDING',
  startTime: new Date(),
  endTime: new Date(),
  customerId: 'cust-1',
  productId: 'prod-1',
  notes: null,
  metadata: null,
  customer: null,
  product: null,
};

const mockPrismaClient = {
  reservation: {
    findMany: jest.fn().mockResolvedValue([mockReservation]),
    findUnique: jest.fn().mockResolvedValue(mockReservation),
    create: jest.fn().mockResolvedValue(mockReservation),
    update: jest.fn().mockResolvedValue({ ...mockReservation, status: 'CANCELLED' }),
  },
};

const mockPrismaTenancy = {
  getClientForCurrentTenant: jest.fn().mockReturnValue(mockPrismaClient),
};

describe('ReservationsService', () => {
  let service: ReservationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: PrismaTenancyService, useValue: mockPrismaTenancy },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    jest.clearAllMocks();

    mockPrismaTenancy.getClientForCurrentTenant.mockReturnValue(mockPrismaClient);
    mockPrismaClient.reservation.findMany.mockResolvedValue([mockReservation]);
    mockPrismaClient.reservation.findUnique.mockResolvedValue(mockReservation);
    mockPrismaClient.reservation.create.mockResolvedValue(mockReservation);
    mockPrismaClient.reservation.update.mockResolvedValue({
      ...mockReservation,
      status: 'CANCELLED',
    });
  });

  describe('findAll', () => {
    it('returns all reservations when no status filter is provided', async () => {
      const result = await service.findAll();

      expect(result).toEqual([mockReservation]);
      expect(mockPrismaClient.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });

    it('filters by status when status is provided', async () => {
      await service.findAll('PENDING');

      expect(mockPrismaClient.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'PENDING' } }),
      );
    });
  });

  describe('findOne', () => {
    it('returns the reservation when found', async () => {
      const result = await service.findOne('res-1');

      expect(result).toEqual(mockReservation);
      expect(mockPrismaClient.reservation.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'res-1' } }),
      );
    });

    it('throws NotFoundException when reservation does not exist', async () => {
      mockPrismaClient.reservation.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('calls client.reservation.create with the correct data', async () => {
      const dto = {
        customerId: 'cust-1',
        productId: 'prod-1',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        notes: 'Please confirm',
        metadata: undefined,
      };

      const result = await service.create(dto);

      expect(result).toEqual(mockReservation);
      expect(mockPrismaClient.reservation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            customerId: dto.customerId,
            productId: dto.productId,
            notes: dto.notes,
          }),
        }),
      );
    });
  });

  describe('update', () => {
    it('calls findOne then client.reservation.update with the correct args', async () => {
      const dto = { notes: 'Updated notes' };

      await service.update('res-1', dto);

      expect(mockPrismaClient.reservation.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'res-1' } }),
      );
      expect(mockPrismaClient.reservation.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'res-1' } }),
      );
    });

    it('throws NotFoundException when the reservation to update does not exist', async () => {
      mockPrismaClient.reservation.findUnique.mockResolvedValue(null);

      await expect(service.update('missing-id', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancel', () => {
    it('sets status to CANCELLED via client.reservation.update', async () => {
      const result = await service.cancel('res-1');

      expect(mockPrismaClient.reservation.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'res-1' } }),
      );
      expect(mockPrismaClient.reservation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'res-1' },
          data: { status: 'CANCELLED' },
        }),
      );
      expect(result.status).toBe('CANCELLED');
    });

    it('throws NotFoundException when the reservation to cancel does not exist', async () => {
      mockPrismaClient.reservation.findUnique.mockResolvedValue(null);

      await expect(service.cancel('missing-id')).rejects.toThrow(NotFoundException);
    });
  });
});
