import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from './settings.service';
import { PrismaTenancyService } from '../../tenancy/prisma-tenancy/prisma-tenancy.service';

const mockSettings = {
  id: 'settings-1',
  logoUrl: null,
  primaryColor: '#FF0000',
  accentColor: '#00FF00',
  fontFamily: 'Inter',
  tenantDisplayName: 'Test Tenant',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrismaClient = {
  tenantSettings: {
    findFirst: jest.fn().mockResolvedValue(mockSettings),
    update: jest.fn().mockResolvedValue(mockSettings),
    create: jest.fn().mockResolvedValue(mockSettings),
  },
};

const mockPrismaTenancy = {
  getClientForCurrentTenant: jest.fn().mockReturnValue(mockPrismaClient),
};

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: PrismaTenancyService, useValue: mockPrismaTenancy },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
    jest.clearAllMocks();

    mockPrismaTenancy.getClientForCurrentTenant.mockReturnValue(mockPrismaClient);
    mockPrismaClient.tenantSettings.findFirst.mockResolvedValue(mockSettings);
    mockPrismaClient.tenantSettings.update.mockResolvedValue(mockSettings);
    mockPrismaClient.tenantSettings.create.mockResolvedValue(mockSettings);
  });

  describe('getSettings', () => {
    it('returns settings when tenant settings are found', async () => {
      const result = await service.getSettings();

      expect(result).toEqual(mockSettings);
      expect(mockPrismaClient.tenantSettings.findFirst).toHaveBeenCalledTimes(1);
    });

    it('returns defaults when tenantSettings is null', async () => {
      mockPrismaClient.tenantSettings.findFirst.mockResolvedValue(null);

      const result = await service.getSettings();

      expect(result).toEqual({
        logoUrl: null,
        primaryColor: '#1976D2',
        accentColor: '#FF4081',
        fontFamily: 'Roboto',
        tenantDisplayName: null,
      });
      expect(mockPrismaClient.tenantSettings.findFirst).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateSettings', () => {
    it('calls update when existing settings are found', async () => {
      const dto = { primaryColor: '#123456', fontFamily: 'Lato' };

      const result = await service.updateSettings(dto);

      expect(mockPrismaClient.tenantSettings.findFirst).toHaveBeenCalledTimes(1);
      expect(mockPrismaClient.tenantSettings.update).toHaveBeenCalledWith({
        where: { id: mockSettings.id },
        data: dto,
      });
      expect(mockPrismaClient.tenantSettings.create).not.toHaveBeenCalled();
      expect(result).toEqual(mockSettings);
    });

    it('calls create when no existing settings are found', async () => {
      mockPrismaClient.tenantSettings.findFirst.mockResolvedValue(null);
      const dto = { primaryColor: '#ABCDEF', tenantDisplayName: 'New Tenant' };

      const result = await service.updateSettings(dto);

      expect(mockPrismaClient.tenantSettings.findFirst).toHaveBeenCalledTimes(1);
      expect(mockPrismaClient.tenantSettings.create).toHaveBeenCalledWith({ data: dto });
      expect(mockPrismaClient.tenantSettings.update).not.toHaveBeenCalled();
      expect(result).toEqual(mockSettings);
    });
  });
});
