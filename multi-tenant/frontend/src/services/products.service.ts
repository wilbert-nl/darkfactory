import { apiClient, publicAxios } from './api-client'
import type { Product, ProductCategory, CreateProductDto, PaginatedResponse } from 'src/types'

export const productsService = {
  async list(params?: { page?: number; limit?: number; search?: string; categoryId?: string }): Promise<PaginatedResponse<Product>> {
    const { data } = await apiClient.get<PaginatedResponse<Product>>('/products', { params })
    return data
  },

  async listPublic(params?: { page?: number; limit?: number; categoryId?: string }): Promise<PaginatedResponse<Product>> {
    const { data } = await publicAxios.get<PaginatedResponse<Product>>('/products', { params: { ...params, isActive: true } })
    return data
  },

  async get(id: string): Promise<Product> {
    const { data } = await apiClient.get<Product>(`/products/${id}`)
    return data
  },

  async create(dto: CreateProductDto): Promise<Product> {
    const { data } = await apiClient.post<Product>('/products', dto)
    return data
  },

  async update(id: string, dto: Partial<CreateProductDto>): Promise<Product> {
    const { data } = await apiClient.patch<Product>(`/products/${id}`, dto)
    return data
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`)
  },

  async listCategories(): Promise<ProductCategory[]> {
    const { data } = await apiClient.get<ProductCategory[]>('/products/categories')
    return data
  },

  async createCategory(name: string, description?: string): Promise<ProductCategory> {
    const { data } = await apiClient.post<ProductCategory>('/products/categories', { name, description })
    return data
  },

  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/products/categories/${id}`)
  },
}
