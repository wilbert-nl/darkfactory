import { computed } from 'vue'
import { useTenantStore } from 'src/stores/tenant-store'
import { tenantService } from 'src/services/tenant.service'

function resolveSlug(): string | null {
  const hostname = window.location.hostname

  // Localhost dev fallback: read from localStorage, then env var
  if (process.env.NODE_ENV === 'development' && (hostname === 'localhost' || hostname === '127.0.0.1')) {
    return localStorage.getItem('dev_tenant_slug') || process.env.DEV_TENANT_SLUG || null
  }

  const parts = hostname.split('.')
  if (parts.length >= 3) {
    return parts[0] || null
  }
  return null
}

export function useTenant() {
  const store = useTenantStore()

  const tenant = computed(() => store.tenant)
  const tenantSlug = computed(() => store.tenant?.slug ?? null)
  const isLoading = computed(() => store.isLoading)
  const isResolved = computed(() => store.isResolved)
  const error = computed(() => store.error)

  async function resolve() {
    if (store.isResolved) return

    const slug = resolveSlug()
    if (!slug) {
      store.setError('No tenant slug found in subdomain')
      return
    }

    store.setLoading(true)
    try {
      const config = await tenantService.getPublicConfig(slug)
      store.setTenant(config)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load tenant'
      store.setError(msg)
    } finally {
      store.setLoading(false)
    }
  }

  return { tenant, tenantSlug, isLoading, isResolved, error, resolve }
}
