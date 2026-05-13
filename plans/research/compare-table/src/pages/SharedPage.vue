<template>
  <q-page class="q-pa-lg">
    <div v-if="error" class="column items-center q-mt-xl text-grey-5">
      <q-icon name="link_off" size="60px" color="grey-4" />
      <div class="text-h6 q-mt-md">Invalid or expired share link</div>
      <q-btn class="q-mt-lg" color="primary" label="Go to Dashboard" @click="router.push('/')" />
    </div>

    <template v-else-if="data">
      <div class="row items-center q-mb-md">
        <div class="text-h5 text-weight-bold">{{ data.comparison.title }}</div>
        <q-space />
        <q-btn outline icon="picture_as_pdf" label="Export PDF" color="primary" @click="exportPdf" />
        <q-btn
          class="q-ml-sm"
          color="primary"
          icon="file_copy"
          label="Save a Copy"
          @click="saveACopy"
        />
      </div>
      <p class="text-caption text-grey-6 q-mb-md">Read-only shared view — data is stored locally in your browser</p>

      <TableGrid
        :items="data.items"
        :criteria="data.criteria"
        :scores="data.scores"
        :weighted-scores="weightedScores"
        :readonly="true"
      />
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useShareLink } from 'src/composables/useShareLink'
import { usePdfExport } from 'src/composables/usePdfExport'
import { useComparisonsStore } from 'src/stores/comparisons.store'
import TableGrid from 'src/components/ComparisonTable/TableGrid.vue'
import type { ComparisonData, WeightedScore } from 'src/types'

const router = useRouter()
const $q = useQuasar()
const { decodeFromUrl } = useShareLink()
const { exportToPdf } = usePdfExport()
const store = useComparisonsStore()

const data = ref<ComparisonData | null>(null)
const error = ref(false)

const weightedScores = computed<WeightedScore[]>(() => {
  if (!data.value) return []
  const { items, criteria, scores } = data.value
  const raw = items.map((item) => {
    let weightedSum = 0
    let totalWeight = 0
    criteria.forEach((cr) => {
      const s = scores.find((sc) => sc.itemId === item.id && sc.criterionId === cr.id)
      if (s?.score !== null && s?.score !== undefined) {
        weightedSum += s.score * cr.weight
        totalWeight += cr.weight
      }
    })
    return { itemId: item.id, score: totalWeight > 0 ? weightedSum / totalWeight : 0 }
  })
  const sorted = [...raw].sort((a, b) => b.score - a.score)
  return raw.map((r) => ({ ...r, rank: sorted.findIndex((s) => s.itemId === r.itemId) + 1 }))
})

onMounted(() => {
  const decoded = decodeFromUrl()
  if (!decoded) { error.value = true; return }
  data.value = decoded
})

function exportPdf(): void {
  if (!data.value) return
  exportToPdf(data.value, weightedScores.value)
}

function saveACopy(): void {
  if (!data.value) return
  const title = `${data.value.comparison.title} (copy)`
  const newComp = store.createComparison(title)
  const idMap = new Map<string, string>()

  data.value.items.forEach((it, i) => {
    const newId = crypto.randomUUID()
    idMap.set(it.id, newId)
    store.currentItems.push({ ...it, id: newId, comparisonId: newComp.id, position: i })
  })

  data.value.criteria.forEach((cr, i) => {
    const newCrId = crypto.randomUUID()
    idMap.set(cr.id, newCrId)
    store.currentCriteria.push({ ...cr, id: newCrId, comparisonId: newComp.id, position: i })
  })

  $q.notify({ type: 'positive', message: `"${title}" saved to your comparisons` })
  router.push(`/comparison/${newComp.id}`)
}
</script>
