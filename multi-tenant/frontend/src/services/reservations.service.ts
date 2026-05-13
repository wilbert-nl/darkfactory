import { apiClient, publicAxios } from './api-client'
import type { Reservation, AvailabilitySlot, PaginatedResponse } from 'src/types'

export interface CreateReservationDto {
  productId: string
  date: string
  timeSlot: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  notes?: string
  guestCustomer?: { name: string; email: string; phone?: string }
}

export const reservationsService = {
  async list(params?: { page?: number; limit?: number; status?: string; dateFrom?: string; dateTo?: string }): Promise<PaginatedResponse<Reservation>> {
    const { data } = await apiClient.get<PaginatedResponse<Reservation>>('/reservations', { params })
    return data
  },

  async get(id: string): Promise<Reservation> {
    const { data } = await apiClient.get<Reservation>(`/reservations/${id}`)
    return data
  },

  async create(dto: CreateReservationDto): Promise<Reservation> {
    const { data } = await apiClient.post<Reservation>('/reservations', dto)
    return data
  },

  async createPublic(dto: CreateReservationDto): Promise<Reservation> {
    const { data } = await publicAxios.post<Reservation>('/reservations/public', dto)
    return data
  },

  async updateStatus(id: string, status: Reservation['status']): Promise<Reservation> {
    const { data } = await apiClient.patch<Reservation>(`/reservations/${id}/status`, { status })
    return data
  },

  async getAvailability(productId: string, date: string): Promise<AvailabilitySlot[]> {
    const { data } = await publicAxios.get<AvailabilitySlot[]>('/reservations/availability', {
      params: { productId, date },
    })
    return data
  },
}
