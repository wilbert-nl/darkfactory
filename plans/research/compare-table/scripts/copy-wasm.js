const { copyFileSync, mkdirSync } = require('fs')
const { resolve } = require('path')

try {
  mkdirSync(resolve(__dirname, '../public'), { recursive: true })
  copyFileSync(
    resolve(__dirname, '../node_modules/sql.js/dist/sql-wasm.wasm'),
    resolve(__dirname, '../public/sql-wasm.wasm')
  )
  console.log('✓ sql-wasm.wasm copied to public/')
} catch (e) {
  console.warn('WASM copy failed (run after pnpm install):', e.message)
}
