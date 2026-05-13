import { publicAxios, apiClient } from './api-client'
import type { TenantPublicConfig, TenantSettings } from 'src/types'

export const tenantService = {
  async getPublicConfig(slug: string): Promise<TenantPublicConfig> {
    const { data } = await publicAxios.get<TenantPublicConfig>(`/tenants/${slug}/public-config`)
    return data
  },

  async getTenantSettings(): Promise<TenantSettings> {
    const { data } = await apiClient.get<TenantSettings>('/tenant-settings')
    return data
  },

  async updateTenantSettings(settings: Partial<TenantSettings>): Promise<TenantSettings> {
    const { data } = await apiClient.put<TenantSettings>('/tenant-settings', settings)
    return data
  },

  async uploadLogo(file: File): Promise<{ logoUrl: string }> {
    const form = new FormData()
    form.append('logo', file)
    const { data } = await apiClient.post<{ logoUrl: string }>('/tenant-settings/logo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
}
