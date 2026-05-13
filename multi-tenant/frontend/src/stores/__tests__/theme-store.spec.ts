import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useThemeStore } from '../theme-store'

describe('useThemeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    document.body.classList.remove('body--dark')
    document.documentElement.style.removeProperty('--q-primary')
    document.documentElement.style.removeProperty('--q-accent')
    document.documentElement.style.removeProperty('--q-font-family')
  })

  afterEach(() => {
    localStorage.clear()
    document.body.classList.remove('body--dark')
    document.documentElement.style.removeProperty('--q-primary')
    document.documentElement.style.removeProperty('--q-accent')
    document.documentElement.style.removeProperty('--q-font-family')
  })

  describe('loadFromStorage', () => {
    it('sets isDark=true when localStorage has theme_dark=true', () => {
      localStorage.setItem('theme_dark', 'true')

      const store = useThemeStore()
      store.loadFromStorage()

      expect(store.isDark).toBe(true)
    })

    it('sets isDark=false when localStorage has theme_dark=false', () => {
      localStorage.setItem('theme_dark', 'false')

      const store = useThemeStore()
      store.loadFromStorage()

      expect(store.isDark).toBe(false)
    })

    it('stays false when localStorage key is missing', () => {
      const store = useThemeStore()
      store.loadFromStorage()

      expect(store.isDark).toBe(false)
    })

    it('adds body--dark class to document.body when isDark=true', () => {
      localStorage.setItem('theme_dark', 'true')

      const store = useThemeStore()
      store.loadFromStorage()

      expect(document.body.classList.contains('body--dark')).toBe(true)
    })

    it('does not add body--dark class when isDark=false', () => {
      localStorage.setItem('theme_dark', 'false')

      const store = useThemeStore()
      store.loadFromStorage()

      expect(document.body.classList.contains('body--dark')).toBe(false)
    })
  })

  describe('toggleDark', () => {
    it('flips isDark from false to true', () => {
      const store = useThemeStore()
      expect(store.isDark).toBe(false)

      store.toggleDark()

      expect(store.isDark).toBe(true)
    })

    it('flips isDark from true to false', () => {
      const store = useThemeStore()
      store.isDark = true

      store.toggleDark()

      expect(store.isDark).toBe(false)
    })

    it('writes isDark to localStorage when toggled to true', () => {
      const store = useThemeStore()

      store.toggleDark()

      expect(localStorage.getItem('theme_dark')).toBe('true')
    })

    it('writes isDark to localStorage when toggled to false', () => {
      const store = useThemeStore()
      store.isDark = true
      localStorage.setItem('theme_dark', 'true')

      store.toggleDark()

      expect(localStorage.getItem('theme_dark')).toBe('false')
    })

    it('adds body--dark class when toggled to true', () => {
      const store = useThemeStore()

      store.toggleDark()

      expect(document.body.classList.contains('body--dark')).toBe(true)
    })

    it('removes body--dark class when toggled to false', () => {
      const store = useThemeStore()
      store.isDark = true
      document.body.classList.add('body--dark')

      store.toggleDark()

      expect(document.body.classList.contains('body--dark')).toBe(false)
    })
  })

  describe('applyTenantTheme', () => {
    it('sets primaryColor, accentColor, and fontFamily state', () => {
      const store = useThemeStore()

      store.applyTenantTheme('#FF0000', '#00FF00', 'Arial')

      expect(store.primaryColor).toBe('#FF0000')
      expect(store.accentColor).toBe('#00FF00')
      expect(store.fontFamily).toBe('Arial')
    })

    it('sets --q-primary CSS variable on documentElement', () => {
      const store = useThemeStore()
      const setPropertySpy = vi.spyOn(document.documentElement.style, 'setProperty')

      store.applyTenantTheme('#1976D2', '#FF4081', 'Roboto')

      expect(setPropertySpy).toHaveBeenCalledWith('--q-primary', '#1976D2')
    })

    it('sets --q-accent CSS variable on documentElement', () => {
      const store = useThemeStore()
      const setPropertySpy = vi.spyOn(document.documentElement.style, 'setProperty')

      store.applyTenantTheme('#1976D2', '#FF4081', 'Roboto')

      expect(setPropertySpy).toHaveBeenCalledWith('--q-accent', '#FF4081')
    })

    it('sets --q-font-family CSS variable on documentElement', () => {
      const store = useThemeStore()
      const setPropertySpy = vi.spyOn(document.documentElement.style, 'setProperty')

      store.applyTenantTheme('#1976D2', '#FF4081', 'Roboto')

      expect(setPropertySpy).toHaveBeenCalledWith('--q-font-family', 'Roboto')
    })

    it('applies all three CSS variables in sequence', () => {
      const store = useThemeStore()

      store.applyTenantTheme('#FF0000', '#00FF00', 'Inter')

      expect(document.documentElement.style.getPropertyValue('--q-primary')).toBe('#FF0000')
      expect(document.documentElement.style.getPropertyValue('--q-accent')).toBe('#00FF00')
      expect(document.documentElement.style.getPropertyValue('--q-font-family')).toBe('Inter')
    })

    it('handles hex colors and font family names', () => {
      const store = useThemeStore()

      store.applyTenantTheme('#ABC123', '#DEF456', 'Trebuchet MS')

      expect(store.primaryColor).toBe('#ABC123')
      expect(store.accentColor).toBe('#DEF456')
      expect(store.fontFamily).toBe('Trebuchet MS')
    })
  })

  describe('currentTheme computed property', () => {
    it('returns object with isDark, primaryColor, accentColor, fontFamily', () => {
      const store = useThemeStore()

      const theme = store.currentTheme

      expect(theme).toEqual({
        isDark: false,
        primaryColor: '#1976D2',
        accentColor: '#FF4081',
        fontFamily: 'Roboto',
      })
    })

    it('reflects changes to state in computed property', () => {
      const store = useThemeStore()

      store.isDark = true
      store.primaryColor = '#FF0000'

      expect(store.currentTheme.isDark).toBe(true)
      expect(store.currentTheme.primaryColor).toBe('#FF0000')
    })

    it('updates when applyTenantTheme is called', () => {
      const store = useThemeStore()

      store.applyTenantTheme('#FFFFFF', '#000000', 'Georgia')

      expect(store.currentTheme).toEqual({
        isDark: false,
        primaryColor: '#FFFFFF',
        accentColor: '#000000',
        fontFamily: 'Georgia',
      })
    })
  })

  describe('integration', () => {
    it('loadFromStorage -> toggleDark -> applyTenantTheme workflow', () => {
      localStorage.setItem('theme_dark', 'true')

      const store = useThemeStore()
      store.loadFromStorage()
      expect(store.isDark).toBe(true)

      store.toggleDark()
      expect(store.isDark).toBe(false)

      store.applyTenantTheme('#FF0000', '#00FF00', 'Courier')
      expect(store.currentTheme).toEqual({
        isDark: false,
        primaryColor: '#FF0000',
        accentColor: '#00FF00',
        fontFamily: 'Courier',
      })
    })
  })
})
