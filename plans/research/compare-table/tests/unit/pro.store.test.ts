import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProStore } from 'src/stores/pro.store'

describe('useProStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('starts as free tier', () => {
    const store = useProStore()
    expect(store.isPro).toBe(false)
  })

  it('canCreateComparison allows up to FREE_LIMIT on free tier', () => {
    const store = useProStore()
    expect(store.canCreateComparison(0)).toBe(true)
    expect(store.canCreateComparison(2)).toBe(true)
    expect(store.canCreateComparison(3)).toBe(false)
  })

  it('canCreateComparison always true on Pro', () => {
    const store = useProStore()
    store.enablePro()
    expect(store.canCreateComparison(100)).toBe(true)
  })

  it('enablePro persists to localStorage', () => {
    const store = useProStore()
    store.enablePro()
    expect(localStorage.getItem('compare-table-pro')).toBe('true')
  })

  it('FREE_LIMIT is exactly 3', () => {
    const store = useProStore()
    expect(store.FREE_LIMIT).toBe(3)
  })
})
