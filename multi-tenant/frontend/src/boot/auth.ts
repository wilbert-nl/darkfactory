import { boot } from 'quasar/wrappers'
import { useAuthStore } from 'src/stores/auth-store'

export default boot(async ({ app: _app }) => {
  const authStore = useAuthStore()
  authStore.loadFromStorage()

  // If refresh token exists, try to get a fresh access token silently
  if (authStore.refreshToken) {
    await authStore.refreshTokens()
  }
})
