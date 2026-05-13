/* eslint-env node */
const { configure } = require('quasar/wrappers')

module.exports = configure(function (/* ctx */) {
  return {
    eslint: {
      fix: false,
      include: [],
      exclude: [],
      rawOptions: {},
      warnings: true,
      errors: true,
    },

    boot: ['pinia', 'auth', 'tenant', 'api'],

    css: ['app.scss'],

    extras: ['roboto-font', 'material-icons'],

    build: {
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node20',
      },
      vueRouterMode: 'history',
      vitePlugins: [],
      env: {
        API_BASE_URL: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
        DEV_TENANT_SLUG: process.env.VITE_DEV_TENANT_SLUG || 'laundry-demo',
      },
    },

    devServer: {
      open: false,
      port: 9000,
      proxy: {
        '/api': {
          target: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },

    framework: {
      config: {},
      plugins: ['Notify', 'Dialog', 'Loading', 'LocalStorage'],
    },

    animations: [],

    ssr: {
      pwa: false,
      prodPort: 3000,
      middlewares: [],
    },

    pwa: {
      workboxMode: 'generateSW',
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false,
    },

    cordova: {},

    capacitor: {
      hideSplashscreen: true,
    },

    electron: {
      inspectPort: 5858,
      bundler: 'packager',
      packager: {},
      builder: {},
    },

    bex: {
      contentScripts: ['my-content-script'],
    },
  }
})
