import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TenantPublicConfig } from 'src/types'

export const useTenantStore = defineStore('tenant', () => {
  const tenant = ref<TenantPublicConfig | null>(null)
  const isLoading = ref(false)
  const isResolved = ref(false)
  const error = ref<string | null>(null)

  function setTenant(config: TenantPublicConfig) {
    tenant.value = config
    isResolved.value = true
    error.value = null
  }

  function setLoading(val: boolean) {
    isLoading.value = val
  }

  function setError(msg: string) {
    error.value = msg
    isResolved.value = false
  }

  function reset() {
    tenant.value = null
    isLoading.value = false
    isResolved.value = false
    error.value = null
  }

  return { tenant, isLoading, isResolved, error, setTenant, setLoading, setError, reset }
})
