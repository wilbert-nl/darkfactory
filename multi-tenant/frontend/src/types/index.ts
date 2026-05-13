export interface TenantPublicConfig {
  id: string
  name: string
  slug: string
  primaryColor: string
  accentColor: string
  fontFamily: string
  logoUrl: string | null
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED'
}

export interface GlobalUser {
  id: string
  email: string
  firstName: string
  lastName: string
  isActive: boolean
  isSuperAdmin?: boolean
}

export interface TenantUser {
  id: string
  globalUserId: string
  email: string
  firstName: string
  lastName: string
  role: 'tenant_owner' | 'tenant_user' | string
  isActive: boolean
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: GlobalUser
}

export interface RegisterDto {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  categoryId: string | null
  categoryName?: string
  imageUrl: string | null
  isActive: boolean
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export interface ProductCategory {
  id: string
  name: string
  description: string | null
  isActive: boolean
}

export interface CreateProductDto {
  name: string
  description?: string
  price: number
  categoryId?: string
  imageUrl?: string
  isActive?: boolean
  metadata?: Record<string, unknown>
}

export interface Reservation {
  id: string
  productId: string
  productName?: string
  customerId: string | null
  customerName: string
  customerEmail: string
  date: string
  timeSlot: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  notes: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export interface AvailabilitySlot {
  timeSlot: string
  available: boolean
}

export interface Order {
  id: string
  customerId: string | null
  customerName: string
  customerEmail: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED'
  total: number
  items: OrderItem[]
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Tenant {
  id: string
  name: string
  slug: string
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED'
  plan: string
  createdAt: string
}

export interface TenantSettings {
  id: string
  tenantName: string
  primaryColor: string
  accentColor: string
  fontFamily: string
  logoUrl: string | null
  contactEmail: string | null
  contactPhone: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface RouteMetaAuth {
  requiresAuth?: boolean
  roles?: Array<'superadmin' | 'tenant_owner' | 'tenant_user'>
}
