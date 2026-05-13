import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { authService } from 'src/services/auth.service'
import { configureApiClient } from 'src/services/api-client'

vi.mock('src/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    refreshToken: vi.fn(),
    logout: vi.fn(),
  },
}))

vi.mock('src/services/api-client', () => ({
  configureApiClient: vi.fn(),
}))

const mockTokens = { accessToken: 'access.jwt', refreshToken: 'refresh.jwt' }
const mockLoginResponse = {
  ...mockTokens,
  user: {
    id: 'u1',
    email: 'a@b.com',
    firstName: 'A',
    lastName: 'B',
    isActive: true,
  },
}

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('login() calls authService.login, sets tokens and user, isAuthenticated becomes true', async () => {
    vi.mocked(authService.login).mockResolvedValue(mockLoginResponse as never)

    const { useAuthStore } = await import('../auth-store')
    const store = useAuthStore()

    await store.login('a@b.com', 'password123')

    expect(authService.login).toHaveBeenCalledWith('a@b.com', 'password123')
    expect(store.accessToken).toBe('access.jwt')
    expect(store.refreshToken).toBe('refresh.jwt')
    expect(store.user).toEqual(mockLoginResponse.user)
    expect(store.isAuthenticated).toBe(true)
  })

  it('login() failure — store remains unauthenticated when authService.login throws', async () => {
    vi.mocked(authService.login).mockRejectedValue(new Error('Invalid credentials'))

    const { useAuthStore } = await import('../auth-store')
    const store = useAuthStore()

    await expect(store.login('a@b.com', 'wrong')).rejects.toThrow()

    expect(store.isAuthenticated).toBe(false)
    expect(store.user).toBeNull()
    expect(store.accessToken).toBeNull()
  })

  it('logout() calls authService.logout, clears user and tokens, isAuthenticated becomes false', async () => {
    vi.mocked(authService.login).mockResolvedValue(mockLoginResponse as never)
    vi.mocked(authService.logout).mockResolvedValue(undefined as never)

    const { useAuthStore } = await import('../auth-store')
    const store = useAuthStore()

    await store.login('a@b.com', 'password123')
    expect(store.isAuthenticated).toBe(true)

    await store.logout()

    expect(authService.logout).toHaveBeenCalled()
    expect(store.user).toBeNull()
    expect(store.accessToken).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  it('refreshTokens() calls authService.refreshToken and updates accessToken when refresh token exists', async () => {
    vi.mocked(authService.login).mockResolvedValue(mockLoginResponse as never)
    vi.mocked(authService.refreshToken).mockResolvedValue({
      accessToken: 'new.access.jwt',
    } as never)

    const { useAuthStore } = await import('../auth-store')
    const store = useAuthStore()

    await store.login('a@b.com', 'password123')
    expect(store.refreshToken).toBe('refresh.jwt')

    await store.refreshTokens()

    expect(authService.refreshToken).toHaveBeenCalledWith('refresh.jwt')
    expect(store.accessToken).toBe('new.access.jwt')
  })

  it('refreshTokens() returns null without calling service when no refresh token', async () => {
    const { useAuthStore } = await import('../auth-store')
    const store = useAuthStore()

    expect(store.refreshToken).toBeNull()

    const result = await store.refreshTokens()

    expect(result).toBeNull()
    expect(authService.refreshToken).not.toHaveBeenCalled()
  })

  it('startImpersonation() sets impersonationToken and impersonatedTenant, isImpersonating becomes true', async () => {
    const { useAuthStore } = await import('../auth-store')
    const store = useAuthStore()

    const mockTenant = { id: 'tenant-1', name: 'Test Tenant' }
    store.startImpersonation('impersonate.jwt', mockTenant)

    expect(store.impersonationToken).toBe('impersonate.jwt')
    expect(store.impersonatedTenant).toEqual(mockTenant)
    expect(store.isImpersonating).toBe(true)
  })

  it('endImpersonation() clears impersonation data, isImpersonating becomes false', async () => {
    const { useAuthStore } = await import('../auth-store')
    const store = useAuthStore()

    store.startImpersonation('impersonate.jwt', { id: 'tenant-1', name: 'Test Tenant' })
    expect(store.isImpersonating).toBe(true)

    store.endImpersonation()

    expect(store.impersonationToken).toBeNull()
    expect(store.impersonatedTenant).toBeNull()
    expect(store.isImpersonating).toBe(false)
  })

  it('register() calls authService.register and returns the result', async () => {
    const mockDto = { email: 'new@user.com', password: 'secure123', firstName: 'New', lastName: 'User' }
    const mockResult = { id: 'u2', ...mockDto }
    vi.mocked(authService.register).mockResolvedValue(mockResult as never)

    const { useAuthStore } = await import('../auth-store')
    const store = useAuthStore()

    const result = await store.register(mockDto)

    expect(authService.register).toHaveBeenCalledWith(mockDto)
    expect(result).toEqual(mockResult)
  })
})
