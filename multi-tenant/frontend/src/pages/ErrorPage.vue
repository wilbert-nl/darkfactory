<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card class="q-pa-xl shadow-4 text-center" style="min-width: 320px; max-width: 520px; width: 100%">
      <q-icon
        :name="errorConfig.icon"
        :color="errorConfig.iconColor"
        style="font-size: 64px"
        class="q-mb-md block"
      />

      <div class="text-h5 text-weight-bold q-mb-sm">{{ errorConfig.title }}</div>
      <div class="text-body2 text-grey-7 q-mb-xl">{{ errorConfig.subtitle }}</div>

      <!-- Dev-mode setup panel: only shown in development builds -->
      <q-banner
        v-if="isDevMode && isTenantError"
        rounded
        class="bg-amber-1 text-left q-mb-lg"
        style="border: 1px solid #f0c040"
      >
        <template #avatar>
          <q-icon name="construction" color="amber-9" />
        </template>
        <div class="text-subtitle2 text-amber-9 q-mb-sm">Dev Setup Required</div>
        <ol class="q-pl-md q-ma-none text-body2 text-grey-9" style="line-height: 1.8">
          <li>Start backend: <code>cd backend &amp;&amp; npm run start:dev</code></li>
          <li>
            Set tenant — run in browser console:
            <pre class="q-mt-xs q-mb-none bg-grey-3 q-pa-sm rounded-borders text-caption" style="overflow-x: auto; white-space: pre-wrap">localStorage.setItem('dev_tenant_slug', 'laundry-demo')
location.reload()</pre>
          </li>
        </ol>
        <div v-if="devHint" class="q-mt-sm text-caption text-amber-9">
          Current error: <strong>{{ devHint }}</strong>
        </div>
      </q-banner>

      <q-btn
        label="Go Home"
        color="primary"
        to="/"
        unelevated
      />
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTenantStore } from 'src/stores/tenant-store'

interface ErrorConfig {
  icon: string
  iconColor: string
  title: string
  subtitle: string
}

const route = useRoute()
const tenantStore = useTenantStore()

const isDevMode = import.meta.env.DEV

const isTenantError = computed(() => route.path === '/error/tenant-not-found')

const devHint = computed(() => {
  if (!isTenantError.value) return null
  switch (tenantStore.errorType) {
    case 'NO_SLUG':
      return 'No dev_tenant_slug set in localStorage'
    case 'BACKEND_DOWN':
      return 'Backend unreachable — is the server running on :3000?'
    case 'TENANT_NOT_FOUND':
      return 'Backend responded: tenant slug not found in database'
    default:
      return null
  }
})

const errorConfig = computed<ErrorConfig>(() => {
  switch (route.path) {
    case '/403':
      return {
        icon: 'lock',
        iconColor: 'warning',
        title: 'Access Denied',
        subtitle: "You don't have permission to view this page.",
      }
    case '/error/tenant-not-found':
      return {
        icon: 'domain_disabled',
        iconColor: 'negative',
        title: 'Tenant Not Found',
        subtitle: "We couldn't identify the tenant for this URL.",
      }
    default:
      return {
        icon: 'search_off',
        iconColor: 'grey',
        title: 'Page Not Found',
        subtitle: "The page you're looking for doesn't exist or has been moved.",
      }
  }
})
</script>
