<template>
  <q-page class="q-pa-lg">
    <!-- Free tier banner -->
    <q-banner
      v-if="!proStore.isPro && comparisons.length >= proStore.FREE_LIMIT"
      class="bg-warning text-dark q-mb-md"
      rounded
    >
      <template #avatar>
        <q-icon name="lock" />
      </template>
      Free tier: {{ proStore.FREE_LIMIT }} comparisons max. Upgrade to Pro for unlimited.
      <template #action>
        <q-btn flat label="Enable Pro (dev)" @click="proStore.enablePro()" />
      </template>
    </q-banner>

    <!-- Header actions -->
    <div class="row items-center q-mb-lg">
      <div class="text-h5 text-weight-bold">My Comparisons</div>
      <q-space />
      <q-btn
        color="primary"
        icon="add"
        label="New Comparison"
        :disable="!proStore.canCreateComparison(comparisons.length)"
        @click="createNew"
      />
    </div>

    <!-- Empty state -->
    <div v-if="comparisons.length === 0" class="column items-center q-mt-xl text-grey-6">
      <q-icon name="table_chart" size="80px" color="grey-4" />
      <div class="text-h6 q-mt-md">No comparisons yet</div>
      <p class="text-center">Create your first comparison or start from a template.</p>
      <div class="row q-gutter-md q-mt-sm">
        <q-btn
          color="primary"
          icon="add"
          label="New Comparison"
          @click="createNew"
        />
        <q-btn
          outline
          color="primary"
          icon="dashboard"
          label="Browse Templates"
          @click="router.push('/templates')"
        />
      </div>
    </div>

    <!-- Comparison cards -->
    <div v-else class="row q-gutter-md">
      <q-card
        v-for="c in comparisons"
        :key="c.id"
        class="comparison-card cursor-pointer col-12 col-sm-5 col-md-3"
        flat
        bordered
        @click="router.push(`/comparison/${c.id}`)"
      >
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold ellipsis">{{ c.title }}</div>
          <div class="text-caption text-grey-6 q-mt-xs">
            Updated {{ formatDate(c.updatedAt) }}
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn flat icon="open_in_new" label="Open" color="primary" size="sm" />
          <q-btn
            flat
            icon="delete"
            color="negative"
            size="sm"
            @click.stop="confirmDelete(c.id, c.title)"
          />
        </q-card-actions>
      </q-card>

      <!-- New card shortcut -->
      <q-card
        v-if="proStore.canCreateComparison(comparisons.length)"
        class="comparison-card col-12 col-sm-5 col-md-3 cursor-pointer dashed-card"
        flat
        bordered
        @click="createNew"
      >
        <q-card-section class="column items-center justify-center full-height q-py-xl text-grey-5">
          <q-icon name="add_circle_outline" size="40px" />
          <div class="q-mt-sm">New Comparison</div>
        </q-card-section>
      </q-card>
    </div>

    <!-- New comparison dialog -->
    <q-dialog v-model="newDialog">
      <q-card style="min-width: 360px">
        <q-card-section>
          <div class="text-h6">New Comparison</div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="newTitle"
            autofocus
            label="Title"
            placeholder="e.g. Laptop Comparison"
            @keydown.enter="confirmCreate"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="newDialog = false" />
          <q-btn color="primary" label="Create" :disable="!newTitle.trim()" @click="confirmCreate" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useComparisonsStore } from 'src/stores/comparisons.store'
import { useProStore } from 'src/stores/pro.store'
import { storeToRefs } from 'pinia'

const router = useRouter()
const $q = useQuasar()
const store = useComparisonsStore()
const proStore = useProStore()
const { comparisons } = storeToRefs(store)

const newDialog = ref(false)
const newTitle = ref('')

onMounted(() => { store.loadAll() })

function createNew(): void {
  newTitle.value = ''
  newDialog.value = true
}

function confirmCreate(): void {
  const title = newTitle.value.trim()
  if (!title) return
  const comparison = store.createComparison(title)
  newDialog.value = false
  router.push(`/comparison/${comparison.id}`)
}

function confirmDelete(id: string, title: string): void {
  $q.dialog({
    title: 'Delete Comparison',
    message: `Delete "${title}"? This cannot be undone.`,
    cancel: true,
    persistent: true,
  }).onOk(() => { store.deleteComparison(id) })
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
.comparison-card {
  min-height: 120px;
  transition: box-shadow 0.2s;
}
.comparison-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}
.dashed-card {
  border-style: dashed !important;
}
</style>
