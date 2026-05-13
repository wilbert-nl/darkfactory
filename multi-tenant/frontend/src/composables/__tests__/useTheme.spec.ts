import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTenantStore } from 'src/stores/tenant-store'

vi.mock('src/stores/tenant-store', () => ({
  useTenantStore: vi.fn(),
}))

const buildMockStore = (tenant: Record<string, unknown> | null) => ({
  tenant,
  isResolved: !!tenant,
  error: null,
})

describe('useTheme', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    // Reset any CSS variables set on documentElement between tests
    document.documentElement.style.removeProperty('--q-primary')
    document.documentElement.style.removeProperty('--q-font-family')
  })

  it('applyTheme() sets --q-primary when tenant has primaryColor', async () => {
    vi.mocked(useTenantStore).mockReturnValue(
      buildMockStore({ primaryColor: '#FF0000', name: 'Test' }) as ReturnType<typeof useTenantStore>,
    )

    const setPropertySpy = vi.spyOn(document.documentElement.style, 'setProperty')

    const { useTheme } = await import('../useTheme')
    const { applyTheme } = useTheme()

    applyTheme()

    expect(setPropertySpy).toHaveBeenCalledWith('--q-primary', '#FF0000')
  })

  it('applyTheme() sets --q-font-family when tenant has fontFamily', async () => {
    vi.mocked(useTenantStore).mockReturnValue(
      buildMockStore({ fontFamily: 'Inter, sans-serif', name: 'Test' }) as ReturnType<typeof useTenantStore>,
    )

    const setPropertySpy = vi.spyOn(document.documentElement.style, 'setProperty')

    const { useTheme } = await import('../useTheme')
    const { applyTheme } = useTheme()

    applyTheme()

    expect(setPropertySpy).toHaveBeenCalledWith('--q-font-family', 'Inter, sans-serif')
  })

  it('applyTheme() does NOT throw when store.tenant is null', async () => {
    vi.mocked(useTenantStore).mockReturnValue(
      buildMockStore(null) as ReturnType<typeof useTenantStore>,
    )

    const { useTheme } = await import('../useTheme')
    const { applyTheme } = useTheme()

    expect(() => applyTheme()).not.toThrow()
  })

  it('FONT_OPTIONS is an array with at least 5 items, each having label and value', async () => {
    const { useTheme } = await import('../useTheme')
    const { FONT_OPTIONS } = useTheme()

    expect(Array.isArray(FONT_OPTIONS)).toBe(true)
    expect(FONT_OPTIONS.length).toBeGreaterThanOrEqual(5)

    for (const option of FONT_OPTIONS) {
      expect(option).toHaveProperty('label')
      expect(option).toHaveProperty('value')
      expect(typeof option.label).toBe('string')
      expect(typeof option.value).toBe('string')
    }
  })
})
