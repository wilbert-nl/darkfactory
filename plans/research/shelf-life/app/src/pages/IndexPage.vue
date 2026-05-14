<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { usePantryStore, type PantryItem, type Urgency } from 'src/stores/pantry.store'

const $q = useQuasar()
const store = usePantryStore()

const showDialog = ref(false)

const categories = ['produce', 'dairy', 'meat', 'bakery', 'pantry', 'frozen', 'other']
const units = ['pcs', 'g', 'kg', 'ml', 'l']
const locations = ['fridge', 'freezer', 'pantry']

function blankForm() {
  const today = new Date()
  today.setDate(today.getDate() + 5)
  return {
    name: '',
    category: 'produce',
    quantity: 1,
    unit: 'pcs',
    location: 'fridge',
    bestBefore: today.toISOString().slice(0, 10),
    estValue: undefined as number | undefined
  }
}

const form = ref(blankForm())

function openDialog() {
  form.value = blankForm()
  showDialog.value = true
}

function addItem() {
  if (!form.value.name.trim()) {
    $q.notify({ type: 'negative', message: 'Please enter an item name' })
    return
  }
  store.addItem({ ...form.value, name: form.value.name.trim() })
  showDialog.value = false
  $q.notify({ type: 'positive', message: 'Item added to your pantry' })
}

function markUsed(item: PantryItem) {
  store.resolveItem(item.id, 'used')
  $q.notify({ type: 'positive', message: `Nice — used "${item.name}" in time` })
}

function markWasted(item: PantryItem) {
  store.resolveItem(item.id, 'wasted')
  $q.notify({ type: 'warning', message: `"${item.name}" logged as wasted` })
}

const urgencyColor: Record<Urgency, string> = {
  expired: 'negative',
  soon: 'warning',
  fresh: 'positive'
}

function expiryLabel(item: PantryItem): string {
  const days = store.daysUntilExpiry(item.bestBefore)
  if (days < 0) return `Expired ${-days}d ago`
  if (days === 0) return 'Best before today'
  if (days === 1) return '1 day left'
  return `${days} days left`
}
</script>

<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-weight-bold">My Pantry</div>
      <q-btn color="primary" icon="add" label="Add Item" @click="openDialog" />
    </div>

    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-6 col-sm-3">
        <q-card flat bordered>
          <q-card-section class="text-center">
            <div class="text-h4 text-primary">{{ store.activeItems.length }}</div>
            <div class="text-caption text-grey">In pantry</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-3">
        <q-card flat bordered>
          <q-card-section class="text-center">
            <div class="text-h4 text-warning">{{ store.expiringSoonCount }}</div>
            <div class="text-caption text-grey">Need using</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-3">
        <q-card flat bordered>
          <q-card-section class="text-center">
            <div class="text-h4 text-positive">{{ store.savedValue.toFixed(0) }}</div>
            <div class="text-caption text-grey">Value saved</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-3">
        <q-card flat bordered>
          <q-card-section class="text-center">
            <div class="text-h4 text-negative">{{ store.wastedValue.toFixed(0) }}</div>
            <div class="text-caption text-grey">Value wasted</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div v-if="store.activeItems.length === 0" class="column items-center q-mt-xl text-grey">
      <q-icon name="kitchen" size="64px" />
      <div class="text-h6 q-mt-md">Your pantry is empty</div>
      <div class="text-body2">Tap "Add Item" to start tracking what's in your kitchen</div>
    </div>

    <q-list v-else bordered separator class="rounded-borders">
      <q-item v-for="item in store.activeItems" :key="item.id">
        <q-item-section avatar>
          <q-icon name="circle" :color="urgencyColor[store.urgency(item)]" size="16px" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-medium">{{ item.name }}</q-item-label>
          <q-item-label caption>
            {{ item.quantity }} {{ item.unit }} · {{ item.category }} · {{ item.location }}
          </q-item-label>
          <div class="q-mt-xs">
            <q-chip
              dense
              size="sm"
              :color="urgencyColor[store.urgency(item)]"
              text-color="white"
              :label="expiryLabel(item)"
            />
          </div>
        </q-item-section>
        <q-item-section side>
          <div class="row q-gutter-xs">
            <q-btn flat dense round icon="check_circle" color="positive" @click="markUsed(item)">
              <q-tooltip>Mark used</q-tooltip>
            </q-btn>
            <q-btn flat dense round icon="delete_outline" color="negative" @click="markWasted(item)">
              <q-tooltip>Mark wasted</q-tooltip>
            </q-btn>
            <q-btn flat dense round icon="close" color="grey" @click="store.deleteItem(item.id)">
              <q-tooltip>Remove</q-tooltip>
            </q-btn>
          </div>
        </q-item-section>
      </q-item>
    </q-list>

    <div class="text-caption text-grey q-mt-lg">
      ShelfLife tracks best-before dates as guidance only. It does not certify whether food is
      safe to eat — always use your own judgement.
    </div>

    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 340px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Add Pantry Item</div>
        </q-card-section>

        <q-card-section class="q-gutter-sm">
          <q-input v-model="form.name" label="Item name *" outlined dense placeholder="e.g. Spinach" />
          <div class="row q-gutter-sm">
            <q-input
              v-model.number="form.quantity"
              label="Quantity"
              type="number"
              outlined
              dense
              class="col"
              min="0"
            />
            <q-select v-model="form.unit" :options="units" label="Unit" outlined dense class="col" />
          </div>
          <div class="row q-gutter-sm">
            <q-select
              v-model="form.category"
              :options="categories"
              label="Category"
              outlined
              dense
              class="col"
            />
            <q-select
              v-model="form.location"
              :options="locations"
              label="Location"
              outlined
              dense
              class="col"
            />
          </div>
          <q-input v-model="form.bestBefore" label="Best before" type="date" outlined dense />
          <q-input
            v-model.number="form.estValue"
            label="Estimated value (optional)"
            type="number"
            outlined
            dense
            min="0"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Add Item" @click="addItem" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>
