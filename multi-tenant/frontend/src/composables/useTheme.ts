import { watch } from 'vue'
import { useTenantStore } from 'src/stores/tenant-store'

const FONT_OPTIONS = [
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Lato', value: 'Lato, sans-serif' },
  { label: 'Open Sans', value: 'Open Sans, sans-serif' },
  { label: 'Montserrat', value: 'Montserrat, sans-serif' },
]

export function useTheme() {
  const store = useTenantStore()

  function applyTheme() {
    const t = store.tenant
    if (!t) return

    const root = document.documentElement

    if (t.primaryColor) root.style.setProperty('--q-primary', t.primaryColor)
    if (t.accentColor) root.style.setProperty('--q-accent', t.accentColor)
    if (t.fontFamily) root.style.setProperty('--q-font-family', t.fontFamily)
  }

  // Reactively re-apply when tenant config changes
  watch(() => store.tenant, applyTheme, { deep: true })

  return { applyTheme, FONT_OPTIONS }
}
