<template>
  <slot />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTheme } from 'src/composables/useTheme'

const { applyTheme } = useTheme()
onMounted(applyTheme)
</script>
