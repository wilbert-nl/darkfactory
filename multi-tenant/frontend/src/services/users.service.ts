import { apiClient } from './api-client'
import type { TenantUser, PaginatedResponse } from 'src/types'

export const usersService = {
  async list(params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<TenantUser>> {
    const { data } = await apiClient.get<PaginatedResponse<TenantUser>>('/tenants/users', { params })
    return data
  },

  async invite(email: string, role: string): Promise<TenantUser> {
    const { data } = await apiClient.post<TenantUser>('/tenants/users/invite', { email, role })
    return data
  },

  async updateRole(userId: string, role: string): Promise<TenantUser> {
    const { data } = await apiClient.patch<TenantUser>(`/tenants/users/${userId}/role`, { role })
    return data
  },

  async setStatus(userId: string, isActive: boolean): Promise<TenantUser> {
    const { data } = await apiClient.patch<TenantUser>(`/tenants/users/${userId}/status`, { isActive })
    return data
  },
}
