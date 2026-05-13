import { ref } from 'vue'
import { publicAxios, apiClient } from 'src/services/api-client'

export function useApi() {
  const isLoading = ref(false)

  return {
    publicApi: publicAxios,
    authApi: apiClient,
    isLoading,
  }
}
