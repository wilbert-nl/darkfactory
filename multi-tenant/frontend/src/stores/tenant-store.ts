import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TenantPublicConfig } from 'src/types'

export type TenantErrorType = 'NO_SLUG' | 'BACKEND_DOWN' | 'TENANT_NOT_FOUND'

export const useTenantStore = defineStore('tenant', () => {
  const tenant = ref<TenantPublicConfig | null>(null)
  const isLoading = ref(false)
  const isResolved = ref(false)
  const error = ref<string | null>(null)
  const errorType = ref<TenantErrorType | null>(null)

  function setTenant(config: TenantPublicConfig) {
    tenant.value = config
    isResolved.value = true
    error.value = null
    errorType.value = null
  }

  function setLoading(val: boolean) {
    isLoading.value = val
  }

  function setError(msg: string, type: TenantErrorType) {
    error.value = msg
    errorType.value = type
    isResolved.value = false
  }

  function reset() {
    tenant.value = null
    isLoading.value = false
    isResolved.value = false
    error.value = null
    errorType.value = null
  }

  return { tenant, isLoading, isResolved, error, errorType, setTenant, setLoading, setError, reset }
})
