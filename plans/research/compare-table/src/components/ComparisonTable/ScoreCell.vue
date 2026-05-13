<template>
  <input
    class="score-input"
    type="number"
    min="0"
    max="10"
    step="1"
    :value="score ?? ''"
    :placeholder="readonly ? '—' : '0–10'"
    :disabled="readonly"
    @change="handleChange"
    @keydown.enter="($event.target as HTMLInputElement).blur()"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  itemId: string
  criterionId: string
  score: number | null
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'update', itemId: string, criterionId: string, score: number | null): void
}>()

function handleChange(event: Event): void {
  const val = (event.target as HTMLInputElement).value
  if (val === '' || val === null) {
    emit('update', props.itemId, props.criterionId, null)
    return
  }
  const n = Math.min(10, Math.max(0, Math.round(Number(val))))
  emit('update', props.itemId, props.criterionId, n)
}
</script>
