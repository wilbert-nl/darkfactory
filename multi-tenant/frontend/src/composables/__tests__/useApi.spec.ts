import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useApi } from '../useApi'

vi.mock('src/services/api-client', () => ({
  publicAxios: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('useApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('composition', () => {
    it('returns an object with publicApi, authApi, and isLoading properties', () => {
      const { publicApi, authApi, isLoading } = useApi()

      expect(publicApi).toBeDefined()
      expect(authApi).toBeDefined()
      expect(isLoading).toBeDefined()
    })

    it('publicApi is not null or undefined', () => {
      const { publicApi } = useApi()

      expect(publicApi).not.toBeNull()
      expect(publicApi).not.toBeUndefined()
    })

    it('authApi is not null or undefined', () => {
      const { authApi } = useApi()

      expect(authApi).not.toBeNull()
      expect(authApi).not.toBeUndefined()
    })

    it('isLoading is a ref with initial value false', () => {
      const { isLoading } = useApi()

      expect(isLoading.value).toBe(false)
    })
  })

  describe('isLoading ref', () => {
    it('isLoading is reactive and starts as false', () => {
      const { isLoading } = useApi()

      expect(isLoading.value).toBe(false)
    })

    it('isLoading can be toggled', () => {
      const { isLoading } = useApi()

      isLoading.value = true
      expect(isLoading.value).toBe(true)

      isLoading.value = false
      expect(isLoading.value).toBe(false)
    })
  })

  describe('publicApi', () => {
    it('has get method', () => {
      const { publicApi } = useApi()

      expect(publicApi).toHaveProperty('get')
      expect(typeof publicApi.get).toBe('function')
    })

    it('has post method', () => {
      const { publicApi } = useApi()

      expect(publicApi).toHaveProperty('post')
      expect(typeof publicApi.post).toBe('function')
    })

    it('has put method', () => {
      const { publicApi } = useApi()

      expect(publicApi).toHaveProperty('put')
      expect(typeof publicApi.put).toBe('function')
    })

    it('has delete method', () => {
      const { publicApi } = useApi()

      expect(publicApi).toHaveProperty('delete')
      expect(typeof publicApi.delete).toBe('function')
    })
  })

  describe('authApi', () => {
    it('has get method', () => {
      const { authApi } = useApi()

      expect(authApi).toHaveProperty('get')
      expect(typeof authApi.get).toBe('function')
    })

    it('has post method', () => {
      const { authApi } = useApi()

      expect(authApi).toHaveProperty('post')
      expect(typeof authApi.post).toBe('function')
    })

    it('has put method', () => {
      const { authApi } = useApi()

      expect(authApi).toHaveProperty('put')
      expect(typeof authApi.put).toBe('function')
    })

    it('has delete method', () => {
      const { authApi } = useApi()

      expect(authApi).toHaveProperty('delete')
      expect(typeof authApi.delete).toBe('function')
    })
  })

  describe('multiple instances', () => {
    it('can create multiple instances of useApi without interference', () => {
      const instance1 = useApi()
      const instance2 = useApi()

      instance1.isLoading.value = true
      expect(instance2.isLoading.value).toBe(false)

      instance2.isLoading.value = true
      expect(instance1.isLoading.value).toBe(true)
    })

    it('publicApi and authApi are accessible independently', () => {
      const api1 = useApi()
      const api2 = useApi()

      expect(api1.publicApi).toBeDefined()
      expect(api2.publicApi).toBeDefined()
      expect(api1.authApi).toBeDefined()
      expect(api2.authApi).toBeDefined()
    })
  })
})
