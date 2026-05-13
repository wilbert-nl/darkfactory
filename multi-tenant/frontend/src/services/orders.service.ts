import { apiClient } from './api-client'
import type { Order, PaginatedResponse } from 'src/types'

export const ordersService = {
  async list(params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<Order>> {
    const { data } = await apiClient.get<PaginatedResponse<Order>>('/orders', { params })
    return data
  },

  async get(id: string): Promise<Order> {
    const { data } = await apiClient.get<Order>(`/orders/${id}`)
    return data
  },

  async updateStatus(id: string, status: Order['status']): Promise<Order> {
    const { data } = await apiClient.patch<Order>(`/orders/${id}/status`, { status })
    return data
  },
}
