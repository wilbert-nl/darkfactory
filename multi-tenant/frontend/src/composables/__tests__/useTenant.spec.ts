import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { tenantService } from 'src/services/tenant.service'
import { useTenantStore } from 'src/stores/tenant-store'

vi.mock('src/services/tenant.service', () => ({
  tenantService: {
    getPublicConfig: vi.fn(),
  },
}))

vi.mock('src/stores/tenant-store', () => ({
  useTenantStore: vi.fn(() => ({
    isResolved: false,
    tenant: null,
    error: null,
    setTenant: vi.fn(),
    setLoading: vi.fn(),
    setError: vi.fn(),
  })),
}))

describe('useTenant', () => {
  let mockStore: ReturnType<typeof useTenantStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    mockStore = {
      isResolved: false,
      tenant: null,
      error: null,
      setTenant: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
    }
    vi.mocked(useTenantStore).mockReturnValue(mockStore as ReturnType<typeof useTenantStore>)

    localStorage.clear()
  })

  it('resolve() extracts slug from hostname and calls getPublicConfig', async () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: 'tenant1.example.com' },
      writable: true,
    })

    const mockConfig = { id: '1', slug: 'tenant1', name: 'Tenant One' }
    vi.mocked(tenantService.getPublicConfig).mockResolvedValue(mockConfig as never)

    const { useTenant } = await import('../useTenant')
    const { resolve } = useTenant()

    await resolve()

    expect(tenantService.getPublicConfig).toHaveBeenCalledWith('tenant1')
    expect(mockStore.setTenant).toHaveBeenCalledWith(mockConfig)
  })

  it('resolve() calls store.setError when getPublicConfig throws', async () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: 'tenant1.example.com' },
      writable: true,
    })

    const error = new Error('Not found')
    vi.mocked(tenantService.getPublicConfig).mockRejectedValue(error)

    const { useTenant } = await import('../useTenant')
    const { resolve } = useTenant()

    await resolve()

    expect(mockStore.setError).toHaveBeenCalledWith(expect.any(String))
  })

  it('resolve() does NOT call getPublicConfig again when store.isResolved is true', async () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: 'tenant1.example.com' },
      writable: true,
    })

    mockStore.isResolved = true

    const { useTenant } = await import('../useTenant')
    const { resolve } = useTenant()

    await resolve()

    expect(tenantService.getPublicConfig).not.toHaveBeenCalled()
  })

  it('dev mode: uses localStorage.dev_tenant_slug when hostname is localhost', async () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    Object.defineProperty(window, 'location', {
      value: { hostname: 'localhost' },
      writable: true,
    })

    localStorage.setItem('dev_tenant_slug', 'myshop')

    const mockConfig = { id: '2', slug: 'myshop', name: 'My Shop' }
    vi.mocked(tenantService.getPublicConfig).mockResolvedValue(mockConfig as never)

    const { useTenant } = await import('../useTenant')
    const { resolve } = useTenant()

    await resolve()

    expect(tenantService.getPublicConfig).toHaveBeenCalledWith('myshop')
    expect(mockStore.setTenant).toHaveBeenCalledWith(mockConfig)

    process.env.NODE_ENV = originalEnv
  })
})
