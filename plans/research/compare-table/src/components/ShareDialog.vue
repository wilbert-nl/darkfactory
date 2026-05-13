<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card style="min-width: 400px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Share Comparison</div>
        <q-space />
        <q-btn flat round dense icon="close" @click="emit('update:modelValue', false)" />
      </q-card-section>

      <q-card-section>
        <p class="text-caption text-grey-7">
          This link encodes your full comparison locally — no data is sent to any server.
        </p>
        <q-input
          readonly
          :model-value="shareUrl"
          dense
          outlined
          label="Share URL"
          @click="selectAll"
        >
          <template #append>
            <q-btn flat icon="content_copy" @click="copyUrl" />
          </template>
        </q-input>
        <div v-if="copied" class="text-positive text-caption q-mt-xs">
          ✓ Copied to clipboard
        </div>
        <div v-if="oversized" class="text-warning text-caption q-mt-sm">
          ⚠ Large comparison — URL may not work in all browsers (&gt;10 items or &gt;20 criteria).
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  modelValue: boolean
  shareUrl: string
  oversized?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const copied = ref(false)

function selectAll(e: Event): void {
  ;(e.target as HTMLInputElement).select()
}

async function copyUrl(): Promise<void> {
  await navigator.clipboard.writeText(props.shareUrl)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>
