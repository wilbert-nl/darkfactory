import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GlobalUser, AuthTokens } from 'src/types'
import { authService } from 'src/services/auth.service'
import { configureApiClient } from 'src/services/api-client'

const REFRESH_TOKEN_KEY = 'refresh_token'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<GlobalUser | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const isLoading = ref(false)
  const impersonationToken = ref<string | null>(null)
  const impersonatedTenant = ref<{ id: string; name: string } | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)
  const isImpersonating = computed(() => !!impersonationToken.value)
  const isSuperAdmin = computed(() => !!user.value?.isSuperAdmin)

  function _applyTokens(tokens: AuthTokens) {
    accessToken.value = tokens.accessToken
    refreshToken.value = tokens.refreshToken
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
  }

  function _clearTokens() {
    accessToken.value = null
    refreshToken.value = null
    impersonationToken.value = null
    impersonatedTenant.value = null
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }

  async function login(email: string, password: string) {
    isLoading.value = true
    try {
      const resp = await authService.login(email, password)
      _applyTokens({ accessToken: resp.accessToken, refreshToken: resp.refreshToken })
      user.value = resp.user
    } finally {
      isLoading.value = false
    }
  }

  async function register(data: { email: string; password: string; firstName: string; lastName: string }) {
    isLoading.value = true
    try {
      return await authService.register(data)
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    if (refreshToken.value) {
      await authService.logout(refreshToken.value)
    }
    user.value = null
    _clearTokens()
  }

  async function refreshTokens(): Promise<string | null> {
    const stored = refreshToken.value || localStorage.getItem(REFRESH_TOKEN_KEY)
    if (!stored) return null
    try {
      const tokens = await authService.refreshToken(stored)
      _applyTokens(tokens)
      return tokens.accessToken
    } catch {
      _clearTokens()
      return null
    }
  }

  function loadFromStorage() {
    const stored = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (stored) {
      refreshToken.value = stored
    }
  }

  function startImpersonation(token: string, tenant: { id: string; name: string }) {
    impersonationToken.value = token
    impersonatedTenant.value = tenant
  }

  function endImpersonation() {
    impersonationToken.value = null
    impersonatedTenant.value = null
  }

  // Wire API client after store is created
  configureApiClient({
    getAccessToken: () => impersonationToken.value || accessToken.value,
    refreshTokens,
    logout: () => { void logout() },
  })

  return {
    user,
    accessToken,
    refreshToken,
    isLoading,
    isAuthenticated,
    isImpersonating,
    isSuperAdmin,
    impersonationToken,
    impersonatedTenant,
    login,
    register,
    logout,
    refreshTokens,
    loadFromStorage,
    startImpersonation,
    endImpersonation,
  }
})
