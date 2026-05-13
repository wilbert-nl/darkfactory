<template>
  <q-page class="q-pa-md">
    <div v-if="!store.currentComparison" class="column items-center q-mt-xl text-grey-5">
      <q-spinner size="40px" />
    </div>

    <template v-else>
      <!-- Top bar -->
      <div class="row items-center q-mb-md q-gutter-sm">
        <q-btn flat round icon="arrow_back" @click="router.push('/')" />
        <q-input
          v-model="title"
          class="text-h6"
          dense
          borderless
          style="min-width: 240px"
          @blur="saveTitle"
          @keydown.enter="($event.target as HTMLInputElement).blur()"
        />
        <q-space />
        <q-btn outline icon="picture_as_pdf" label="Export PDF" color="primary" @click="exportPdf" />
        <q-btn outline icon="share" label="Share" color="secondary" @click="openShare" />
      </div>

      <!-- Oversized warning -->
      <q-banner v-if="isOversized" class="bg-warning text-dark q-mb-sm" rounded dense>
        <q-icon name="warning" /> Table is large (&gt;10 items or &gt;20 criteria) — share URL may be too long.
      </q-banner>

      <!-- Table -->
      <TableGrid
        :items="store.currentItems"
        :criteria="store.currentCriteria"
        :scores="store.currentScores"
        :weighted-scores="store.weightedScores"
        @rename-item="store.renameItem"
        @remove-item="store.removeItem"
        @rename-criterion="store.renameCriterion"
        @remove-criterion="store.removeCriterion"
        @set-weight="store.setWeight"
        @set-score="store.setScore"
      />

      <!-- Add row/col actions -->
      <div class="row q-mt-md q-gutter-sm">
        <q-btn
          outline
          icon="add"
          label="Add Item"
          color="primary"
          @click="store.addItem(store.currentComparison!.id)"
        />
        <q-btn
          outline
          icon="add"
          label="Add Criterion"
          color="secondary"
          @click="store.addCriterion(store.currentComparison!.id)"
        />
      </div>
    </template>

    <!-- Share dialog -->
    <ShareDialog
      v-model="shareOpen"
      :share-url="shareUrl"
      :oversized="isOversized"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useComparisonsStore } from 'src/stores/comparisons.store'
import { useShareLink } from 'src/composables/useShareLink'
import { usePdfExport } from 'src/composables/usePdfExport'
import TableGrid from 'src/components/ComparisonTable/TableGrid.vue'
import ShareDialog from 'src/components/ShareDialog.vue'

const route = useRoute()
const router = useRouter()
const store = useComparisonsStore()
const { getShareUrl } = useShareLink()
const { exportToPdf } = usePdfExport()

const title = ref('')
const shareOpen = ref(false)
const shareUrl = ref('')

const isOversized = computed(() =>
  store.currentItems.length > 10 || store.currentCriteria.length > 20
)

onMounted(() => {
  const id = route.params.id as string
  store.loadComparison(id)
  title.value = store.currentComparison?.title ?? ''
})

// Keep title in sync when comparison loads
const stopWatch = setInterval(() => {
  if (store.currentComparison && !title.value) {
    title.value = store.currentComparison.title
    clearInterval(stopWatch)
  }
}, 50)
onUnmounted(() => clearInterval(stopWatch))

function saveTitle(): void {
  if (!store.currentComparison) return
  const t = title.value.trim()
  if (t && t !== store.currentComparison.title) {
    store.updateTitle(store.currentComparison.id, t)
  }
}

function openShare(): void {
  const snap = store.getSnapshot()
  if (!snap) return
  shareUrl.value = getShareUrl(snap)
  shareOpen.value = true
}

function exportPdf(): void {
  const snap = store.getSnapshot()
  if (!snap) return
  exportToPdf(snap, store.weightedScores)
}
</script>
