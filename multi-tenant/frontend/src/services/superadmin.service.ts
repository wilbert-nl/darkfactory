import { apiClient } from './api-client'
import type { Tenant, PaginatedResponse } from 'src/types'

export interface CreateTenantDto {
  name: string
  slug: string
  plan?: string
}

export interface ImpersonateResponse {
  accessToken: string
  tenantId: string
  tenantName: string
}

export const superadminService = {
  async listTenants(params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<PaginatedResponse<Tenant>> {
    const { data } = await apiClient.get<PaginatedResponse<Tenant>>('/superadmin/tenants', { params })
    return data
  },

  async createTenant(dto: CreateTenantDto): Promise<Tenant> {
    const { data } = await apiClient.post<Tenant>('/superadmin/tenants', dto)
    return data
  },

  async updateTenant(id: string, dto: Partial<Tenant>): Promise<Tenant> {
    const { data } = await apiClient.patch<Tenant>(`/superadmin/tenants/${id}`, dto)
    return data
  },

  async impersonate(tenantId: string, targetUserId?: string): Promise<ImpersonateResponse> {
    const { data } = await apiClient.post<ImpersonateResponse>('/superadmin/impersonate', { tenantId, targetUserId })
    return data
  },
}
