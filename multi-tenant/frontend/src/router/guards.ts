import type { Router } from 'vue-router'
import { useAuthStore } from 'src/stores/auth-store'
import { useTenantStore } from 'src/stores/tenant-store'

export function setupGuards(router: Router) {
  router.beforeEach((to) => {
    const authStore = useAuthStore()
    const tenantStore = useTenantStore()

    // 1. Tenant resolution check for public pages
    if (!to.path.startsWith('/error') && !tenantStore.isResolved && tenantStore.error) {
      if (to.path !== '/error/tenant-not-found') {
        return { path: '/error/tenant-not-found' }
      }
    }

    // 2. Auth check
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      return { path: '/auth/login', query: { redirect: to.fullPath } }
    }

    // 3. Redirect authenticated users away from auth pages
    if ((to.path === '/auth/login' || to.path === '/auth/register') && authStore.isAuthenticated) {
      if (authStore.isSuperAdmin) return { path: '/superadmin/tenants' }
      return { path: '/admin/dashboard' }
    }

    // 4. Role check
    const requiredRoles = to.meta.roles
    if (requiredRoles && requiredRoles.length > 0 && authStore.isAuthenticated) {
      const isSuperAdmin = authStore.isSuperAdmin
      const hasRole = requiredRoles.some((role) => {
        if (role === 'superadmin') return isSuperAdmin
        return true // backend enforces; advisory only
      })
      if (!hasRole) return { path: '/403' }
    }

    return true
  })
}
