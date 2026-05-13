<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card class="q-pa-xl shadow-4 text-center" style="min-width: 320px; max-width: 480px; width: 100%">
      <q-icon
        :name="errorConfig.icon"
        :color="errorConfig.iconColor"
        style="font-size: 64px"
        class="q-mb-md block"
      />

      <div class="text-h5 text-weight-bold q-mb-sm">{{ errorConfig.title }}</div>
      <div class="text-body2 text-grey-7 q-mb-xl">{{ errorConfig.subtitle }}</div>

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

interface ErrorConfig {
  icon: string
  iconColor: string
  title: string
  subtitle: string
}

const route = useRoute()

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
