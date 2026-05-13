import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import { resolve } from 'path'
export default defineConfig({
  plugins: [
    vue({ template: { transformAssetUrls } }),
    quasar({ sassVariables: 'src/css/quasar.variables.scss' })
  ],
  resolve: { alias: { src: resolve(__dirname, 'src') } },
  server: { port: 9030, strictPort: true }
})
