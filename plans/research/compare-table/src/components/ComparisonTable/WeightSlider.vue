<template>
  <q-rating
    :model-value="modelValue"
    :max="5"
    size="20px"
    color="amber"
    icon="star_border"
    icon-selected="star"
    :readonly="readonly"
    @update:model-value="(v: number) => emit('update:modelValue', v)"
  />
</template>

<script setup lang="ts">
defineProps<{
  modelValue: number
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()
</script>
