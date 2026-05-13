import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, vi } from 'vitest'

// Mock Quasar globally
vi.mock('quasar', () => ({
  useQuasar: () => ({
    notify: vi.fn(),
    dialog: vi.fn(() => ({ onOk: (cb: () => void) => { cb(); return { onCancel: vi.fn() } } })),
    loading: { show: vi.fn(), hide: vi.fn() },
  }),
  boot: (fn: unknown) => fn,
  route: (fn: unknown) => fn,
}))

beforeEach(() => {
  setActivePinia(createPinia())
})

config.global.stubs = {
  'router-link': { template: '<a><slot /></a>' },
  'router-view': { template: '<div />' },
}
