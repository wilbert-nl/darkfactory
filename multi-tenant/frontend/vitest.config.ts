import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  plugins: [],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      src: resolve(__dirname, 'src'),
    },
  },
})
