import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const DARK_MODE_KEY = 'theme_dark'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)
  const primaryColor = ref('#1976D2')
  const accentColor = ref('#FF4081')
  const fontFamily = ref('Roboto')

  const currentTheme = computed(() => ({
    isDark: isDark.value,
    primaryColor: primaryColor.value,
    accentColor: accentColor.value,
    fontFamily: fontFamily.value,
  }))

  function toggleDark() {
    isDark.value = !isDark.value
    localStorage.setItem(DARK_MODE_KEY, String(isDark.value))
    document.body.classList.toggle('body--dark', isDark.value)
  }

  function applyTenantTheme(primary: string, accent: string, font: string) {
    primaryColor.value = primary
    accentColor.value = accent
    fontFamily.value = font

    const root = document.documentElement
    root.style.setProperty('--q-primary', primary)
    root.style.setProperty('--q-accent', accent)
    root.style.setProperty('--q-font-family', font)
  }

  function loadFromStorage() {
    const stored = localStorage.getItem(DARK_MODE_KEY)
    if (stored !== null) {
      isDark.value = stored === 'true'
      document.body.classList.toggle('body--dark', isDark.value)
    }
  }

  return {
    isDark,
    primaryColor,
    accentColor,
    fontFamily,
    currentTheme,
    toggleDark,
    applyTenantTheme,
    loadFromStorage,
  }
})
