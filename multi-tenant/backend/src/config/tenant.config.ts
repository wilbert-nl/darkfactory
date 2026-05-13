import { registerAs } from '@nestjs/config';

export default registerAs('tenant', () => ({
  platformDomain: process.env.PLATFORM_DOMAIN ?? 'platform.local',
  devTenantHeader: 'x-tenant-slug',
  prismaPoolMax: 100,
}));
