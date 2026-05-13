<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-lg">
      <q-btn flat round icon="arrow_back" @click="router.push('/')" />
      <div class="text-h5 text-weight-bold q-ml-sm">Templates</div>
    </div>

    <p class="text-grey-7 q-mb-lg">Start a comparison from a pre-built template.</p>

    <div class="row q-gutter-md">
      <q-card
        v-for="tmpl in TEMPLATES"
        :key="tmpl.id"
        class="template-card col-12 col-sm-5 col-md-3 cursor-pointer"
        flat
        bordered
        @click="useTemplate(tmpl)"
      >
        <q-card-section class="column items-center q-py-lg">
          <q-icon :name="tmpl.icon" size="48px" color="primary" />
          <div class="text-subtitle1 text-weight-bold q-mt-sm text-center">{{ tmpl.name }}</div>
          <div class="text-caption text-grey-6 text-center q-mt-xs">{{ tmpl.description }}</div>
        </q-card-section>
        <q-separator />
        <q-card-section class="text-caption text-grey-6">
          {{ tmpl.defaultItems.length }} items · {{ tmpl.defaultCriteria.length }} criteria
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useComparisonsStore } from 'src/stores/comparisons.store'
import { useProStore } from 'src/stores/pro.store'
import { useQuasar } from 'quasar'
import { TEMPLATES } from 'src/data/templates'
import type { Template } from 'src/types'

const router = useRouter()
const store = useComparisonsStore()
const proStore = useProStore()
const $q = useQuasar()

function useTemplate(tmpl: Template): void {
  if (!proStore.canCreateComparison(store.comparisons.length)) {
    $q.notify({ type: 'warning', message: 'Free tier limit reached. Upgrade to Pro.' })
    return
  }
  const comparison = store.createComparison(tmpl.name)
  store.loadComparison(comparison.id)

  tmpl.defaultItems.forEach((name, i) => {
    const item = store.addItem(comparison.id, name)
    store.currentItems[i] = item
  })
  tmpl.defaultCriteria.forEach((cr) => {
    const criterion = store.addCriterion(comparison.id, cr.name)
    store.setWeight(criterion.id, cr.weight)
  })

  router.push(`/comparison/${comparison.id}`)
}
</script>

<style scoped>
.template-card {
  transition: box-shadow 0.2s;
}
.template-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}
</style>
