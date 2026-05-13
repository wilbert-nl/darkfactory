import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'node:crypto';
import { PublicPrismaService } from '../../tenancy/prisma-tenancy/public-prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../../common/decorators/current-user.decorator';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly publicPrisma: PublicPrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokens> {
    const existing = await this.publicPrisma.globalUser.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const rounds = this.config.get<number>('auth.bcryptRounds') ?? 12;
    const passwordHash = await bcrypt.hash(dto.password, rounds);

    const user = await this.publicPrisma.globalUser.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
    });

    this.logger.log(`Registered new user: ${user.email}`);
    return this.issueTokens(user.id, user.email);
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.publicPrisma.globalUser.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user.id, user.email);
  }

  async refresh(rawRefreshToken: string): Promise<AuthTokens> {
    const tokenHash = this.hashToken(rawRefreshToken);

    const stored = await this.publicPrisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    // Rotate: revoke old, issue new
    await this.publicPrisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(stored.user.id, stored.user.email);
  }

  async logout(rawRefreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawRefreshToken);

    await this.publicPrisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async issueTokens(userId: string, email: string): Promise<AuthTokens> {
    const [memberships, user] = await Promise.all([
      this.publicPrisma.userTenantMembership.findMany({
        where: { userId },
        select: { tenantId: true, roleSlug: true },
      }),
      this.publicPrisma.globalUser.findUnique({
        where: { id: userId },
        select: { isSuperAdmin: true },
      }),
    ]);

    const payload: JwtPayload = {
      sub: userId,
      email,
      isSuperAdmin: user?.isSuperAdmin ?? false,
      tenantMemberships: memberships,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('auth.jwtSecret'),
      expiresIn: this.config.get<string>('auth.jwtExpiresIn') ?? '15m',
    });

    const rawRefresh = crypto.randomBytes(64).toString('hex');
    const tokenHash = this.hashToken(rawRefresh);

    const refreshExpiresIn = this.config.get<string>('auth.jwtRefreshExpiresIn') ?? '7d';
    const expiresAt = this.parseExpiry(refreshExpiresIn);

    await this.publicPrisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    return { accessToken, refreshToken: rawRefresh };
  }

  async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
    const user = await this.publicPrisma.globalUser.findUnique({ where: { email } });

    // Always return 200 to prevent user enumeration
    if (!user || !user.isActive) {
      return { message: 'If that email exists, a reset token has been generated.' };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.publicPrisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    this.logger.log(`Password reset token generated for user: ${user.email}`);

    // MVP: return token directly (no email transport)
    return {
      message: 'If that email exists, a reset token has been generated.',
      resetToken: rawToken,
    };
  }

  async resetPassword(rawToken: string, newPassword: string): Promise<{ message: string }> {
    const tokenHash = this.hashToken(rawToken);

    const record = await this.publicPrisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('Reset token is invalid, expired, or already used');
    }

    const rounds = this.config.get<number>('auth.bcryptRounds') ?? 12;
    const passwordHash = await bcrypt.hash(newPassword, rounds);

    await this.publicPrisma.$transaction([
      this.publicPrisma.globalUser.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      this.publicPrisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    this.logger.log(`Password reset completed for user: ${record.userId}`);
    return { message: 'Password reset successful' };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private parseExpiry(value: string): Date {
    const now = Date.now();
    const match = /^(\d+)([smhd])$/.exec(value);
    if (!match) return new Date(now + 7 * 24 * 60 * 60 * 1000);

    const amount = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(now + amount * (multipliers[unit] ?? 0));
  }
}
