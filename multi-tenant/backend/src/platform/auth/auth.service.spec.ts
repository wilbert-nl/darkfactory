import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PublicPrismaService } from '../../tenancy/prisma-tenancy/public-prisma.service';

const mockUser = {
  id: 'user-uuid-001',
  email: 'test@example.com',
  passwordHash: '',
  firstName: 'Test',
  lastName: 'User',
  isActive: true,
};

const mockPublicPrisma = {
  globalUser: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  userTenantMembership: {
    findMany: jest.fn().mockResolvedValue([]),
  },
  refreshToken: {
    create: jest.fn().mockResolvedValue({}),
    findUnique: jest.fn(),
    update: jest.fn().mockResolvedValue({}),
    updateMany: jest.fn().mockResolvedValue({}),
  },
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock.access.token'),
};

const mockConfig = {
  get: jest.fn((key: string) => {
    const map: Record<string, unknown> = {
      'auth.jwtSecret': 'test-secret',
      'auth.jwtExpiresIn': '15m',
      'auth.jwtRefreshExpiresIn': '7d',
      'auth.bcryptRounds': 4,
    };
    return map[key];
  }),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PublicPrismaService, useValue: mockPublicPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();

    mockPublicPrisma.userTenantMembership.findMany.mockResolvedValue([]);
    mockPublicPrisma.refreshToken.create.mockResolvedValue({});
    mockJwtService.sign.mockReturnValue('mock.access.token');
  });

  describe('register', () => {
    it('throws ConflictException if email already exists', async () => {
      mockPublicPrisma.globalUser.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('hashes the password and creates a user', async () => {
      mockPublicPrisma.globalUser.findUnique.mockResolvedValue(null);
      mockPublicPrisma.globalUser.create.mockResolvedValue({
        ...mockUser,
        passwordHash: 'hashed',
      });

      const result = await service.register({
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      });

      const createCall = mockPublicPrisma.globalUser.create.mock.calls[0][0];
      const isHashed = await bcrypt.compare('password123', createCall.data.passwordHash);
      expect(isHashed).toBe(true);
      expect(result.accessToken).toBe('mock.access.token');
      expect(result.refreshToken).toBeDefined();
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException for unknown email', async () => {
      mockPublicPrisma.globalUser.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'ghost@example.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for wrong password', async () => {
      mockPublicPrisma.globalUser.findUnique.mockResolvedValue({
        ...mockUser,
        passwordHash: await bcrypt.hash('correct-password', 4),
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns tokens for valid credentials', async () => {
      const hash = await bcrypt.hash('correct-password', 4);
      mockPublicPrisma.globalUser.findUnique.mockResolvedValue({
        ...mockUser,
        passwordHash: hash,
      });

      const result = await service.login({
        email: 'test@example.com',
        password: 'correct-password',
      });

      expect(result.accessToken).toBe('mock.access.token');
      expect(result.refreshToken).toBeDefined();
    });
  });

  describe('refresh', () => {
    it('throws UnauthorizedException for non-existent token', async () => {
      mockPublicPrisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refresh('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException for revoked token', async () => {
      mockPublicPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-1',
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
        user: mockUser,
      });

      await expect(service.refresh('some-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('rotates and returns new tokens for valid refresh token', async () => {
      mockPublicPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-1',
        revokedAt: null,
        expiresAt: new Date(Date.now() + 3600000),
        user: mockUser,
      });

      const result = await service.refresh('valid-token');
      expect(result.accessToken).toBe('mock.access.token');
      expect(mockPublicPrisma.refreshToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'rt-1' },
          data: { revokedAt: expect.any(Date) },
        }),
      );
    });
  });
});
