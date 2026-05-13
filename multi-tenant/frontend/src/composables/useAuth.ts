import { computed } from 'vue'
import { useAuthStore } from 'src/stores/auth-store'
import type { RegisterDto } from 'src/types'

export function useAuth() {
  const store = useAuthStore()

  const currentUser = computed(() => store.user)
  const isAuthenticated = computed(() => store.isAuthenticated)
  const isLoading = computed(() => store.isLoading)
  const isSuperAdmin = computed(() => store.isSuperAdmin)
  const isImpersonating = computed(() => store.isImpersonating)
  const impersonatedTenant = computed(() => store.impersonatedTenant)

  async function login(email: string, password: string) {
    await store.login(email, password)
  }

  async function register(dto: RegisterDto) {
    return store.register(dto)
  }

  async function logout() {
    await store.logout()
  }

  function hasRole(role: 'superadmin' | 'tenant_owner' | 'tenant_user'): boolean {
    if (role === 'superadmin') return store.isSuperAdmin
    // role info comes from the JWT claims / user object
    return true // backend enforces; frontend is advisory
  }

  return {
    currentUser,
    isAuthenticated,
    isLoading,
    isSuperAdmin,
    isImpersonating,
    impersonatedTenant,
    login,
    register,
    logout,
    hasRole,
  }
}
