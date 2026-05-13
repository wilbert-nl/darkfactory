import { Injectable } from '@nestjs/common';
import { PrismaTenancyService } from '../../tenancy/prisma-tenancy/prisma-tenancy.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prismaTenancy: PrismaTenancyService) {}

  async getSettings() {
    const client = this.prismaTenancy.getClientForCurrentTenant();
    const settings = await client.tenantSettings.findFirst();
    if (!settings) {
      // Return defaults if not yet configured
      return {
        logoUrl: null,
        primaryColor: '#1976D2',
        accentColor: '#FF4081',
        fontFamily: 'Roboto',
        tenantDisplayName: null,
      };
    }
    return settings;
  }

  async updateSettings(dto: UpdateSettingsDto) {
    const client = this.prismaTenancy.getClientForCurrentTenant();
    const existing = await client.tenantSettings.findFirst();

    if (existing) {
      return client.tenantSettings.update({
        where: { id: existing.id },
        data: dto,
      });
    }

    return client.tenantSettings.create({ data: dto });
  }
}
