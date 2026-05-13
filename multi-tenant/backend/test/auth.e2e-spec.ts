import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '../src/app.module';
import { PublicPrismaService } from '../src/tenancy/prisma-tenancy/public-prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  const mockUser = {
    id: 'u1',
    email: 'test@example.com',
    passwordHash: '',
    firstName: 'Test',
    lastName: 'User',
    isActive: true,
  };

  const mockPublicPrisma = {
    globalUser: {
      findUnique: jest.fn(),
      create: jest.fn().mockResolvedValue(mockUser),
    },
    userTenantMembership: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    refreshToken: {
      create: jest.fn().mockResolvedValue({ id: 'rt-1' }),
      findUnique: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({}),
    },
  };

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash('password123', 4);
    mockUser.passwordHash = hashedPassword;
    mockPublicPrisma.globalUser.create.mockResolvedValue(mockUser);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PublicPrismaService)
      .useValue(mockPublicPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Restore default mock implementations after clearAllMocks
    mockPublicPrisma.globalUser.findUnique.mockResolvedValue(null);
    mockPublicPrisma.globalUser.create.mockResolvedValue(mockUser);
    mockPublicPrisma.userTenantMembership.findMany.mockResolvedValue([]);
    mockPublicPrisma.refreshToken.create.mockResolvedValue({ id: 'rt-1' });
    mockPublicPrisma.refreshToken.findUnique.mockResolvedValue(null);
    mockPublicPrisma.refreshToken.update.mockResolvedValue({});
    mockPublicPrisma.refreshToken.updateMany.mockResolvedValue({});
  });

  describe('POST /auth/register', () => {
    it('should register a new user and return tokens (201)', async () => {
      mockPublicPrisma.globalUser.findUnique.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should return 409 ConflictException when email already exists', async () => {
      mockPublicPrisma.globalUser.findUnique.mockResolvedValue(mockUser);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    it('should return tokens for valid credentials (200)', async () => {
      mockPublicPrisma.globalUser.findUnique.mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should return 401 for wrong password', async () => {
      mockPublicPrisma.globalUser.findUnique.mockResolvedValue(mockUser);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should return 401 for inactive user', async () => {
      mockPublicPrisma.globalUser.findUnique.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should return 401 when no auth header is provided', async () => {
      await request(app.getHttpServer()).post('/auth/logout').expect(401);
    });
  });
});
